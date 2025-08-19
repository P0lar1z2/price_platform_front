<template>
  <v-app>
    <v-main>
      <div class="startup-container">
        <!-- 成功图标和标题 -->
        <div class="success-header">
          <v-icon class="success-icon">mdi-check-circle</v-icon>
          <div class="success-title">安装成功！</div>
          <div class="success-subtitle">
            {{ extensionInfo.name }}已成功安装并启动
          </div>
        </div>

        <!-- 飞书登录卡片 -->
        <v-card class="info-card" elevation="2" v-if="!isLoggedIn">
          <v-card-title class="text-h6 pa-4 pb-2">
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            飞书登录
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <div class="qr-login-container">
              <div v-if="qrCodeLoading" class="text-center py-4">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
                <div class="mt-2">正在加载二维码...</div>
              </div>

              <div class="qr-code-wrapper">
                <div
                  id="feishu_qr_login"
                  class="qr-code-container"
                  :style="{ display: qrCodeLoading ? 'none' : 'flex' }"
                ></div>
              </div>
              <div class="qr-instructions" v-if="!qrCodeLoading">
                <p class="text-center text-body-2 text-grey-darken-1">
                  请使用飞书扫描二维码登录
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 用户信息卡片 (登录后显示) -->
        <v-card class="info-card" elevation="2" v-if="isLoggedIn">
          <v-card-title class="text-h6 pa-4 pb-2">
            <v-icon class="mr-2">mdi-account-check</v-icon>
            用户信息
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <div class="status-item">
              <span class="status-label">登录状态:</span>
              <v-chip color="success" size="small">
                <v-icon start>mdi-check</v-icon>
                已登录
              </v-chip>
            </div>
            <div class="status-item" v-if="userInfo.name">
              <span class="status-label">用户名:</span>
              <span>{{ userInfo.name }}</span>
            </div>
            <div class="status-item" v-if="userInfo.email">
              <span class="status-label">邮箱:</span>
              <span>{{ userInfo.email }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- 扩展信息卡片 -->
        <v-card class="info-card" elevation="2">
          <v-card-title class="text-h6 pa-4 pb-2">
            <v-icon class="mr-2">mdi-information</v-icon>
            扩展信息
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <div v-if="loading" class="text-center py-4">
              <v-progress-circular
                indeterminate
                color="primary"
                size="24"
              ></v-progress-circular>
              <div class="mt-2">正在加载...</div>
            </div>

            <div v-else>
              <div class="status-item">
                <span class="status-label">扩展名称:</span>
                <span>{{ extensionInfo.name }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">版本:</span>
                <span>{{ extensionInfo.version }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">状态:</span>
                <v-chip color="success" size="small">
                  <v-icon start>mdi-check</v-icon>
                  运行中
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 操作按钮 -->
        <v-card class="info-card" elevation="2">
          <v-card-title class="text-h6 pa-4 pb-2">
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            开始使用
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <div class="action-buttons">
              <v-btn
                color="primary"
                @click="openPopup"
                prepend-icon="mdi-window-maximize"
                block
              >
                打开控制面板
              </v-btn>
            </div>

            <div class="action-buttons" v-if="isLoggedIn">
              <v-btn
                color="warning"
                @click="logout"
                prepend-icon="mdi-logout"
                variant="outlined"
                block
              >
                退出登录
              </v-btn>
            </div>

            <div class="action-buttons">
              <v-btn
                color="success"
                @click="closeStartupPage"
                prepend-icon="mdi-close"
                variant="outlined"
                block
              >
                关闭此页面
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 状态提示 -->
        <v-snackbar
          v-model="showStatus"
          :color="statusType"
          :timeout="3000"
          location="top"
        >
          {{ statusMessage }}
          <template v-slot:actions>
            <v-btn variant="text" @click="showStatus = false"> 关闭 </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import feishuConfig from "../config/feishu.js";

export default {
  name: "StartupApp",
  data() {
    return {
      loading: true,
      qrCodeLoading: true,
      isLoggedIn: false,
      userInfo: {
        name: "",
        email: "",
        accessToken: "",
      },
      extensionInfo: {
        name: "OTA 监控扩展",
        version: "1.0.0",
      },
      showStatus: false,
      statusMessage: "",
      statusType: "success",
      // 飞书配置
      feishuState: feishuConfig.generateState(),
      qrLoginObj: null,
    };
  },
  async mounted() {
    await this.loadExtensionInfo();
    await this.checkLoginStatus();

    // 检查URL参数，看是否有登录成功的标识
    this.checkLoginCallback();

    if (!this.isLoggedIn) {
      // 使用 nextTick 确保DOM完全渲染后再初始化二维码
      this.$nextTick(async () => {
        await this.initFeishuQRLogin();
      });
    }
  },
  beforeUnmount() {
    // 清理事件监听器
    if (this.handleMessage) {
      window.removeEventListener("message", this.handleMessage);
    }
  },
  methods: {
    // 加载扩展信息
    async loadExtensionInfo() {
      try {
        // 检查Chrome API是否可用
        if (
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.getManifest
        ) {
          const manifest = chrome.runtime.getManifest();
          if (manifest && manifest.name) {
            this.extensionInfo = {
              name: manifest.name,
              version: manifest.version || "1.0.0",
            };
            console.log("扩展信息加载成功:", this.extensionInfo);
          }
        }
      } catch (error) {
        console.error("加载扩展信息失败:", error);
        // 保持默认值
        console.log("使用默认扩展信息:", this.extensionInfo);
      } finally {
        this.loading = false;
      }
    },

    // 检查登录状态
    async checkLoginStatus() {
      try {
        // 从localStorage检查登录状态
        const savedUserInfo = localStorage.getItem(
          feishuConfig.tokenStorageKey
        );
        if (savedUserInfo) {
          const userInfo = JSON.parse(savedUserInfo);
          // 验证token是否有效
          if (
            userInfo.accessToken &&
            (await this.validateToken(userInfo.accessToken))
          ) {
            this.userInfo = userInfo;
            this.isLoggedIn = true;
            console.log("用户已登录:", this.userInfo);
          } else {
            // token无效，清除本地存储
            localStorage.removeItem(feishuConfig.tokenStorageKey);
          }
        }
      } catch (error) {
        console.error("检查登录状态失败:", error);
      }
    },

    // 验证token有效性
    async validateToken(accessToken) {
      try {
        // 这里应该调用飞书API验证token
        // 暂时返回true，实际应该调用飞书用户信息接口
        console.log("验证token:", accessToken);
        return true;
      } catch (error) {
        console.error("验证token失败:", error);
        return false;
      }
    },

    // 检查登录回调
    checkLoginCallback() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const loginSuccess = urlParams.get("login_success");
        const userInfo = urlParams.get("user_info");

        if (loginSuccess === "true" && userInfo) {
          // 解析用户信息
          const decodedUserInfo = JSON.parse(decodeURIComponent(userInfo));
          this.handleLoginSuccess(decodedUserInfo);

          // 清理URL参数
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (error) {
        console.error("检查登录回调失败:", error);
      }
    },

    // 初始化飞书二维码登录
    async initFeishuQRLogin() {
      try {
        console.log("开始初始化飞书二维码登录...");

        // 等待二维码容器渲染
        await this.waitForContainer(feishuConfig.qrCodeSDK.containerId);
        console.log("二维码容器检查通过");

        // 等待SDK加载
        await this.waitForFeishuSDK();

        // 构建授权URL
        const gotoUrl = feishuConfig.buildAuthUrl(this.feishuState);
        console.log("授权URL:", gotoUrl);

        // 检查必要参数
        console.log("二维码初始化参数:", {
          id: feishuConfig.qrCodeSDK.containerId,
          goto: gotoUrl,
          width: feishuConfig.qrCodeSDK.width,
          height: feishuConfig.qrCodeSDK.height,
          style: feishuConfig.qrCodeSDK.style,
        });

        // 初始化二维码
        this.qrLoginObj = window.QRLogin({
          id: feishuConfig.qrCodeSDK.containerId,
          goto: gotoUrl,
          width: feishuConfig.qrCodeSDK.width,
          height: feishuConfig.qrCodeSDK.height,
          style: feishuConfig.qrCodeSDK.style,
        });

        console.log("QRLogin对象:", this.qrLoginObj);

        // 监听扫码事件
        this.setupMessageListener();

        this.qrCodeLoading = false;
        console.log("飞书二维码登录初始化完成");
      } catch (error) {
        console.error("初始化飞书二维码登录失败:", error);
        this.qrCodeLoading = false;
        this.showStatusMessage(`二维码加载失败: ${error.message}`, "error");
      }
    },

    // 等待DOM容器渲染
    waitForContainer(containerId) {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30; // 3秒超时

        const checkContainer = () => {
          const container = document.getElementById(containerId);
          console.log(
            `检查容器 ${containerId}... 尝试 ${attempts + 1}/${maxAttempts}`,
            container
          );

          if (container) {
            console.log("容器找到:", container);
            resolve(container);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkContainer, 100);
          } else {
            console.error(`容器 ${containerId} 未找到`);
            reject(new Error(`二维码容器未找到: ${containerId}`));
          }
        };

        checkContainer();
      });
    },

    // 等待飞书SDK加载
    waitForFeishuSDK() {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5秒超时

        const checkSDK = () => {
          console.log(`检查飞书SDK... 尝试 ${attempts + 1}/${maxAttempts}`);

          if (window.QRLogin) {
            console.log("飞书SDK加载成功");
            resolve();
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkSDK, 100);
          } else {
            console.error("飞书SDK加载超时");
            reject(new Error("飞书SDK加载超时，请检查网络连接或SDK地址"));
          }
        };

        checkSDK();
      });
    },

    // 设置消息监听器
    setupMessageListener() {
      this.handleMessage = (event) => {
        console.log("收到消息:", event);

        // 使用SDK提供的方法验证消息来源和数据
        if (
          this.qrLoginObj &&
          this.qrLoginObj.matchOrigin(event.origin) &&
          this.qrLoginObj.matchData(event.data)
        ) {
          const loginTmpCode = event.data.tmp_code;
          console.log("获取到临时授权码:", loginTmpCode);

          // 构建完整的授权URL
          const gotoUrl = feishuConfig.buildAuthUrl(this.feishuState);
          const finalUrl = `${gotoUrl}&tmp_code=${loginTmpCode}`;

          console.log("跳转到授权页面:", finalUrl);

          // 跳转到授权页面
          window.location.href = finalUrl;
        }
      };

      // 添加事件监听器
      if (typeof window.addEventListener !== "undefined") {
        window.addEventListener("message", this.handleMessage, false);
      } else if (typeof window.attachEvent !== "undefined") {
        window.attachEvent("onmessage", this.handleMessage);
      }
    },

    // 处理登录成功（由后端回调后调用）
    handleLoginSuccess(userInfo) {
      this.userInfo = {
        name: userInfo.name || "",
        email: userInfo.email || "",
        accessToken: userInfo.accessToken || "",
      };

      // 保存到本地存储
      localStorage.setItem(
        feishuConfig.tokenStorageKey,
        JSON.stringify(this.userInfo)
      );

      this.isLoggedIn = true;
      this.showStatusMessage("登录成功！", "success");

      console.log("用户登录成功:", this.userInfo);
    },

    // 退出登录
    logout() {
      this.userInfo = {
        name: "",
        email: "",
        accessToken: "",
      };
      this.isLoggedIn = false;

      // 清除本地存储
      localStorage.removeItem(feishuConfig.tokenStorageKey);

      // 重新初始化二维码
      this.qrCodeLoading = true;
      this.$nextTick(() => {
        this.initFeishuQRLogin();
      });

      this.showStatusMessage("已退出登录", "info");
    },

    // 打开popup
    openPopup() {
      try {
        chrome.action.openPopup();
        this.showStatusMessage("正在打开控制面板...", "info");
      } catch (error) {
        console.error("打开popup失败:", error);
        this.showStatusMessage("打开控制面板失败", "error");
      }
    },

    // 关闭startup页面
    closeStartupPage() {
      window.close();
    },

    // 显示状态消息
    showStatusMessage(message, type = "success") {
      this.statusMessage = message;
      this.statusType = type;
      this.showStatus = true;
    },
  },
};
</script>

<style>
.startup-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 40px;
}

.success-header {
  text-align: center;
  margin-bottom: 32px;
}

.success-icon {
  font-size: 64px;
  color: #4caf50;
  margin-bottom: 16px;
}

.success-title {
  font-size: 24px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 16px;
  color: #666;
}

.info-card {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
}

/* 飞书二维码登录样式 */
/* 飞书二维码登录样式 */
.qr-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

/* 二维码容器美化 */
.qr-code-container {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}



.qr-instructions {
  width: 100%;
  text-align: center;
  margin-top: 8px;
}

.qr-instructions p {
  margin: 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 二维码iframe美化 */
#feishu_qr_login iframe {
  border-radius: 8px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 确保应用背景 */
.v-application {
  background: #f5f5f5 !important;
}



/* 加载状态美化 */
.qr-login-container .text-center {
  padding: 40px 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.qr-login-container .v-progress-circular {
  margin-bottom: 16px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .startup-container {
    padding: 20px 16px;
    padding-top: 20px;
  }

  .qr-code-wrapper {
    padding: 12px;
    margin-bottom: 16px;
  }

  .qr-login-container {
    padding: 16px 0;
  }



  .success-header {
    margin-bottom: 20px;
  }

  .info-card {
    margin-bottom: 16px;
  }
}
</style>
