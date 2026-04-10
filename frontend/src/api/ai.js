import api from './index'

export const aiAPI = {
  // AI预测严重性
  predict: (data) => {
    return api.post('/vulnerability/ai/', data)
  }
}
