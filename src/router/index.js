import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Calendar from "../views/Calendar.vue";
import LongTermSearch from "../views/LongTermSearch.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/home",
    name: "HomePage",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/userinfo",
    name: "UserInfo",
    component: () => import("../views/UserInfo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: Calendar,
    meta: { requiresAuth: true },
  },
  {
    path: "/long-term-search",
    name: "LongTermSearch",
    component: LongTermSearch,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  if (to.path === "/login") {
    return next();
  }

  if (to.meta.requiresAuth) {
    // 从localStorage获取用户权限信息
    const userRoleStr = localStorage.getItem('userRole');
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken || !userRoleStr) {
      return next("/login");
    }

    try {
      const userRole = JSON.parse(userRoleStr);
      
      // 检查是否需要管理员权限
      if (to.meta.requiresAdmin) {
        const hasAdminAccess = userRole && userRole.admin === true;
        
        if (!hasAdminAccess) {
          // 没有权限，重定向到首页
          return next('/');
        }
      }
      return next();
    } catch (e) {
      // 解析失败，清除无效数据并重定向到登录页
      localStorage.removeItem('userRole');
      localStorage.removeItem('userToken');
      return next("/login");
    }
  }

  return next();
});

export default router;
