<template>
  <div class="knowledge-container">
    <div class="navbar">
      <div class="nav-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>CWE 知识库</h2>
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
          <el-menu-item index="importCwe">
            <el-icon><Upload /></el-icon>
            <span>导入 CWE</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="content" v-loading="loading">
        <template v-if="knowledge">
          <el-card class="hero-card">
            <div class="hero-head">
              <div>
                <p class="eyebrow">知识库条目</p>
                <h3>{{ knowledge.cwe_id }}</h3>
              </div>
              <el-tag type="primary" size="large">{{ knowledge.total_related || 0 }} 条关联漏洞</el-tag>
            </div>
            <p class="hero-title">{{ knowledge.title }}</p>
            <p class="hero-desc">{{ knowledge.description }}</p>
          </el-card>

          <div class="summary-grid">
            <el-card class="summary-card">
              <div class="summary-title">严重</div>
              <div class="summary-value">{{ knowledge.severity_summary?.critical || 0 }}</div>
            </el-card>
            <el-card class="summary-card">
              <div class="summary-title">高危</div>
              <div class="summary-value">{{ knowledge.severity_summary?.high || 0 }}</div>
            </el-card>
            <el-card class="summary-card">
              <div class="summary-title">中等</div>
              <div class="summary-value">{{ knowledge.severity_summary?.medium || 0 }}</div>
            </el-card>
            <el-card class="summary-card">
              <div class="summary-title">低危</div>
              <div class="summary-value">{{ knowledge.severity_summary?.low || 0 }}</div>
            </el-card>
          </div>

          <div class="knowledge-grid">
            <el-card class="knowledge-card">
              <template #header>修复方式</template>
              <ol class="remediation-list">
                <li v-for="(item, index) in knowledge.remediation || []" :key="index">
                  {{ item }}
                </li>
              </ol>
            </el-card>

            <el-card class="knowledge-card">
              <template #header>常见漏洞</template>
              <div v-if="knowledge.common_vulnerabilities?.length" class="related-list">
                <div
                  v-for="item in knowledge.common_vulnerabilities"
                  :key="item.id"
                  class="related-item"
                  @click="goToVulnerability(item.id)"
                >
                  <div class="related-top">
                    <strong>#{{ item.id }}</strong>
                    <el-tag :type="getSeverityType(item.severity)" size="small">
                      {{ getSeverityName(item.severity) }}
                    </el-tag>
                  </div>
                  <p>{{ item.description }}</p>
                  <div class="related-meta">
                    <span>{{ item.cve_id || '无 CVE' }}</span>
                    <span>报告者：{{ item.reporter }}</span>
                    <span>{{ formatDate(item.updated_at) }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无关联漏洞示例" />
            </el-card>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, DataBoard, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('knowledge')
const loading = ref(false)
const knowledge = ref(null)

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
  else if (index === 'submit') router.push('/submit')
  else if (index === 'search') router.push('/search')
  else if (index === 'myAssigned') router.push('/my-assigned')
  else if (index === 'importCwe') router.push('/import-cwe-json')
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const goToVulnerability = (id) => {
  router.push(`/vulnerability/${id}`)
}

const loadKnowledge = async () => {
  const cweId = route.params.cweId
  if (!cweId) return

  loading.value = true
  try {
    knowledge.value = await vulnerabilityStore.getCweKnowledge(cweId)
  } catch (error) {
    ElMessage.error('加载 CWE 知识库失败')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadKnowledge()
})
</script>

<style scoped>
.knowledge-container {
  min-height: 100vh;
  background: #f5f7fa;
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
  min-height: calc(100vh - 60px);
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
  padding: 24px;
}

.hero-card {
  border-radius: 18px;
  margin-bottom: 24px;
}

.hero-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #909399;
}

.hero-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.hero-desc {
  color: #606266;
  line-height: 1.7;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  text-align: center;
}

.summary-title {
  color: #909399;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 30px;
  font-weight: 700;
  color: #303133;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 24px;
}

.knowledge-card {
  border-radius: 18px;
}

.remediation-list {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  line-height: 1.8;
}

.related-list {
  display: grid;
  gap: 12px;
}

.related-item {
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.related-item:hover {
  border-color: #409eff;
  transform: translateY(-1px);
}

.related-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.related-item p {
  margin: 0 0 10px;
  color: #303133;
  line-height: 1.6;
}

.related-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>
