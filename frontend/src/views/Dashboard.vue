<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-left">
        <h2>漏洞管理系统</h2>
      </div>
      <div class="nav-right">
        <span class="user-info">
          {{ userStore.userInfo.username }} ({{ getRoleName(userStore.userInfo.role) }})
        </span>
        <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 侧边菜单 -->
      <div class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="unassigned" v-if="userStore.isAdmin">
            <el-icon><Files /></el-icon>
            <span>待分配任务</span>
          </el-menu-item>
          <el-menu-item index="submit">
            <el-icon><Plus /></el-icon>
            <span>提交漏洞</span>
          </el-menu-item>
          <el-menu-item index="search">
            <el-icon><Search /></el-icon>
            <span>搜索漏洞</span>
          </el-menu-item>
          <el-menu-item index="myAssigned" v-if="userStore.isEngineer">
            <el-icon><Tickets /></el-icon>
            <span>我的待处理</span>
          </el-menu-item>
          <el-menu-item index="importCwe">
            <el-icon><Upload /></el-icon>
            <span>导入 CWE</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total || 0 }}</div>
              <div class="stat-label">总漏洞数</div>
            </div>
          </el-card>

          <el-card class="stat-card critical">
            <div class="stat-content">
              <div class="stat-number">{{ stats.critical || 0 }}</div>
              <div class="stat-label">严重</div>
            </div>
          </el-card>

          <el-card class="stat-card high">
            <div class="stat-content">
              <div class="stat-number">{{ stats.high || 0 }}</div>
              <div class="stat-label">高危</div>
            </div>
          </el-card>

          <el-card class="stat-card medium">
            <div class="stat-content">
              <div class="stat-number">{{ stats.medium || 0 }}</div>
              <div class="stat-label">中等</div>
            </div>
          </el-card>
        </div>

        <div class="chart-grid">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>漏洞类型分布</span>
                <span class="chart-tip">按 CWE 关联统计</span>
              </div>
            </template>
            <div class="chart-wrap">
              <Pie v-if="typeChartData.labels.length" :data="typeChartData" :options="pieChartOptions" />
              <el-empty v-else description="暂无类型分布数据" />
            </div>
          </el-card>

          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>严重性分布</span>
                <span class="chart-tip">柱状对比</span>
              </div>
            </template>
            <div class="chart-wrap">
              <Bar v-if="severityChartData.labels.length" :data="severityChartData" :options="barChartOptions" />
              <el-empty v-else description="暂无严重性数据" />
            </div>
          </el-card>
        </div>

        <el-card class="chart-card trend-card">
          <template #header>
            <div class="chart-header">
              <span>时间趋势</span>
              <span class="chart-tip">近 14 天新增漏洞</span>
            </div>
          </template>
          <div class="chart-wrap trend-wrap">
            <Line v-if="trendChartData.labels.length" :data="trendChartData" :options="lineChartOptions" />
            <el-empty v-else description="暂无趋势数据" />
          </div>
        </el-card>

        <!-- 漏洞列表 -->
        <el-card class="vuln-list">
          <div class="list-header">
            <h3>漏洞列表</h3>
          </div>

          <el-table :data="vulnerabilities" style="width: 100%" @row-click="handleRowClick" highlight-current-row>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="CVE" width="130" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.cve_id || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="CWE" width="120" show-overflow-tooltip>
              <template #default="scope">
                <el-button
                  v-if="scope.row.cwe_id"
                  type="primary"
                  link
                  @click.stop="goToCweKnowledge(scope.row.cwe_id)"
                >
                  {{ scope.row.cwe_id }}
                </el-button>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="severity" label="严重性" width="100">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)">
                  {{ getSeverityName(scope.row.severity) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reporter" label="报告者" width="120" />
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadVulnerabilities"
              @current-change="loadVulnerabilities"
            />
          </div>
        </el-card>

        <el-card v-if="userStore.isAdmin" class="vuln-list completed-list">
          <div class="list-header">
            <h3>已完成漏洞</h3>
          </div>

          <div class="stats-grid completed-stats">
            <el-card class="stat-card resolved-card">
              <div class="stat-content">
                <div class="stat-number">{{ completedSummary.resolved || 0 }}</div>
                <div class="stat-label">已修复</div>
              </div>
            </el-card>

            <el-card class="stat-card closed-card">
              <div class="stat-content">
                <div class="stat-number">{{ completedSummary.closed || 0 }}</div>
                <div class="stat-label">已关闭</div>
              </div>
            </el-card>
          </div>

          <el-table :data="completedVulnerabilities" style="width: 100%" @row-click="handleRowClick" highlight-current-row>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="CVE" width="130" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.cve_id || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="CWE" width="120" show-overflow-tooltip>
              <template #default="scope">
                <el-button
                  v-if="scope.row.cwe_id"
                  type="primary"
                  link
                  @click.stop="goToCweKnowledge(scope.row.cwe_id)"
                >
                  {{ scope.row.cwe_id }}
                </el-button>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="status" label="完成状态" width="110">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reporter" label="提交者" width="120" />
            <el-table-column prop="assignee" label="完成负责人" width="140">
              <template #default="scope">
                {{ scope.row.assignee || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column prop="updated_at" label="完成时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.updated_at) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="completedCurrentPage"
              v-model:page-size="completedPageSize"
              :total="completedTotal"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadCompletedVulnerabilities"
              @current-change="loadCompletedVulnerabilities"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Pie, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'
import { DataBoard, Files, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
)

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('dashboard')
const stats = reactive({
  total: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0
})

const vulnerabilities = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const completedVulnerabilities = ref([])
const completedCurrentPage = ref(1)
const completedPageSize = ref(10)
const completedTotal = ref(0)
const completedSummary = reactive({
  resolved: 0,
  closed: 0
})
const analytics = reactive({
  typeDistribution: [],
  severityDistribution: [],
  timeTrend: []
})

const getRoleName = (role) => {
  const roleMap = {
    'reporter': '报告员',
    'engineer': '工程师',
    'manager': '管理员'
  }
  return roleMap[role] || role
}

const getSeverityName = (severity) => {
  const severityMap = {
    'critical': '严重',
    'high': '高危',
    'medium': '中等',
    'low': '低危',
    'CRITICAL': '严重',
    'HIGH': '高危',
    'MEDIUM': '中等',
    'LOW': '低危'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': 'success',
    'CRITICAL': 'danger',
    'HIGH': 'warning',
    'MEDIUM': 'info',
    'LOW': 'success'
  }
  return typeMap[severity] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'resolved': '已修复',
    'closed': '已关闭'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'processing': 'warning',
    'resolved': 'success',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'submit') {
    router.push('/submit')
  } else if (index === 'unassigned') {
    router.push('/unassigned')
  } else if (index === 'search') {
    router.push('/search')
  } else if (index === 'myAssigned') {
    router.push('/my-assigned')
  } else if (index === 'importCwe') {
    router.push('/import-cwe-json')
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const loadStats = async () => {
  try {
    const data = await vulnerabilityStore.getStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadVulnerabilities = async () => {
  try {
    const data = await vulnerabilityStore.getList(currentPage.value, pageSize.value)
    vulnerabilities.value = data.items || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载漏洞列表失败:', error)
  }
}

const loadCompletedVulnerabilities = async () => {
  if (!userStore.isAdmin) return

  try {
    const data = await vulnerabilityStore.getCompletedList(
      completedCurrentPage.value,
      completedPageSize.value
    )
    completedVulnerabilities.value = data.items || []
    completedTotal.value = data.total || 0
    completedSummary.resolved = data.summary?.resolved || 0
    completedSummary.closed = data.summary?.closed || 0
  } catch (error) {
    console.error('加载已完成漏洞列表失败:', error)
  }
}

const loadAnalytics = async () => {
  try {
    const data = await vulnerabilityStore.getAnalytics()
    analytics.typeDistribution = data.typeDistribution || []
    analytics.severityDistribution = data.severityDistribution || []
    analytics.timeTrend = data.timeTrend || []
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

const handleRowClick = (row) => {
  router.push(`/vulnerability/${row.id}`)
}

const goToCweKnowledge = (cweId) => {
  router.push(`/cwe/${encodeURIComponent(cweId)}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const typeChartData = computed(() => ({
  labels: analytics.typeDistribution.map(item => item.name),
  datasets: [
    {
      data: analytics.typeDistribution.map(item => item.value),
      backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#64748b'],
      borderWidth: 0
    }
  ]
}))

const severityChartData = computed(() => ({
  labels: analytics.severityDistribution.map(item => item.label),
  datasets: [
    {
      label: '漏洞数量',
      data: analytics.severityDistribution.map(item => item.value),
      backgroundColor: ['#dc2626', '#f97316', '#0ea5e9', '#22c55e'],
      borderRadius: 8,
      maxBarThickness: 44
    }
  ]
}))

const trendChartData = computed(() => ({
  labels: analytics.timeTrend.map(item => item.date),
  datasets: [
    {
      label: '新增漏洞',
      data: analytics.timeTrend.map(item => item.count),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.14)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
}))

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}

onMounted(() => {
  loadStats()
  loadAnalytics()
  loadVulnerabilities()
  loadCompletedVulnerabilities()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  height: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-left h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: #606266;
  font-size: 14px;
}

.main-content {
  display: flex;
  height: calc(100vh - 60px);
}

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 18px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.chart-tip {
  color: #909399;
  font-size: 12px;
}

.chart-wrap {
  height: 320px;
}

.trend-card {
  margin-bottom: 20px;
}

.trend-wrap {
  height: 280px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-card.critical {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.stat-card.high {
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
  color: white;
}

.stat-card.medium {
  background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.vuln-list {
  margin-top: 20px;
}

.completed-list {
  margin-top: 24px;
}

.list-header {
  margin-bottom: 15px;
}

.list-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.completed-stats {
  grid-template-columns: repeat(auto-fit, minmax(180px, 220px));
  margin-bottom: 20px;
}

.resolved-card {
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  color: white;
}

.closed-card {
  background: linear-gradient(135deg, #909399 0%, #b1b3b8 100%);
  color: white;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
