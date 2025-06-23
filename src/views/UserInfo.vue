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

    <!-- 配对管理 -->
    <div class="pairs-container">
      <h3>配对管理</h3>
      <div class="pairs-actions">
        <v-text-field
          v-model="newPair.ctrip_id_1"
          label="携程ID 1"
          density="compact"
          class="input-field"
        ></v-text-field>
        <v-text-field
          v-model="newPair.ctrip_id_2"
          label="携程ID 2"
          density="compact"
          class="input-field"
        ></v-text-field>
        <v-btn color="primary" @click="handleAddPair" :loading="addingPair">
          添加配对
        </v-btn>
      </div>
      <v-table>
        <thead>
          <tr>
            <th>携程ID 1</th>
            <th>携程ID 2</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingPairs">
            <td colspan="3" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="pairs.length === 0">
            <td colspan="3" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="pair in pairs" :key="pair.ctrip_id_1 + pair.ctrip_id_2">
            <td>{{ pair.ctrip_id_1 }}</td>
            <td>{{ pair.ctrip_id_2 }}</td>
            <td>
              <v-btn
                color="error"
                size="small"
                variant="text"
                @click="handleDeletePair(pair)"
                :loading="deletingPair === pair.ctrip_id_1 + pair.ctrip_id_2"
              >
                删除
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- 个人配对管理 -->
    <div class="pairs-container">
      <h3>个人配对管理</h3>
      <div class="pairs-actions">
        <v-text-field
          v-model="newMyPair.ctrip_id"
          label="携程ID"
          density="compact"
          class="input-field"
        ></v-text-field>
        <v-btn color="primary" @click="handleAddMyPair" :loading="addingMyPair">
          添加个人配对
        </v-btn>
      </div>
      <v-table>
        <thead>
          <tr>
            <th>携程ID</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingMyPairs">
            <td colspan="2" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="myPairs.length === 0">
            <td colspan="2" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="pair in myPairs" :key="pair.ctrip_id">
            <td>{{ pair.ctrip_id }}</td>
            <td>
              <v-btn
                color="error"
                size="small"
                variant="text"
                @click="handleDeleteMyPair(pair)"
                :loading="deletingMyPair === pair.ctrip_id"
              >
                删除
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
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
import { 
  getUserInfo, 
  getCtripState, 
  getCtripQrcode,
  addPair,
  getPairs,
  deletePair,
  addMyPair,
  getMyPairs,
  deleteMyPair
} from '../api/api';

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
      qrcodeError: null,
      // 配对管理
      pairs: [],
      loadingPairs: false,
      addingPair: false,
      deletingPair: null,
      newPair: {
        ctrip_id_1: '',
        ctrip_id_2: ''
      },
      // 个人配对管理
      myPairs: [],
      loadingMyPairs: false,
      addingMyPair: false,
      deletingMyPair: null,
      newMyPair: {
        ctrip_id: ''
      }
    };
  },
  async created() {
    await this.fetchUserInfo();
    await this.fetchCtripState();
    await this.fetchPairs();
    await this.fetchMyPairs();
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
    },
    async fetchPairs() {
      this.loadingPairs = true;
      try {
        const response = await getPairs();
        this.pairs = response;
      } catch (err) {
        console.error('获取配对列表失败:', err);
      } finally {
        this.loadingPairs = false;
      }
    },
    async handleAddPair() {
      if (!this.newPair.ctrip_id_1 || !this.newPair.ctrip_id_2) {
        return;
      }
      this.addingPair = true;
      try {
        await addPair(this.newPair);
        await this.fetchPairs();
        this.newPair.ctrip_id_1 = '';
        this.newPair.ctrip_id_2 = '';
      } catch (err) {
        console.error('添加配对失败:', err);
      } finally {
        this.addingPair = false;
      }
    },
    async handleDeletePair(pair) {
      this.deletingPair = pair.ctrip_id_1 + pair.ctrip_id_2;
      try {
        await deletePair({
          ctrip_id_1: pair.ctrip_id_1,
          ctrip_id_2: pair.ctrip_id_2
        });
        await this.fetchPairs();
      } catch (err) {
        console.error('删除配对失败:', err);
      } finally {
        this.deletingPair = null;
      }
    },
    async fetchMyPairs() {
      this.loadingMyPairs = true;
      try {
        const response = await getMyPairs();
        this.myPairs = response;
      } catch (err) {
        console.error('获取个人配对列表失败:', err);
      } finally {
        this.loadingMyPairs = false;
      }
    },
    async handleAddMyPair() {
      if (!this.newMyPair.ctrip_id) {
        return;
      }
      this.addingMyPair = true;
      try {
        await addMyPair(this.newMyPair);
        await this.fetchMyPairs();
        this.newMyPair.ctrip_id = '';
      } catch (err) {
        console.error('添加个人配对失败:', err);
      } finally {
        this.addingMyPair = false;
      }
    },
    async handleDeleteMyPair(pair) {
      this.deletingMyPair = pair.ctrip_id;
      try {
        await deleteMyPair({
          ctrip_id: pair.ctrip_id
        });
        await this.fetchMyPairs();
      } catch (err) {
        console.error('删除个人配对失败:', err);
      } finally {
        this.deletingMyPair = null;
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

.pairs-container {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pairs-container h3 {
  margin-bottom: 20px;
  color: #333;
}

.pairs-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.input-field {
  max-width: 200px;
}

:deep(.v-table) {
  border-radius: 8px;
  border: 1px solid #eee;
}

:deep(.v-table th) {
  font-weight: bold;
  background: #f5f5f5;
  text-align: left;
}

:deep(.v-table td) {
  height: 48px;
}

.text-center {
  text-align: center;
}
</style> 