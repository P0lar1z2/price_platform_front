<script>
export default {
  name: 'Home',
  data() {
    return {
      userInfo: null,
      hasAdminAccess: false
    };
  },
  created() {
    this.fetchUserInfo();
  },
  methods: {
    fetchUserInfo() {
      try {
        const userRoleStr = localStorage.getItem('userRole');
        if (userRoleStr) {
          const userRole = JSON.parse(userRoleStr);
          this.userInfo = userRole;
          this.hasAdminAccess = userRole.admin === true;
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
      }
    }
  }
};
</script>

<template>
  <div class="home">
    <div class="container">
      <h1>欢迎使用价格平台</h1>
      <div class="welcome-content">
        <div class="welcome-card">
          <v-icon size="48" color="primary">mdi-chart-line</v-icon>
          <h3>价格监控</h3>
          <p>实时监控携程酒店价格变化，帮助您找到最佳预订时机</p>
        </div>
        
        <div class="welcome-card">
          <v-icon size="48" color="success">mdi-account-group</v-icon>
          <h3>用户管理</h3>
          <p>管理您的个人配对和配对关系，个性化您的价格监控</p>
        </div>
        
        <div class="welcome-card">
          <v-icon size="48" color="info">mdi-bell</v-icon>
          <h3>智能提醒</h3>
          <p>当价格发生变化时，及时收到通知提醒</p>
        </div>
      </div>
      
      <div class="quick-actions">
        <h2>快速操作</h2>
        <div class="action-buttons">
          <v-btn 
            color="primary" 
            size="large" 
            @click="$router.push('/userinfo')"
            prepend-icon="mdi-account"
          >
            用户信息
          </v-btn>
          <v-btn 
            color="secondary" 
            size="large" 
            @click="$router.push('/calendar')"
            prepend-icon="mdi-calendar"
          >
            价格日历
          </v-btn>
          <v-btn 
            v-if="hasAdminAccess"
            color="success" 
            size="large" 
            @click="$router.push('/long-term-search')"
            prepend-icon="mdi-magnify"
          >
            远期搜索
          </v-btn>
          <!-- <v-btn 
            color="info" 
            size="large" 
            variant="outlined"
            prepend-icon="mdi-help-circle"
          >
            使用帮助
          </v-btn> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
  font-size: 2.5rem;
  font-weight: 300;
}

.welcome-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.welcome-card {
  background: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.welcome-card h3 {
  margin: 20px 0 15px;
  color: #333;
  font-size: 1.5rem;
  font-weight: 500;
}

.welcome-card p {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

.quick-actions {
  text-align: center;
}

.quick-actions h2 {
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
  font-weight: 300;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  
  .welcome-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .welcome-card {
    padding: 30px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
