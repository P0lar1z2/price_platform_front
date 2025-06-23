import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://www.edfgaad.xyz"
      : "http://localhost:8001", // 替换为您的后端API地址
  timeout: 50000,
  withCredentials: true,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const login = (data) => {
  return api.post("/api/login", data);
};

export const logout = () => {
  return api.post("/api/logout");
};

export const getUserInfo = () => {
  return api.get("/api/endpoint/state");
};

export const getCtripState = () => {
  return api.get('/api/ctrip/state');
};

export const getCtripQrcode = () => {
  return api.get('/api/ctrip/qrcode', { responseType: 'arraybuffer' });
};
