import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/statistic',
      name: 'statistic',
      component: () => import('@/views/Statistic.vue'),
    },
    {
      path: '/clear',
      name: 'clear',
      component: () => import('@/views/Clear.vue'),
    },
  ],
})

export default router
