<template>
  <div class="user-info">
    <h2>用户信息</h2>

    <!-- 测试区域 -->
    <!-- <div class="test-container">
      <h3>链接校验测试</h3>
      <div class="test-input">
        <v-text-field v-model="testUrl" label="测试携程酒店链接" placeholder="请输入携程酒店详情页链接进行测试" density="compact"
          class="test-field"></v-text-field>
        <v-btn color="secondary" @click="testValidation">测试校验</v-btn>
      </div>
      <div v-if="testResult" class="test-result">
        <div v-if="testResult.isValid" class="success">
          ✅ 校验通过！HotelId: {{ testResult.hotelId }}
        </div>
        <div v-else class="error">
          ❌ 校验失败：{{ testResult.error }}
        </div>
      </div>
    </div> -->

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
    <!-- 个人配对管理 -->
    <div class="pairs-container">
      <h3>个人配对管理</h3>
      <div class="pairs-actions">
        <v-text-field v-model="newMyPair.ctrip_id" label="携程酒店链接" placeholder="请输入携程酒店详情页链接" density="compact"
          class="input-field" :error-messages="ctripUrlError"></v-text-field>
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
              <v-btn color="error" size="small" variant="text" @click="handleDeleteMyPair(pair)"
                :loading="deletingMyPair === pair.ctrip_id">
                删除
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <!-- 配对管理 -->
    <div class="pairs-container">
      <h3>配对策略</h3>
      <div class="pairs-actions pairs-actions-multiline">
        <div class="input-row">
          <v-text-field v-model="newPair.ctrip_id_1" label="目标" placeholder="对方页面链接" density="compact"
            class="input-field" :error-messages="ctripUrlError1" hide-details="auto"></v-text-field>
          <v-text-field v-model="newPair.target_room_type" label="目标酒店房型" placeholder="对方房型" density="compact"
            class="input-field" hide-details="auto"></v-text-field>
        </div>
        <div class="input-row">
          <v-text-field v-model="newPair.ctrip_id_2" label="动态" placeholder="我方页面链接" density="compact"
            class="input-field" :error-messages="ctripUrlError2" hide-details="auto"></v-text-field>
          <v-text-field v-model="newPair.dynamic_room_type" label="动态酒店房型" placeholder="我方房型" density="compact"
            class="input-field" hide-details="auto"></v-text-field>
          <v-text-field v-model="newPair.bias" label="价格偏差 bias" placeholder="bias（整数）" density="compact"
            class="input-field bias-input" type="number" :error-messages="biasError" hide-details="auto"></v-text-field>
          <v-btn color="primary" @click="handleAddPair" :loading="addingPair">
            添加配对
          </v-btn>
        </div>
      </div>
      <div style="color: #888; font-size: 13px; margin-bottom: 10px;">
        说明：
        <br>1. "目标"请填写对方的酒店ID 链接；
        <br>2. "动态"请填写我们自己的酒店ID 链接；
        <br>3. bias = "对方酒店价格" - "我们酒店价格"，请填写整数。
      </div>
      <v-table>
        <thead>
          <tr>
            <th>目标酒店ID</th>
            <th>目标酒店房型</th>
            <th>动态酒店ID</th>
            <th>动态酒店房型</th>
            <th>bias</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingPairs">
            <td colspan="6" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="pairs.length === 0">
            <td colspan="6" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="pair in pairs" :key="pair.ctrip_id_1 + pair.ctrip_id_2 + (pair.target_room_type || '') + (pair.dynamic_room_type || '')">
            <td>{{ pair.ctrip_id_1 }}</td>
            <td>{{ pair.target_room_type }}</td>
            <td>{{ pair.ctrip_id_2 }}</td>
            <td>{{ pair.dynamic_room_type }}</td>
            <td>{{ pair.bias }}</td>
            <td>
              <v-btn color="error" size="small" variant="text" @click="handleDeletePair(pair)"
                :loading="deletingPair === pair.ctrip_id_1 + pair.ctrip_id_2">
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
  getCtripState,
  getCtripQrcode,
  addPair,
  getPairs,
  deletePair,
  addMyPair,
  getMyPairs,
  deleteMyPair,
  validateCtripHotelUrl
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
        ctrip_id_2: '',
        bias: '',
        target_room_type: '',
        dynamic_room_type: ''
      },
      // 个人配对管理
      myPairs: [],
      loadingMyPairs: false,
      addingMyPair: false,
      deletingMyPair: null,
      newMyPair: {
        ctrip_id: ''
      },
      ctripUrlError: '',
      ctripUrlError1: '',
      ctripUrlError2: '',
      testUrl: '',
      testResult: null,
      biasError: ''
    };
  },
  async created() {
    this.fetchUserInfo();
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
    fetchUserInfo() {
      this.loading = true;
      try {
        const userRoleStr = localStorage.getItem('userRole');
        if (userRoleStr) {
          const userRole = JSON.parse(userRoleStr);
          this.userInfo = userRole;
        } else {
          this.error = '获取用户信息失败';
        }
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
        this.pairs = response.data || [];
      } catch (err) {
        console.error('获取配对列表失败:', err);
      } finally {
        this.loadingPairs = false;
      }
    },
    async handleAddPair() {
      if (!this.newPair.ctrip_id_1 || !this.newPair.ctrip_id_2) {
        if (!this.newPair.ctrip_id_1) this.ctripUrlError1 = '请输入对方的携程酒店链接';
        if (!this.newPair.ctrip_id_2) this.ctripUrlError2 = '请输入我们的携程酒店链接';
        return;
      }
      // 校验 bias
      if (this.newPair.bias === '' || isNaN(this.newPair.bias) || !Number.isInteger(Number(this.newPair.bias))) {
        this.biasError = '请输入整数类型的 bias';
        return;
      }
      this.biasError = '';
      // 校验第一个携程酒店链接
      const validation1 = validateCtripHotelUrl(this.newPair.ctrip_id_1);
      if (!validation1.isValid) {
        this.ctripUrlError1 = validation1.error;
        return;
      }
      // 校验第二个携程酒店链接
      const validation2 = validateCtripHotelUrl(this.newPair.ctrip_id_2);
      if (!validation2.isValid) {
        this.ctripUrlError2 = validation2.error;
        return;
      }
      // 清除错误信息
      this.ctripUrlError1 = '';
      this.ctripUrlError2 = '';
      this.addingPair = true;
      try {
        await addPair({
          ctrip_id_1: validation1.hotelId.toString(),
          ctrip_id_2: validation2.hotelId.toString(),
          bias: Number(this.newPair.bias),
          target_room_type: this.newPair.target_room_type,
          dynamic_room_type: this.newPair.dynamic_room_type
        });
        await this.fetchPairs();
        this.newPair.ctrip_id_1 = '';
        this.newPair.ctrip_id_2 = '';
        this.newPair.bias = '';
        this.newPair.target_room_type = '';
        this.newPair.dynamic_room_type = '';
      } catch (err) {
        console.error('添加配对失败:', err);
        this.ctripUrlError1 = '添加失败，请重试';
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
        this.myPairs = response.data || [];
      } catch (err) {
        console.error('获取个人配对列表失败:', err);
      } finally {
        this.loadingMyPairs = false;
      }
    },
    async handleAddMyPair() {
      if (!this.newMyPair.ctrip_id) {
        this.ctripUrlError = '请输入携程酒店链接';
        return;
      }

      // 校验携程酒店链接
      const validation = validateCtripHotelUrl(this.newMyPair.ctrip_id);

      if (!validation.isValid) {
        this.ctripUrlError = validation.error;
        return;
      }

      // 清除错误信息
      this.ctripUrlError = '';

      this.addingMyPair = true;
      try {
        // 使用校验后的hotelId作为ctrip_id
        await addMyPair({
          ctrip_id: validation.hotelId.toString()
        });
        await this.fetchMyPairs();
        this.newMyPair.ctrip_id = '';
      } catch (err) {
        console.error('添加个人配对失败:', err);
        this.ctripUrlError = '添加失败，请重试';
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
    },
    testValidation() {
      try {
        const result = validateCtripHotelUrl(this.testUrl);
        this.testResult = result;
      } catch (err) {
        console.error('校验失败:', err);
        this.testResult = {
          isValid: false,
          error: '校验失败，请检查链接'
        };
      }
    },

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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
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
  max-width: 300px;
}

.bias-input {
  max-width: 120px;
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

.test-container {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-input {
  display: flex;
  gap: 16px;
  align-items: center;
}

.test-field {
  max-width: 300px;
}

.test-result {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.success {
  color: #4caf50;
}

.error {
  color: #f44336;
}

.pairs-actions-multiline {
  flex-direction: column;
  gap: 8px;
}
.input-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
}
.input-row .input-field {
  flex: 1;
  min-width: 180px;
  max-width: 260px;
}
</style>