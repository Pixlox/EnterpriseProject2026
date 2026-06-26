// router.js - Vue Router setup
import { createRouter, createWebHistory } from 'vue-router';
import CitizenCentre from './views/CitizenCentre.vue';
import NewReport from './views/NewReport.vue';
import BrowseReports from './views/BrowseReports.vue';
import CouncilDashboard from './views/CouncilDashboard.vue';
import LoginView from './views/LoginView.vue';
import ReportSuccess from './views/ReportSuccess.vue';
import { useAuthStore } from './stores/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'citizen-centre',
    component: CitizenCentre,
    meta: { requiresAuth: true, allowedRoles: ['citizen', 'council'] }
  },
  {
    path: '/report/new',
    name: 'new-report',
    component: NewReport,
    meta: { requiresAuth: true, allowedRoles: ['citizen'] }
  },
  {
    path: '/report/success',
    name: 'report-success',
    component: ReportSuccess,
    meta: { requiresAuth: true, allowedRoles: ['citizen'] }
  },
  {
    path: '/reports',
    name: 'browse-reports',
    component: BrowseReports,
    meta: { requiresAuth: true, allowedRoles: ['citizen', 'council'] }
  },
  {
    path: '/council',
    name: 'council',
    component: CouncilDashboard,
    meta: { requiresAuth: true, allowedRoles: ['council'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// auth guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  if (to.path === '/login' && authStore.isAuthenticated) {
    next(authStore.isCouncil ? '/council' : '/');
    return;
  }
  
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(authStore.userType)) {
    next(authStore.isCouncil ? '/council' : '/');
    return;
  }
  
  next();
});

export default router;
