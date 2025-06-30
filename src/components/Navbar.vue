<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- 左侧Logo和标题 -->
      <div class="navbar-left">
        <div class="logo">
          <img src="../assets/vue.svg" alt="Logo" class="logo-img" />
          <span class="logo-text">价格平台</span>
        </div>
      </div>

      <!-- 中间导航菜单 -->
      <div class="navbar-center">
        <router-link 
          to="/home" 
          class="nav-link"
          :class="{ active: $route.path === '/home' || $route.path === '/' }"
        >
          <v-icon>mdi-home</v-icon>
          首页
        </router-link>
        <router-link 
          to="/userinfo" 
          class="nav-link"
          :class="{ active: $route.path === '/userinfo' }"
        >
          <v-icon>mdi-account</v-icon>
          用户信息
        </router-link>
        <router-link 
          to="/calendar" 
          class="nav-link"
          :class="{ active: $route.path === '/calendar' }"
        >
          <v-icon>mdi-calendar</v-icon>
          价格日历
        </router-link>
        <router-link 
          v-if="hasAdminAccess"
          to="/long-term-search" 
          class="nav-link"
          :class="{ active: $route.path === '/long-term-search' }"
        >
          <v-icon>mdi-magnify</v-icon>
          远期搜索
        </router-link>
      </div>

      <!-- 右侧用户信息和操作 -->
      <div class="navbar-right">
        <div class="user-info" v-if="userInfo">
          <v-icon>mdi-account-circle</v-icon>
          <span class="username">{{ userInfo.username || '用户' }}</span>
        </div>
        <v-btn 
          color="error" 
          variant="text" 
          @click="handleLogout"
          :loading="loggingOut"
        >
          <v-icon>mdi-logout</v-icon>
          退出登录
        </v-btn>
      </div>
    </div>
  </nav>
</template>

<script>
import { logout } from '../api/api';

export default {
  name: 'Navbar',
  data() {
    return {
      userInfo: null,
      loggingOut: false
    };
  },
  computed: {
    hasAdminAccess() {
      if (!this.userInfo) return false;
      return this.userInfo.admin === true;
    }
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
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
      }
    },
    async handleLogout() {
      this.loggingOut = true;
      try {
        await logout();
        // 清除本地状态和localStorage
        this.userInfo = null;
        localStorage.removeItem('userRole');
        localStorage.removeItem('userToken');
        // 跳转到登录页
        this.$router.push('/login');
      } catch (err) {
        console.error('退出登录失败:', err);
      } finally {
        this.loggingOut = false;
      }
    }
  }
};
</script>

<style scoped>
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: 32px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: #666;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link.active {
  background: #e3f2fd;
  color: #1976d2;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 20px;
}

.username {
  font-weight: 500;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }
  
  .navbar-center {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .logo-text {
    font-size: 16px;
  }
}

@media (max-width: 600px) {
  .navbar-center {
    gap: 8px;
  }
  
  .nav-link {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .nav-link .v-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .navbar-center {
    display: none;
  }
  
  .navbar-container {
    justify-content: space-between;
  }
  
  .navbar-left {
    flex: 1;
  }
  
  .navbar-right {
    flex: 0 0 auto;
  }
}
</style> 