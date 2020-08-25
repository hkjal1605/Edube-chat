import Vue from "vue";

import VueRouter from "vue-router";

import Login from "./components/Login";

import HomePage from "./components/HomePage";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      redirect: {
        name: "HomePage",
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },

    {
      path: "/",
      name: "HomePage",
      component: HomePage,
    },
  ],
});

export default router;
