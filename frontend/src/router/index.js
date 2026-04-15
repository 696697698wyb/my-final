import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      requiresAuth: false,
      title: '漏洞管理系统'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresAuth: false,
      title: '登录 - 漏洞管理系统'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      requiresAuth: false,
      title: '注册 - 漏洞管理系统'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '仪表板 - 漏洞管理系统'
    }
  },
  {
    path: '/submit',
    name: 'Submit',
    component: () => import('../views/Submit.vue'),
    meta: {
      requiresAuth: true,
      title: '提交漏洞 - 漏洞管理系统'
    }
  },
  {
    path: '/vulnerability/:id',
    name: 'VulnerabilityDetail',
    component: () => import('../views/VulnerabilityDetail.vue'),
    meta: {
      requiresAuth: true,
      title: '漏洞详情 - 漏洞管理系统'
    }
  },
  {
    path: '/cwe/:cweId',
    name: 'CweKnowledge',
    component: () => import('../views/CweKnowledge.vue'),
    meta: {
      requiresAuth: true,
      title: 'CWE 知识库 - 漏洞管理系统'
    }
  },
  {
    path: '/cwe-types',
    name: 'CweTypeCatalog',
    component: () => import('../views/CweTypeCatalog.vue'),
    meta: {
      requiresAuth: true,
      title: 'CWE 类型总览 - 漏洞管理系统'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: {
      requiresAuth: true,
      title: '搜索漏洞 - 漏洞管理系统'
    }
  },
  {
    path: '/my-assigned',
    name: 'MyAssigned',
    component: () => import('../views/EngineerTasks.vue'),
    meta: {
      requiresAuth: true,
      title: '我的待处理漏洞 - 漏洞管理系统'
    }
  },
  {
    path: '/unassigned',
    name: 'UnassignedTasks',
    component: () => import('../views/UnassignedTasks.vue'),
    meta: {
      requiresAuth: true,
      title: '待分配任务 - 漏洞管理系统'
    }
  },
  {
    path: '/import-cwe-json',
    name: 'ImportCweJson',
    component: () => import('../views/ImportCweJson.vue'),
    meta: {
      requiresAuth: true,
      title: '导入 CWE - 漏洞管理系统'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      requiresAuth: false,
      title: '页面未找到'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = to.meta.title || '漏洞管理系统'

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 如果已登录且访问登录/注册页，重定向到仪表板
  if (userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
    return
  }

  next()
})

export default router
