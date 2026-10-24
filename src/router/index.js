import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
    },
    {
      path: '/analyze',
      name: 'analyze',
      component: () => import('@/views/AnalyzerView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'welcome' },
    },
  ],
})

export default router
