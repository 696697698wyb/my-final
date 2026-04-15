<template>
  <div class="dashboard">
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

      <div class="content">
        <div class="stats-grid">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ total }}</div>
              <div class="stat-label">待处理总数</div>
            </div>
          </el-card>

          <el-card class="stat-card pending">
            <div class="stat-content">
              <div class="stat-number">{{ summary.pending || 0 }}</div>
              <div class="stat-label">待开始</div>
            </div>
          </el-card>

          <el-card class="stat-card processing">
            <div class="stat-content">
              <div class="stat-number">{{ summary.processing || 0 }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </el-card>
        </div>

        <el-card class="vuln-list">
          <div class="list-header">
            <div>
              <h3>分配给我的漏洞</h3>
              <p class="list-subtitle">仅展示当前分配给你且仍需处理的漏洞</p>
            </div>
            <div class="list-actions">
              <el-button @click="exportTasks" :disabled="!vulnerabilities.length">导出我的任务</el-button>
              <el-button @click="loadAssignedVulnerabilities">刷新</el-button>
            </div>
          </div>

          <el-empty
            v-if="!loading && vulnerabilities.length === 0"
            description="当前没有分配给你的待处理漏洞"
          />

          <el-table
            v-else
            :data="vulnerabilities"
            style="width: 100%"
            @row-click="handleRowClick"
            highlight-current-row
            v-loading="loading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="CVE" width="150" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.cve_id || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="CWE" width="140" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.cwe_id || '—' }}
              </template>
            </el-table-column>
            <el-table-column prop="cwe_type" label="CWE类型" width="130" show-overflow-tooltip />
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
            <el-table-column prop="updated_at" label="最近更新" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.updated_at) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadAssignedVulnerabilities"
              @current-change="loadAssignedVulnerabilities"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataBoard, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('myAssigned')
const vulnerabilities = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const summary = reactive({
  pending: 0,
  processing: 0
})

const getRoleName = (role) => {
  const roleMap = {
    reporter: '报告员',
    engineer: '工程师',
    manager: '管理员'
  }
  return roleMap[role] || role
}

const getSeverityName = (severity) => {
  const severityMap = {
    critical: '严重',
    high: '高危',
    medium: '中等',
    low: '低危',
    CRITICAL: '严重',
    HIGH: '高危',
    MEDIUM: '中等',
    LOW: '低危'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'success'
  }
  return typeMap[severity] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已修复',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    processing: 'warning',
    resolved: 'success',
    closed: 'info'
  }
  return typeMap[status] || 'info'
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') {
    router.push('/dashboard')
  } else if (index === 'submit') {
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

const handleRowClick = (row) => {
  router.push(`/vulnerability/${row.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadAssignedVulnerabilities = async () => {
  if (!userStore.isEngineer) {
    ElMessage.warning('仅工程师可查看该页面')
    router.push('/dashboard')
    return
  }

  loading.value = true
  try {
    const data = await vulnerabilityStore.getMyAssignedList(
      userStore.userInfo.id,
      currentPage.value,
      pageSize.value
    )
    vulnerabilities.value = data.items || []
    total.value = data.total || 0
    summary.pending = data.summary?.pending || 0
    summary.processing = data.summary?.processing || 0
  } catch (error) {
    console.error('加载工程师待处理漏洞失败:', error)
    ElMessage.error('加载工程师待处理漏洞失败')
  } finally {
    loading.value = false
  }
}

const exportTasks = () => {
  if (!vulnerabilities.value.length) {
    ElMessage.warning('当前没有可导出的任务')
    return
  }

  const headers = ['ID', 'CVE', 'CWE', '描述', '严重性', '状态', '报告者', '最近更新']
  const rows = vulnerabilities.value.map((item) => ([
    item.id,
    item.cve_id || '',
    item.cwe_id || '',
    `"${String(item.description || '').replace(/"/g, '""')}"`,
    getSeverityName(item.severity),
    getStatusName(item.status),
    item.reporter || '',
    formatDate(item.updated_at)
  ].join(',')))

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${userStore.userInfo.username}_tasks_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('任务导出成功')
}

onMounted(() => {
  loadAssignedVulnerabilities()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  background: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-left h2 {
  margin: 0;
  color: #303133;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: #606266;
  font-size: 14px;
}

.main-content {
  display: flex;
  min-height: calc(100vh - 60px);
}

.sidebar {
  width: 200px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.content {
  flex: 1;
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 14px;
}

.stat-card.pending {
  border-left: 4px solid #909399;
}

.stat-card.processing {
  border-left: 4px solid #e6a23c;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.vuln-list {
  border-radius: 14px;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.list-header h3 {
  margin: 0;
  color: #303133;
}

.list-subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 13px;
}

.list-actions {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content {
    padding: 16px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .list-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
