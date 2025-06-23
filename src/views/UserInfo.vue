<template>
  <div class="user-info">
    <h2>用户信息</h2>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="info-container">
      <div class="info-item">
        <span class="label">已绑定终端:</span>
        <span class="value">{{ userInfo && userInfo.is_bound ? '是' : '否' }}</span>
      </div>
      <div class="info-item">
        <span class="label">终端在线:</span>
        <span class="value">{{ userInfo && userInfo.is_online ? '是' : '否' }}</span>
      </div>
      <div class="info-item">
        <span class="label">携程绑定:</span>
        <span class="value">
          <template v-if="ctripStateLoading">查询中...</template>
          <template v-else-if="ctripStateError">{{ ctripStateError }}</template>
          <template v-else>
            <span v-if="ctripState && ctripState.available">已绑定</span>
            <span v-else>未绑定
              <button class="bind-btn" @click="showQrcode = true">绑定携程</button>
            </span>
          </template>
        </span>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQrcode" class="qrcode-modal">
      <div class="qrcode-content">
        <h3>扫码绑定携程</h3>
        <div v-if="qrcodeLoading">二维码加载中...</div>
        <div v-else-if="qrcodeError">{{ qrcodeError }}</div>
        <img v-else :src="qrcodeImg" alt="携程二维码" class="qrcode-img" />
        <div class="qrcode-actions">
          <button @click="refreshCtripState">已完成绑定</button>
          <button @click="closeQrcode">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfo, getCtripState, getCtripQrcode } from '../api/api';

export default {
  name: 'UserInfo',
  data() {
    return {
      userInfo: null,
      loading: true,
      error: null,
      // 携程相关
      ctripState: null,
      ctripStateLoading: true,
      ctripStateError: null,
      showQrcode: false,
      qrcodeImg: '',
      qrcodeLoading: false,
      qrcodeError: null
    };
  },
  async created() {
    await this.fetchUserInfo();
    await this.fetchCtripState();
  },
  watch: {
    showQrcode(val) {
      if (val) {
        this.loadQrcode();
      }
    }
  },
  methods: {
    async fetchUserInfo() {
      this.loading = true;
      try {
        const response = await getUserInfo();
        this.userInfo = response;
      } catch (err) {
        this.error = '获取用户信息失败';
      } finally {
        this.loading = false;
      }
    },
    async fetchCtripState() {
      this.ctripStateLoading = true;
      this.ctripStateError = null;
      try {
        const res = await getCtripState();
        this.ctripState = res;
      } catch (err) {
        this.ctripStateError = '获取携程绑定状态失败';
      } finally {
        this.ctripStateLoading = false;
      }
    },
    async loadQrcode() {
      this.qrcodeLoading = true;
      this.qrcodeError = null;
      this.qrcodeImg = '';
      try {
        const res = await getCtripQrcode();
        // 将二进制图片转为base64
        const base64 = btoa(
          new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        this.qrcodeImg = `data:image/png;base64,${base64}`;
      } catch (err) {
        this.qrcodeError = '二维码获取失败';
      } finally {
        this.qrcodeLoading = false;
      }
    },
    closeQrcode() {
      this.showQrcode = false;
    },
    async refreshCtripState() {
      await this.fetchCtripState();
      if (this.ctripState && this.ctripState.available) {
        this.showQrcode = false;
      }
    }
  }
};
</script>

<style scoped>
.user-info {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.info-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  min-width: 120px;
  color: #666;
}

.value {
  color: #333;
}

.bind-btn {
  margin-left: 10px;
  padding: 4px 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.qrcode-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.qrcode-content {
  background: #fff;
  padding: 30px 40px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
}
.qrcode-img {
  width: 200px;
  height: 200px;
  margin: 20px 0;
}
.qrcode-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.qrcode-actions button {
  padding: 6px 18px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}
</style> 