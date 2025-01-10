export const routes = [
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
  // {
  //   path: '/',
  //   component: () => import('@/layouts/blank.vue'),
  //   children: [
  //     {
  //       path: 'login',
  //       component: () => import('@/pages/login.vue'),
  //     },
  //     {
  //       path: 'register',
  //       component: () => import('@/pages/register.vue'),
  //     },
  //     {
  //       path: '/:pathMatch(.*)*',
  //       component: () => import('@/pages/[...error].vue'),
  //     },
  //   ],
  // },
]
