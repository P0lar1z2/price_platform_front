<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();

// 只在非登录页面显示导航栏
const showNavbar = computed(() => {
  return route.path !== '/login';
});
</script>

<template>
  <div class="app">
    <!-- 导航栏 -->
    <Navbar v-if="showNavbar" />
    
    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'with-navbar': showNavbar }">
  <router-view></router-view>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.main-content.with-navbar {
  padding-top: 20px;
}

/* 全局样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .main-content.with-navbar {
    padding-top: 16px;
  }
}
</style>
