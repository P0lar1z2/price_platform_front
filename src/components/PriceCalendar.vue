<template>
  <div class="price-calendar">
    <!-- 酒店信息卡片 -->
    <div v-if="hotelInfo" class="hotel-card">
      <div  class="hotel-info">
        <h2>{{ hotelInfo.hotel_name }}</h2>
        <div class="hotel-details">
          <span class="star-rating">
            <v-icon v-for="i in parseInt(hotelInfo.star)" :key="i" color="amber" size="small">
              mdi-star
            </v-icon>
          </span>
          <span class="score">评分: {{ hotelInfo.score }}</span>
          <span class="hotel-id">酒店ID: {{ hotelInfo.hotel_id }}</span>
        </div>
      </div>
      <!-- 折叠按钮 -->
      <div class="collapse-button">
        <v-btn 
          color="primary" 
          size="small"
          @click="toggleCollapse"
          prepend-icon="mdi-chevron-down"
          :class="{ 'collapsed': !isExpanded }"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </v-btn>
      </div>
    </div>

    <!-- 折叠内容 -->
    <div v-show="isExpanded" class="collapse-content">
      <!-- 星期标题 -->
      <div class="week-header">
        <div class="week-day" v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <!-- 价格日历网格 -->
      <div class="calendar-grid">
        <div 
          v-for="item in alignedData" 
          :key="item._id" 
          class="calendar-day" 
          :class="{
            'no-price': item.price === 0,
            'weekend': isWeekend(item.reserve_date),
            'empty-data': !item.created_at
          }"
        >
          <div class="date">{{ formatDateShort(item.reserve_date) }}</div>
          <div class="price" v-if="item.price > 0">
            ¥{{ item.price }}
          </div>
          <div class="no-availability" v-else-if="item.created_at">
            无房
          </div>
          <div class="no-data" v-else>
            无数据
          </div>
          <div class="room-type">{{ item.target }}</div>
          <div class="update-time" v-if="item.created_at">
            {{ formatTime(item.created_at) }}
          </div>
        </div>
      </div>

      <!-- 价格统计 -->
      <div class="price-stats">
        <div class="stat-card">
          <h4>最低价格</h4>
          <div class="stat-value">¥{{ minPrice }}</div>
        </div>
        <div class="stat-card">
          <h4>最高价格</h4>
          <div class="stat-value">¥{{ maxPrice }}</div>
        </div>
        <div class="stat-card">
          <h4>平均价格</h4>
          <div class="stat-value">¥{{ avgPrice }}</div>
        </div>
        <!-- <div class="stat-card">
          <h4>有房天数</h4>
          <div class="stat-value">{{ availableDays }}</div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceCalendar',
  props: {
    availabilityData: {
      type: Array,
      default: () => []
    },
    hotelInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      isExpanded: true // 默认展开
    };
  },
  computed: {
    minPrice() {
      const prices = this.availabilityData
        .filter(item => item.price > 0)
        .map(item => item.price);
      return prices.length > 0 ? Math.min(...prices) : 0;
    },
    maxPrice() {
      const prices = this.availabilityData
        .filter(item => item.price > 0)
        .map(item => item.price);
      return prices.length > 0 ? Math.max(...prices) : 0;
    },
    avgPrice() {
      const prices = this.availabilityData
        .filter(item => item.price > 0)
        .map(item => item.price);
      return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    },
    availableDays() {
      return this.availabilityData.filter(item => item.price > 0).length;
    },
    // 按星期对齐的数据
    alignedData() {
      if (!this.availabilityData.length) return [];

      // 创建日期映射
      const dateMap = {};
      this.availabilityData.forEach(item => {
        dateMap[item.reserve_date] = item;
      });

      // 获取日期范围
      const dates = this.availabilityData.map(item => new Date(item.reserve_date));
      const startDate = new Date(Math.min(...dates));
      const endDate = new Date(Math.max(...dates));

      // 调整开始日期到最近的周一
      const startDay = startDate.getDay();
      const daysToMonday = startDay === 0 ? 6 : startDay - 1; // 0是周日，1是周一
      const adjustedStartDate = new Date(startDate);
      adjustedStartDate.setDate(startDate.getDate() - daysToMonday);

      // 调整结束日期到最近的周日
      const endDay = endDate.getDay();
      const daysToSunday = endDay === 0 ? 0 : 7 - endDay;
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(endDate.getDate() + daysToSunday);

      // 生成完整的日期范围
      const result = [];
      const currentDate = new Date(adjustedStartDate);

      while (currentDate <= adjustedEndDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (dateMap[dateStr]) {
          result.push(dateMap[dateStr]);
        } else {
          // 填充空日期
          result.push({
            _id: `empty-${dateStr}`,
            reserve_date: dateStr,
            price: 0,
            target: '无数据',
            created_at: null
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    }
  },
  methods: {
    toggleCollapse() {
      this.isExpanded = !this.isExpanded;
    },
    formatDateShort(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric'
      });
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    isWeekend(dateString) {
      const date = new Date(dateString);
      const day = date.getDay();
      return day === 0 || day === 6; // 0是周日，6是周六
    }
  }
};
</script>

<style scoped>
.price-calendar {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hotel-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hotel-info {
  flex: 1;
}

.hotel-info h2 {
  margin-bottom: 12px;
  color: #333;
  font-size: 1.5rem;
}

.hotel-details {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.star-rating {
  display: flex;
  align-items: center;
}

.score,
.hotel-id {
  color: #666;
  font-size: 0.9rem;
}

.collapse-button {
  margin-left: 20px;
  flex-shrink: 0;
}

.collapse-button .v-btn {
  transition: transform 0.3s ease;
}

.collapse-button .v-btn.collapsed {
  transform: rotate(180deg);
}

.collapse-content {
  transition: all 0.3s ease;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 12px;
}

.week-day {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 30px;
}

.calendar-day {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fff;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.calendar-day:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.calendar-day.no-price {
  background: #f5f5f5;
  border-color: #ddd;
}

.calendar-day.weekend {
  background: #fff8e1;
  border-color: #ffc107;
}

.calendar-day.empty-data {
  background: #fafafa;
  border-color: #e0e0e0;
  opacity: 0.7;
}

.date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 4px;
}

.no-availability {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 4px;
}

.no-data {
  font-size: 0.8rem;
  color: #ccc;
  margin-bottom: 4px;
  font-style: italic;
}

.room-type {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.update-time {
  font-size: 0.7rem;
  color: #999;
  margin-top: auto;
}

.price-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-card h4 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .week-header {
    gap: 8px;
    padding: 0 8px;
  }

  .week-day {
    font-size: 0.8rem;
    padding: 6px 0;
  }

  .calendar-grid {
    gap: 8px;
  }

  .calendar-day {
    padding: 8px;
    min-height: 100px;
  }

  .price {
    font-size: 1rem;
  }

  .date {
    font-size: 0.8rem;
  }

  .room-type,
  .update-time {
    font-size: 0.7rem;
  }

  .price-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .hotel-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .week-header {
    gap: 4px;
    padding: 0 4px;
  }

  .week-day {
    font-size: 0.7rem;
    padding: 4px 0;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day {
    padding: 6px;
    min-height: 80px;
  }

  .price {
    font-size: 0.9rem;
  }

  .date {
    font-size: 0.7rem;
  }

  .room-type,
  .update-time {
    font-size: 0.6rem;
  }
}
</style> 