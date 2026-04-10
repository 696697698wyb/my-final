import api from './index'

export const authAPI = {
  // 用户登录
  login: (data) => {
    return api.post('/vulnerability/login/', data)
  },

  // 用户注册
  register: (data) => {
    return api.post('/vulnerability/register/', data)
  }
}