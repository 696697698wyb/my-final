import api from './index'

export const statsAPI = {
  // 获取基础统计
  getBasicStats: () => {
    return api.get('/vulnerability/stats/')
  },

  // 获取仪表板数据
  getDashboardData: () => {
    return api.get('/vulnerability/dashboard/')
  },

  // 获取工程师列表
  getEngineers: () => {
    return api.get('/vulnerability/engineers/')
  }
}