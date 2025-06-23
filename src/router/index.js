import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import { getUserInfo } from "../api/api.js";

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
    redirect: "/userinfo",
  },
  {
    path: "/userinfo",
    name: "UserInfo",
    component: () => import("../views/UserInfo.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isAuth = null;
// 路由守卫
router.beforeEach(async (to, from, next) => {
  if (to.path === "/login") {
    return next();
  }

  if (to.meta.requiresAuth) {
    if (isAuth === null) {
      try {
        await getUserInfo();
        isAuth = true;
      } catch (e) {
        isAuth = false;
      }
    }

    if (isAuth) {
      return next();
    } else {
      return next("/login");
    }
  }

  return next();
});

export default router;
