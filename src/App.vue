<template>
  <v-app>
    <v-main>
      <div class="login-container">
        <!-- 登录标题 -->
        <div class="login-header">
          <v-icon class="login-icon">mdi-account-circle</v-icon>
          <div class="login-title">飞书登录</div>
          <div class="login-subtitle">请使用飞书扫描二维码完成登录</div>
        </div>

        <!-- 飞书登录卡片 -->
        <v-card class="login-card" elevation="2">
          <v-card-text class="pa-6">
            <div class="qr-login-container">
              <div v-if="qrCodeLoading" class="text-center py-4">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                ></v-progress-circular>
                <div class="mt-3 text-body-1">正在加载二维码...</div>
              </div>

              <div class="qr-code-wrapper">
                <div
                  id="feishu_qr_login"
                  class="qr-code-container"
                  :style="{ display: qrCodeLoading ? 'none' : 'flex' }"
                ></div>
              </div>
              <div class="qr-instructions" v-if="!qrCodeLoading">
                <p class="text-center text-body-1">
                  请使用飞书扫描二维码登录
                </p>
              </div>
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
  name: "LoginApp",
  data() {
    return {
      qrCodeLoading: true,
      showStatus: false,
      statusMessage: "",
      statusType: "success",
      // URL参数
      uuid: "",
      // 飞书配置
      feishuState: feishuConfig.generateState(),
      qrLoginObj: null,
    };
  },
  async mounted() {
    // 解析URL参数
    this.parseUrlParams();

    // 初始化二维码
    this.$nextTick(async () => {
      await this.initFeishuQRLogin();
    });
  },
  beforeUnmount() {
    // 清理事件监听器
    if (this.handleMessage) {
      window.removeEventListener("message", this.handleMessage);
    }
  },
  methods: {
    // 解析URL参数
    parseUrlParams() {
      console.log('🔍 开始解析URL参数...');
      console.log('📍 当前URL:', window.location.href);
      console.log('🔗 查询字符串:', window.location.search);

      const urlParams = new URLSearchParams(window.location.search);
      this.uuid = urlParams.get('uuid') || '';

      console.log('📥 解析结果:', {
        uuid: this.uuid
      });

      if (!this.uuid) {
        console.warn('⚠️ 缺少UUID参数');
        this.showStatusMessage('缺少必要的UUID参数', 'error');
      } else {
        console.log('✅ UUID参数正常:', this.uuid);
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

        // 构建授权URL，只传递uuid参数
        const gotoUrl = feishuConfig.buildAuthUrl(this.feishuState, this.uuid);
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
          const gotoUrl = feishuConfig.buildAuthUrl(this.feishuState, this.uuid);
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
.login-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-icon {
  font-size: 72px;
  color: #1976d2;
  margin-bottom: 20px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.login-card {
  border-radius: 16px;
  overflow: hidden;
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
}

/* 二维码iframe美化 */
#feishu_qr_login iframe {
  border-radius: 8px !important;
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
  .login-container {
    padding: 20px 16px;
    justify-content: flex-start;
    padding-top: 40px;
  }

  .login-header {
    margin-bottom: 30px;
  }

  .login-icon {
    font-size: 60px;
    margin-bottom: 16px;
  }

  .login-title {
    font-size: 24px;
  }



  .qr-code-wrapper {
    padding: 12px;
    margin-bottom: 16px;
  }

  .qr-login-container {
    padding: 16px 0;
  }
}
</style>
