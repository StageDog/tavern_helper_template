import { createMemoryHistory, createRouter } from 'vue-router';

// 路由懒加载 - 使用动态导入减少初始包大小
// 首屏组件静态导入，优化首屏加载
import SplashScreen from './SplashScreen.vue';
import Home from './Home.vue';

const Discover = () => import('./Discover.vue');
const Service = () => import('./Service.vue');
const ShopDetail = () => import('./ShopDetail.vue');
const ItemDetail = () => import('./ItemDetail.vue');
const Dashboard = () => import('./Dashboard.vue');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: SplashScreen, name: 'SplashScreen' },
    { path: '/play', component: Dashboard, name: 'Play' },
    { path: '/home', component: Home, name: 'Home' },
    { path: '/discover', component: Discover, name: 'Discover' },
    { path: '/service', component: Service, name: 'Service' },
    { path: '/shop/:id', component: ShopDetail, name: 'ShopDetail', props: true },
    { path: '/item/:id', component: ItemDetail, name: 'ItemDetail', props: true },
  ],
  // 路由性能优化
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 路由错误兜底：避免某个页面异常导致整个 RouterView 空载
router.onError(err => {
  try {
    console.error('[Router] 导航失败:', err);
  } catch {
    // ignore
  }

  // 尝试回到首页（避免“点了之后全空白”卡死）
  try {
    if (router.currentRoute.value.path !== '/home') {
      router.replace('/home').catch(() => {});
    }
  } catch {
    // ignore
  }
});

// 兜底：捕获 push/replace 的 Promise rejection，避免出现未处理拒绝导致界面进入“空白且不可操作”的状态
const rawPush = router.push.bind(router);
router.push = ((...args: Parameters<typeof router.push>) => {
  return rawPush(...(args as any)).catch(err => {
    try {
      console.error('[Router] push 失败:', err);
    } catch {
      // ignore
    }
    try {
      if (router.currentRoute.value.path !== '/home') {
        router.replace('/home').catch(() => {});
      }
    } catch {
      // ignore
    }
    return Promise.resolve();
  }) as any;
}) as any;

const rawReplace = router.replace.bind(router);
router.replace = ((...args: Parameters<typeof router.replace>) => {
  return rawReplace(...(args as any)).catch(err => {
    try {
      console.error('[Router] replace 失败:', err);
    } catch {
      // ignore
    }
    return Promise.resolve();
  }) as any;
}) as any;

export default router;
