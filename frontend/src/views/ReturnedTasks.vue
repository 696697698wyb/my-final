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
          <el-menu-item index="myReturned" v-if="userStore.isEngineer">
            <el-icon><RefreshLeft /></el-icon>
            <span>已退回任务</span>
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
              <h3>被退回给我的漏洞</h3>
              <p class="list-subtitle">展示最近被管理员退回的任务、退回时间、备注和累计退回次数</p>
            </div>
            <el-button @click="loadReturnedVulnerabilities">刷新</el-button>
          </div>

          <el-empty
            v-if="!loading && vulnerabilities.length === 0"
            description="当前没有被退回给你的任务"
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
            <el-table-column prop="return_count" label="退回次数" width="100" />
            <el-table-column prop="returned_at" label="退回时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.returned_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="returned_by" label="退回人" width="120">
              <template #default="scope">
                {{ scope.row.returned_by || '管理员' }}
              </template>
            </el-table-column>
            <el-table-column prop="return_note" label="退回备注" min-width="220" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.return_note || '—' }}
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
              @size-change="loadReturnedVulnerabilities"
              @current-change="loadReturnedVulnerabilities"
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
import { ElMessage } from 'element-plus'
import { DataBoard, Plus, RefreshLeft, Search, Tickets, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('myReturned')
const vulnerabilities = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const getRoleName = (role) => {
  const roleMap = { reporter: '报告员', engineer: '工程师', manager: '管理员' }
  return roleMap[role] || role
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') router.push('/dashboard')
  else if (index === 'submit') router.push('/submit')
  else if (index === 'search') router.push('/search')
  else if (index === 'myAssigned') router.push('/my-assigned')
  else if (index === 'myReturned') router.push('/my-returned')
  else if (index === 'importCwe') router.push('/import-cwe-json')
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

const loadReturnedVulnerabilities = async () => {
  if (!userStore.isEngineer) {
    ElMessage.warning('仅工程师可查看该页面')
    router.push('/dashboard')
    return
  }

  loading.value = true
  try {
    const data = await vulnerabilityStore.getMyReturnedList(
      userStore.userInfo.id,
      currentPage.value,
      pageSize.value
    )
    vulnerabilities.value = data.items || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载被退回任务失败:', error)
    ElMessage.error('加载被退回任务失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReturnedVulnerabilities()
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
  margin: 6px 0 0;
  color: #909399;
  font-size: 13px;
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
  }

  .content {
    padding: 16px;
  }
}
</style>
