import { defineStore } from 'pinia'
import { statsAPI } from '../api/stats'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    dashboardData: {
      totalVulnerabilities: 0,
      pendingVulnerabilities: 0,
      monthlySubmissions: 0,
      resolvedVulnerabilities: 0,
      severityDistribution: [],
      statusDistribution: [],
      weeklyTrend: []
    },
    engineers: [],
    loading: false
  }),

  getters: {
    // 严重性分布数据（用于饼图）
    severityChartData() {
      const data = this.dashboardData.severityDistribution
      return {
        labels: data.map(item => item.severity),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: [
            '#8e0000', // CRITICAL - 深红
            '#e74c3c', // HIGH - 红色
            '#f39c12', // MEDIUM - 橙色
            '#27ae60', // LOW - 绿色
            '#95a5a6'  // UNKNOWN - 灰色
          ]
        }]
      }
    },

    // 状态分布数据（用于柱状图）
    statusChartData() {
      const data = this.dashboardData.statusDistribution
      return {
        labels: data.map(item => item.status),
        datasets: [{
          label: '漏洞数量',
          data: data.map(item => item.count),
          backgroundColor: '#667eea'
        }]
      }
    },

    // 周趋势数据（用于折线图）
    trendChartData() {
      const data = this.dashboardData.weeklyTrend
      return {
        labels: data.map(item => item.date),
        datasets: [{
          label: '每日提交',
          data: data.map(item => item.count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }
    }
  },

  actions: {
    // 获取仪表板数据
    async fetchDashboardData() {
      this.loading = true
      try {
        const response = await statsAPI.getDashboardData()
        this.dashboardData = {
          totalVulnerabilities: response.total_vulnerabilities || 0,
          pendingVulnerabilities: response.pending_vulnerabilities || 0,
          monthlySubmissions: response.monthly_submissions || 0,
          resolvedVulnerabilities: response.resolved_vulnerabilities || 0,
          severityDistribution: response.severity_distribution || [],
          statusDistribution: response.status_distribution || [],
          weeklyTrend: response.weekly_trend || []
        }
        return response
      } catch (error) {
        console.error('获取仪表板数据失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取基础统计数据
    async fetchBasicStats() {
      try {
        const response = await statsAPI.getBasicStats()
        return response
      } catch (error) {
        console.error('获取基础统计数据失败:', error)
        throw error
      }
    },

    // 获取工程师列表
    async fetchEngineers() {
      try {
        const response = await statsAPI.getEngineers()
        this.engineers = response
        return response
      } catch (error) {
        console.error('获取工程师列表失败:', error)
        throw error
      }
    },

    // 刷新所有数据
    async refreshAllData() {
      await Promise.all([
        this.fetchDashboardData(),
        this.fetchEngineers()
      ])
    }
  }
})