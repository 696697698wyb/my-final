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
          <el-menu-item index="submit">
            <el-icon><Plus /></el-icon>
            <span>提交漏洞</span>
          </el-menu-item>
          <el-menu-item index="search">
            <el-icon><Search /></el-icon>
            <span>搜索漏洞</span>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'
import { DataBoard, Plus, Search, Upload } from '@element-plus/icons-vue'

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
  } else if (index === 'search') {
    router.push('/search')
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

    // 调试：检查状态值
    console.log('漏洞数据:', vulnerabilities.value)
    vulnerabilities.value.forEach((vuln, index) => {
      console.log(`漏洞 ${index}: ID=${vuln.id}, 状态=${vuln.status}, 类型=${getStatusType(vuln.status)}, 显示名称=${getStatusName(vuln.status)}`)
    })
  } catch (error) {
    console.error('加载漏洞列表失败:', error)
  }
}

const handleRowClick = (row) => {
  router.push(`/vulnerability/${row.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadStats()
  loadVulnerabilities()
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
}
</style>