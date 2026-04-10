import { defineStore } from 'pinia'
import { authAPI } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: localStorage.getItem('user_id') || '',
      username: localStorage.getItem('username') || '',
      role: localStorage.getItem('role') || ''
    },
    isLoggedIn: !!localStorage.getItem('user_id'),
    token: localStorage.getItem('token') || ''
  }),

  getters: {
    isAdmin: (state) => state.userInfo.role === 'manager',
    isEngineer: (state) => state.userInfo.role === 'engineer',
    isReporter: (state) => state.userInfo.role === 'reporter'
  },

  actions: {
    async login(credentials) {
      try {
        const response = await authAPI.login(credentials)

        // 处理中文响应
        if (response && response.status && typeof response.status === 'string') {
          if (response.status.includes('成功')) {
            // 保存用户信息
            localStorage.setItem('user_id', response.user_id || response.id || '')
            localStorage.setItem('username', response.username || credentials.username)
            localStorage.setItem('role', response.role || 'reporter')
            localStorage.setItem('token', response.token || '')

            // 更新store
            this.userInfo = {
              id: response.user_id || response.id || '',
              username: response.username || credentials.username,
              role: response.role || 'reporter'
            }
            this.isLoggedIn = true
            this.token = response.token || ''

            return { success: true, message: response.status }
          } else {
            return { success: false, message: response.status }
          }
        }

        // 处理英文响应
        if (response && (response.success === true || response.user_id)) {
          localStorage.setItem('user_id', response.user_id || response.id || '')
          localStorage.setItem('username', response.username || credentials.username)
          localStorage.setItem('role', response.role || 'reporter')
          localStorage.setItem('token', response.token || '')

          this.userInfo = {
            id: response.user_id || response.id || '',
            username: response.username || credentials.username,
            role: response.role || 'reporter'
          }
          this.isLoggedIn = true
          this.token = response.token || ''

          return { success: true, message: response.message || '登录成功' }
        }

        return { success: false, message: response.error || response.message || '登录失败' }
      } catch (error) {
        console.error('登录错误:', error)
        if (error.response) {
          return { success: false, message: '服务器错误: ' + error.response.status }
        }
        return { success: false, message: '网络连接失败，请检查网络' }
      }
    },

    async register(userData) {
      try {
        const response = await authAPI.register(userData)

        if (response && response.status && typeof response.status === 'string') {
          if (response.status.includes('成功')) {
            return { success: true, message: response.status }
          } else {
            return { success: false, message: response.status }
          }
        }

        if (response && (response.success === true)) {
          return { success: true, message: response.message || '注册成功' }
        }

        return { success: false, message: response.error || response.message || '注册失败' }
      } catch (error) {
        console.error('注册错误:', error)
        if (error.response) {
          return { success: false, message: '服务器错误: ' + error.response.status }
        }
        return { success: false, message: '网络连接失败，请检查网络' }
      }
    },

    logout() {
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('token')

      this.userInfo = {
        id: '',
        username: '',
        role: ''
      }
      this.isLoggedIn = false
      this.token = ''
    }
  }
})