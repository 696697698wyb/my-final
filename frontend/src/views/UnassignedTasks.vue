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
        <el-menu :default-active="activeMenu" class="sidebar-menu" @select="handleMenuSelect">
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
          <el-menu-item index="importCwe">
            <el-icon><Upload /></el-icon>
            <span>导入 CWE</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="content">
        <el-card class="vuln-list">
          <div class="list-header">
            <div>
              <h3>未分配任务</h3>
              <p class="list-subtitle">支持选择多条任务批量智能分配，也支持一键分配全部未分配任务</p>
            </div>
            <div class="list-actions">
              <el-button type="success" @click="handleBulkAssignSelected" :disabled="!selectedIds.length">
                智能分配选中任务
              </el-button>
              <el-button type="warning" @click="handleBulkAssignAll" :disabled="!total">
                一键分配全部未分配任务
              </el-button>
              <el-button @click="loadUnassignedVulnerabilities">刷新</el-button>
            </div>
          </div>

          <el-table
            :data="vulnerabilities"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            highlight-current-row
            v-loading="loading"
          >
            <el-table-column type="selection" width="55" />
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
                <span v-else>未关联</span>
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
            <el-table-column prop="reporter" label="报告者" width="120" />
            <el-table-column prop="created_at" label="提交时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
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
              @size-change="loadUnassignedVulnerabilities"
              @current-change="loadUnassignedVulnerabilities"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataBoard, Files, Plus, Search, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('unassigned')
const loading = ref(false)
const vulnerabilities = ref([])
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getRoleName = (role) => {
  const roleMap = { reporter: '报告员', engineer: '工程师', manager: '管理员' }
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

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleMenuSelect = (index) => {
  if (index === 'dashboard') router.push('/dashboard')
  else if (index === 'unassigned') router.push('/unassigned')
  else if (index === 'submit') router.push('/submit')
  else if (index === 'search') router.push('/search')
  else if (index === 'importCwe') router.push('/import-cwe-json')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleRowClick = (row) => {
  router.push(`/vulnerability/${row.id}`)
}

const goToCweKnowledge = (cweId) => {
  router.push(`/cwe/${encodeURIComponent(cweId)}`)
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(item => item.id)
}

const loadUnassignedVulnerabilities = async () => {
  if (!userStore.isAdmin) {
    ElMessage.warning('仅管理员可查看该页面')
    router.push('/dashboard')
    return
  }

  loading.value = true
  try {
    const data = await vulnerabilityStore.getUnassignedList(currentPage.value, pageSize.value)
    vulnerabilities.value = data.items || []
    total.value = data.total || 0
    selectedIds.value = []
  } catch (error) {
    console.error('加载未分配任务失败:', error)
    ElMessage.error('加载未分配任务失败')
  } finally {
    loading.value = false
  }
}

const runBulkAssign = async (assignAll = false) => {
  loading.value = true
  try {
    const result = await vulnerabilityStore.bulkAutoAssign(selectedIds.value, assignAll)
    if (result.success) {
      ElMessage.success(`已自动分配 ${result.assignedCount} 条任务`)
      await loadUnassignedVulnerabilities()
    } else {
      ElMessage.error(result.message || '批量智能分配失败')
    }
  } finally {
    loading.value = false
  }
}

const handleBulkAssignSelected = async () => {
  if (!selectedIds.value.length) return
  await runBulkAssign(false)
}

const handleBulkAssignAll = async () => {
  await ElMessageBox.confirm(
    '将对当前所有未分配任务执行智能分配。是否继续？',
    '批量智能分配',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  await runBulkAssign(true)
}

onMounted(() => {
  loadUnassignedVulnerabilities()
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
  flex-wrap: wrap;
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
    flex-direction: column;
  }
}
</style>
