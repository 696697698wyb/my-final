<template>
  <div class="search-container">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>搜索漏洞</h2>
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
        <!-- 搜索过滤面板 -->
        <el-card class="search-panel">
          <div class="search-header">
            <h3>搜索和过滤</h3>
          </div>

          <el-form :model="searchForm" class="search-form" label-width="80px">
            <div class="form-row">
              <el-form-item label="关键词">
                <el-input
                  v-model="searchForm.keyword"
                  placeholder="搜索漏洞描述、CVE ID..."
                  clearable
                  @keyup.enter="performSearch"
                />
              </el-form-item>

              <el-form-item label="严重性">
                <el-select v-model="searchForm.severity" placeholder="全部" clearable>
                  <el-option label="严重" value="critical" />
                  <el-option label="高危" value="high" />
                  <el-option label="中等" value="medium" />
                  <el-option label="低危" value="low" />
                </el-select>
              </el-form-item>

              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="全部" clearable>
                  <el-option label="待处理" value="pending" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已修复" value="resolved" />
                  <el-option label="已关闭" value="closed" />
                </el-select>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="报告者">
                <el-input
                  v-model="searchForm.reporter"
                  placeholder="报告者用户名"
                  clearable
                />
              </el-form-item>

              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </div>

            <div class="form-actions">
              <el-button type="primary" @click="performSearch" :loading="searching">
                搜索
              </el-button>
              <el-button @click="resetSearch">重置</el-button>
              <el-button @click="exportResults" :disabled="!searchResults.length">
                导出结果
              </el-button>
            </div>
          </el-form>
        </el-card>

        <!-- 搜索结果 -->
        <el-card class="search-results">
          <div class="results-header">
            <h3>搜索结果</h3>
            <span class="result-count">共找到 {{ total }} 条记录</span>
          </div>

          <el-table
            :data="searchResults"
            style="width: 100%"
            v-loading="searching"
            @row-click="handleRowClick"
            highlight-current-row
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="cve_id" label="CVE ID" width="120">
              <template #default="scope">
                {{ scope.row.cve_id || '—' }}
              </template>
            </el-table-column>
            <el-table-column prop="cwe_type" label="CWE类型" width="150">
              <template #default="scope">
                {{ scope.row.cwe_type || '未关联' }}
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
            <el-table-column prop="created_at" label="提交时间" width="180">
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
              @size-change="performSearch"
              @current-change="performSearch"
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
import { ArrowLeft, DataBoard, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('search')
const searching = ref(false)
const searchResults = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  severity: '',
  status: '',
  reporter: '',
  dateRange: []
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
    'closed': 'default'
  }
  return typeMap[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') {
    router.push('/dashboard')
  } else if (index === 'submit') {
    router.push('/submit')
  } else if (index === 'myAssigned') {
    router.push('/my-assigned')
  } else if (index === 'importCwe') {
    router.push('/import-cwe-json')
  }
}

const goBack = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const performSearch = async () => {
  searching.value = true
  try {
    const searchParams = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchForm.keyword,
      severity: searchForm.severity,
      status: searchForm.status,
      reporter: searchForm.reporter
    }

    // 添加时间范围过滤
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      searchParams.start_date = searchForm.dateRange[0]
      searchParams.end_date = searchForm.dateRange[1]
    }

    const result = await vulnerabilityStore.search(searchParams)
    if (result) {
      searchResults.value = result.items || []
      total.value = result.total || 0
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  currentPage.value = 1
  searchResults.value = []
  total.value = 0
}

const handleRowClick = (row) => {
  router.push(`/vulnerability/${row.id}`)
}

const exportResults = () => {
  // 简单的CSV导出功能
  if (!searchResults.value.length) return

  const headers = ['ID', 'CVE ID', 'CWE类型', '描述', '严重性', '状态', '报告者', '提交时间']
  const csvContent = [
    headers.join(','),
    ...searchResults.value.map(item => [
      item.id,
      item.cve_id || '',
      `"${(item.cwe_type || '未关联').replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`, // 处理引号
      getSeverityName(item.severity),
      getStatusName(item.status),
      item.reporter,
      formatDate(item.created_at)
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `vulnerability_search_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 初始加载时执行搜索
onMounted(() => {
  performSearch()
})
</script>

<style scoped>
.search-container {
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  font-size: 14px;
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

.search-panel {
  margin-bottom: 20px;
}

.search-header {
  margin-bottom: 20px;
}

.search-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.search-form {
  margin-top: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.search-results {
  margin-top: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.results-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.result-count {
  color: #909399;
  font-size: 14px;
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

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .results-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
