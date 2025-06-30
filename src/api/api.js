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

export const getEndpointState = () => {
  return api.get("/api/endpoint/state");
};

export const getCtripState = () => {
  return api.get('/api/ctrip/state');
};

export const getCtripQrcode = () => {
  return api.get('/api/ctrip/qrcode', { responseType: 'arraybuffer' });
};

// 配对管理接口
export const addPair = (data) => {
  return api.post('/api/pair', data);
};

export const getPairs = () => {
  return api.get('/api/pair');
};

export const deletePair = (data) => {
  return api.delete('/api/pair', { data });
};

// 个人配对管理接口
export const addMyPair = (data) => {
  return api.post('/api/pair/my', data);
};

export const getMyPairs = () => {
  return api.get('/api/pair/my');
};

export const deleteMyPair = (data) => {
  return api.delete('/api/pair/my', { data });
};

// 携程酒店链接校验函数
export const validateCtripHotelUrl = (url) => {
  try {
    // 检查是否是有效的URL
    const urlObj = new URL(url);
    
    // 检查是否是携程酒店域名
    if (!urlObj.hostname.includes('hotels.ctrip.com')) {
      return {
        isValid: false,
        hotelId: null,
        error: '不是有效的携程酒店链接'
      };
    }
    
    // 检查路径是否包含hotels/detail
    if (!urlObj.pathname.includes('/hotels/detail/')) {
      return {
        isValid: false,
        hotelId: null,
        error: '不是有效的携程酒店详情页链接'
      };
    }
    
    // 获取hotelId参数
    const hotelId = urlObj.searchParams.get('hotelId');
    
    if (!hotelId) {
      return {
        isValid: false,
        hotelId: null,
        error: '链接中缺少hotelId参数'
      };
    }
    
    // 检查hotelId是否为数字
    if (!/^\d+$/.test(hotelId)) {
      return {
        isValid: false,
        hotelId: null,
        error: 'hotelId必须是数字'
      };
    }
    
    return {
      isValid: true,
      hotelId: parseInt(hotelId),
      error: null
    };
    
  } catch (error) {
    return {
      isValid: false,
      hotelId: null,
      error: '无效的URL格式'
    };
  }
};

// 获取酒店可用性数据
export const getHotelAvailability = (hotelId) => {
  return api.get(`/api/ctrip/hotel/${hotelId}/availability`);
};
