<template>
  <div class="long-term-search">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>远期价格搜索</h1>
        <p class="subtitle">搜索酒店远期价格数据</p>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-form">
          <v-text-field 
            v-model="searchHotelId" 
            label="酒店ID" 
            placeholder="请输入酒店ID" 
            density="compact"
            class="search-input" 
            :error-messages="searchError"
          ></v-text-field>
          <v-btn 
            color="primary" 
            @click="searchHotel" 
            :loading="loading" 
            :disabled="!searchHotelId"
          >
            搜索价格
          </v-btn>
          <v-btn 
            color="secondary" 
            variant="outlined" 
            @click="loadTestData" 
            :disabled="loading"
          >
            测试数据
          </v-btn>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p>正在搜索价格数据...</p>
      </div>

      <!-- 错误信息 -->
      <div v-else-if="error" class="error-section">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <!-- 价格日历 -->
      <div v-else-if="availabilityData && availabilityData.length > 0">
        <PriceCalendar 
          :availability-data="availabilityData"
          :hotel-info="hotelInfo"
        />
      </div>

      <!-- 无数据状态 -->
      <div v-else-if="searched" class="no-data-section">
        <v-alert type="info" variant="tonal">
          未找到该酒店的远期价格数据，请检查酒店ID是否正确
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script>
import { getHotelAvailability } from '../api/api';
import PriceCalendar from '../components/PriceCalendar.vue';

export default {
  name: 'LongTermSearch',
  components: {
    PriceCalendar
  },
  data() {
    return {
      searchHotelId: '',
      loading: false,
      error: null,
      searched: false,
      availabilityData: [],
      hotelInfo: null
    };
  },
  computed: {
    searchError() {
      if (!this.searchHotelId) return '';
      if (!/^\d+$/.test(this.searchHotelId)) {
        return '酒店ID必须是数字';
      }
      return '';
    }
  },
  methods: {
    async searchHotel() {
      if (!this.searchHotelId || this.searchError) {
        return;
      }

      this.loading = true;
      this.error = null;
      this.searched = true;

      try {
        const response = await getHotelAvailability(this.searchHotelId);
        this.availabilityData = response.data || [];
        this.hotelInfo = response.hotel_info;
      } catch (err) {
        console.error('获取酒店数据失败:', err);
        this.error = '获取酒店数据失败，请检查酒店ID是否正确';
        this.availabilityData = [];
        this.hotelInfo = null;
      } finally {
        this.loading = false;
      }
    },
    loadTestData() {
      this.searchHotelId = '66849027';
      this.searchHotel();
    }
  }
};
</script>

<style scoped>
.long-term-search {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.search-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: center;
  max-width: 500px;
}

.search-input {
  flex: 1;
}

.loading-section,
.error-section,
.no-data-section {
  text-align: center;
  padding: 60px 20px;
}

.loading-section p {
  margin-top: 20px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 