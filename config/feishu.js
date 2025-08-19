// 飞书配置文件
const feishuConfig = {
  // 后端API配置
  backendApi: {
    baseUrl:
      process.env.NODE_ENV === "production"
        ? "https://www.edfgaad.xyz"
        : "http://127.0.0.1:8001",
    loginUrl: "/api/feishu/login",
    callbackUrl: "/api/feishu/callback",
    userInfoUrl: "/api/feishu/userinfo",
    logoutUrl: "/api/feishu/logout",
  },

  // 前端展示配置
  appDisplayName: "OTA 监控扩展",

  // 权限范围（仅用于展示）
  // scope: "contact:user.base:readonly",

  // 二维码SDK配置
  qrCodeSDK: {
    containerId: "feishu_qr_login",
    width: 250,
    height: 250,
    style: "width:258px;height:258px;margin:0 auto;",
  },
  appId: "cli_a82807a1cb31900b",
  // 本地存储键名
  tokenStorageKey: "feishu_user_token",

  // 生成随机状态码
  generateState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },

  // 构建授权URL（用于二维码生成）
  buildAuthUrl(state) {
    // 这里返回后端提供的授权URL，或者使用默认的飞书授权地址
    const authUrl = "https://passport.feishu.cn/suite/passport/oauth/authorize";
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: `${this.backendApi.baseUrl}${this.backendApi.callbackUrl}`,
      response_type: "code",
      state: state,
    });

    return `${authUrl}?${params.toString()}`;
  },

  // 调用后端登录接口
  async initiateLogin() {
    try {
      const response = await fetch(
        `${this.backendApi.baseUrl}${this.backendApi.loginUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("发起登录失败:", error);
      throw error;
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const response = await fetch(
        `${this.backendApi.baseUrl}${this.backendApi.userInfoUrl}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      throw error;
    }
  },

  // 退出登录
  async logout() {
    try {
      const response = await fetch(
        `${this.backendApi.baseUrl}${this.backendApi.logoutUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("退出登录失败:", error);
      throw error;
    }
  },
};

export default feishuConfig;
