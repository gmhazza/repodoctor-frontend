import { createRouter, createWebHistory } from 'vue-router'
import { updateSeo } from '@/utils/seo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
      meta: {
        seo: {
          title: 'Repo Doctor · Find issues before your users do',
          description:
            'Review public GitHub repositories, find important issues, and get practical fixes with Repo Doctor.',
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Repo Doctor',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            description:
              'A repository review tool that surfaces important code issues and suggested fixes.',
          },
        },
      },
    },
    {
      path: '/analyze',
      name: 'analyze',
      component: () => import('@/views/AnalyzerView.vue'),
      meta: {
        seo: {
          title: 'Analyze a repository · Repo Doctor',
          description:
            'Analyze a public GitHub repository and inspect prioritized code findings with Repo Doctor.',
          robots: 'noindex, follow',
        },
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        seo: {
          title: 'Page not found · Repo Doctor',
          description: 'The requested Repo Doctor page could not be found.',
          robots: 'noindex, nofollow',
        },
      },
    },
  ],
})

router.afterEach((to) => updateSeo(to))

export default router
