import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/map' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: 'map',
        component: () => import('@/pages/map.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  },
]
