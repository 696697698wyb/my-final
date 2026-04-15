<template>
  <div class="catalog-container">
    <div class="navbar">
      <div class="nav-left">
        <h2>CWE 类型总览</h2>
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
          <el-menu-item index="cweTypes">
            <el-icon><CollectionTag /></el-icon>
            <span>CWE 类型</span>
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
        <div class="page-header">
          <div>
            <h3>全部 CWE 类型</h3>
            <p>共 {{ total }} 类，当前显示 {{ filteredCatalog.length }} 类。点击任意类型或代表 CWE 进入对应知识库详情。</p>
          </div>
        </div>

        <el-card class="filter-panel">
          <el-input
            v-model="searchKeyword"
            clearable
            placeholder="按 CWE 类型、标题或 CWE ID 搜索"
          />
        </el-card>

        <div class="catalog-grid">
          <el-card
            v-for="item in filteredCatalog"
            :key="item.cwe_type"
            class="catalog-card"
          >
            <div class="card-top">
              <span class="type-pill">{{ item.cwe_type }}</span>
              <span class="count-pill">{{ item.count }} 条关联漏洞</span>
            </div>
            <h4>{{ item.title }}</h4>
            <p class="rep-cwe">
              代表 CWE：
              <span class="link-text" @click.stop="goToKnowledge(item.representative_cwe)">
                {{ item.representative_cwe }}
              </span>
            </p>
            <div class="cwe-list">
              <el-tag
                v-for="cwe in item.cwes.slice(0, 5)"
                :key="cwe.cwe_id"
                size="small"
                class="cwe-tag"
                @click.stop="goToKnowledge(cwe.cwe_id)"
              >
                {{ cwe.cwe_id }}
              </el-tag>
            </div>
            <div class="sample-section" v-if="item.sample_vulnerabilities?.length">
              <p class="sample-title">代表漏洞样本</p>
              <div
                v-for="sample in item.sample_vulnerabilities"
                :key="sample.id"
                class="sample-item"
                @click="goToVulnerability(sample.id)"
              >
                <div class="sample-meta">
                  <span>#{{ sample.id }}</span>
                  <span>{{ sample.cwe_id }}</span>
                  <span>{{ sample.severity || 'unknown' }}</span>
                </div>
                <p>{{ sample.description }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CollectionTag, DataBoard, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('cweTypes')
const loading = ref(false)
const catalog = ref([])
const total = ref(0)
const searchKeyword = ref('')

const filteredCatalog = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return catalog.value
  }
  return catalog.value.filter((item) => {
    const cweMatches = (item.cwes || []).some((cwe) => cwe.cwe_id.toLowerCase().includes(keyword))
    return item.cwe_type.toLowerCase().includes(keyword)
      || item.title.toLowerCase().includes(keyword)
      || item.representative_cwe.toLowerCase().includes(keyword)
      || cweMatches
  })
})

const getRoleName = (role) => {
  const roleMap = { reporter: '报告员', engineer: '工程师', manager: '管理员' }
  return roleMap[role] || role
}

const handleMenuSelect = (index) => {
  if (index === 'dashboard') router.push('/dashboard')
  else if (index === 'cweTypes') router.push('/cwe-types')
  else if (index === 'submit') router.push('/submit')
  else if (index === 'search') router.push('/search')
  else if (index === 'myAssigned') router.push('/my-assigned')
  else if (index === 'importCwe') router.push('/import-cwe-json')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const goToKnowledge = (cweId) => {
  router.push(`/cwe/${encodeURIComponent(cweId)}`)
}

const goToVulnerability = (id) => {
  router.push(`/vulnerability/${id}`)
}

const loadCatalog = async () => {
  loading.value = true
  try {
    const data = await vulnerabilityStore.getCweCatalog()
    catalog.value = data.items || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCatalog()
})
</script>

<style scoped>
.catalog-container {
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

.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0 0 8px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.filter-panel {
  margin-bottom: 20px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.catalog-card {
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.catalog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

.count-pill {
  color: #909399;
  font-size: 12px;
}

.catalog-card h4 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 18px;
}

.rep-cwe {
  margin: 0 0 14px;
  color: #606266;
}

.link-text {
  color: #2563eb;
  cursor: pointer;
}

.cwe-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cwe-tag {
  margin-right: 0;
  cursor: pointer;
}

.sample-section {
  margin-top: 18px;
  border-top: 1px solid #ebeef5;
  padding-top: 14px;
}

.sample-title {
  margin: 0 0 10px;
  color: #606266;
  font-size: 13px;
  font-weight: 600;
}

.sample-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  margin-bottom: 10px;
  cursor: pointer;
}

.sample-item p {
  margin: 6px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.sample-meta {
  display: flex;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
  flex-wrap: wrap;
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
