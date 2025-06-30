<template>
    <div class="calendar-page">
        <div class="container">
            <!-- 页面标题 -->
            <div class="page-header">
                <h1>价格日历</h1>
                <p class="subtitle">查看个人配对酒店的价格变化趋势</p>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-section">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p>正在加载个人配对酒店数据...</p>
            </div>

            <!-- 错误信息 -->
            <div v-else-if="error" class="error-section">
                <v-alert type="error" variant="tonal">
                    {{ error }}
                </v-alert>
            </div>

            <!-- 无配对数据状态 -->
            <div v-else-if="myPairs.length === 0" class="no-data-section">
                <v-alert type="info" variant="tonal">
                    您还没有添加个人配对酒店，请前往用户信息页面添加酒店
                </v-alert>
                <v-btn 
                    color="primary" 
                    @click="$router.push('/userinfo')"
                    class="mt-4"
                >
                    前往用户信息
                </v-btn>
            </div>

            <!-- 酒店列表 -->
            <div v-else class="hotels-section">
                <div class="hotels-grid">
                    <div 
                        v-for="hotel in myPairs" 
                        :key="hotel.ctrip_id"
                        class="hotel-card"
                    >
                        <PriceCalendar 
                            :availability-data="hotel.availabilityData"
                            :hotel-info="hotel.hotelInfo"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMyPairs, getHotelAvailability } from '../api/api';
import PriceCalendar from '../components/PriceCalendar.vue';

export default {
    name: 'Calendar',
    components: {
        PriceCalendar
    },
    data() {
        return {
            loading: false,
            error: null,
            myPairs: []
        };
    },
    async created() {
        await this.fetchMyPairs();
    },
    methods: {
        async fetchMyPairs() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getMyPairs();
                const pairs = response.data || [];
                
                // 直接加载所有酒店的价格数据
                this.myPairs = await Promise.all(
                    pairs.map(async (hotel) => {
                        try {
                            const availabilityResponse = await getHotelAvailability(hotel.ctrip_id);
                            return {
                                ...hotel,
                                availabilityData: availabilityResponse.data || [],
                                hotelInfo: availabilityResponse.hotel_info
                            };
                        } catch (err) {
                            console.error(`获取酒店 ${hotel.ctrip_id} 数据失败:`, err);
                            return {
                                ...hotel,
                                availabilityData: [],
                                hotelInfo: null,
                                error: '获取价格数据失败'
                            };
                        }
                    })
                );
            } catch (err) {
                console.error('获取个人配对失败:', err);
                this.error = '获取个人配对失败';
                this.myPairs = [];
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.calendar-page {
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

.hotels-section {
    margin-top: 30px;
}

.hotels-grid {
    display: grid;
    gap: 30px;
}

.hotel-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .page-header h1 {
        font-size: 2rem;
    }
}
</style>