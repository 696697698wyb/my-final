<template>
  <div class="import-container">
    <div class="navbar">
      <div class="nav-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>JSON 导入漏洞</h2>
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
          <el-menu-item index="importCwe">
            <el-icon><Upload /></el-icon>
            <span>导入 CWE</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="content">
        <el-card class="import-card">
          <div class="card-header">
            <h3>上传 JSON 文件</h3>
            <p class="hint">
              支持含 <code>cwe</code> / <code>cwe_id</code> 等字段的报告、简表 CVE 记录，以及官方
              <code>CVE_RECORD</code>（CVE JSON 5.1）。大文件由<strong>服务端解析</strong>，不会在浏览器里整份读入，避免页面卡死。
            </p>
          </div>

          <el-upload
            class="upload-block"
            drag
            accept=".json,application/json"
            :auto-upload="false"
            :limit="1"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="el-upload__text">将 JSON 文件拖到此处，或<em>点击选择</em></div>
          </el-upload>

          <div class="actions">
            <el-button type="primary" :loading="parsing" :disabled="!fileReady" @click="runParse">
              解析 JSON
            </el-button>
            <el-button :disabled="!previewRows.length" @click="clearPreview">清空预览</el-button>
          </div>

          <el-alert
            v-if="parseMessage"
            :title="parseMessage"
            :type="parseAlertType"
            class="parse-alert"
            show-icon
            :closable="false"
          />

          <template v-if="previewRows.length">
            <el-divider content-position="left">预览（共 {{ previewRows.length }} 条）</el-divider>
            <el-table :data="previewRows" border stripe max-height="420" style="width: 100%">
              <el-table-column label="CWE" width="110">
                <template #default="scope">
                  {{ scope.row.cwe_id || '—' }}
                </template>
              </el-table-column>
              <el-table-column prop="cve_id" label="CVE" width="140" show-overflow-tooltip />
              <el-table-column prop="severity" label="严重性" width="100">
                <template #default="scope">
                  <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                    {{ getSeverityName(scope.row.severity) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
              <el-table-column label="操作" width="90" fixed="right">
                <template #default="scope">
                  <el-button type="danger" link size="small" @click="removeRow(scope.$index)">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="confirm-bar">
              <el-button
                type="success"
                size="large"
                :loading="importing"
                @click="confirmImport"
              >
                确认导入到数据库
              </el-button>
            </div>
          </template>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, DataBoard, Plus, Search, Upload, UploadFilled } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { vulnerabilityAPI } from '../api/vulnerability'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('importCwe')
const fileReady = ref(false)
const pendingFile = ref(null)
const parsing = ref(false)
const importing = ref(false)
const previewRows = ref([])
const parseMessage = ref('')
const parseAlertType = ref('info')

const getRoleName = (role) => {
  const roleMap = { reporter: '报告员', engineer: '工程师', manager: '管理员' }
  return roleMap[role] || role
}

const getSeverityName = (severity) => {
  const severityMap = {
    critical: '严重',
    high: '高危',
    medium: '中等',
    low: '低危'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return typeMap[severity] || 'info'
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') router.push('/dashboard')
  else if (index === 'submit') router.push('/submit')
  else if (index === 'search') router.push('/search')
}

const goBack = () => router.push('/dashboard')

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const onFileChange = (uploadFile) => {
  const raw = uploadFile.raw
  if (!raw) return
  pendingFile.value = raw
  fileReady.value = true
  parseMessage.value = ''
  previewRows.value = []
}

const onFileRemove = () => {
  pendingFile.value = null
  fileReady.value = false
  previewRows.value = []
  parseMessage.value = ''
}

const runParse = async () => {
  if (!pendingFile.value) {
    ElMessage.warning('请先选择 JSON 文件')
    return
  }

  parsing.value = true
  parseMessage.value = ''
  try {
    const res = await vulnerabilityAPI.parseCweJsonFile(pendingFile.value)
    const items = res.items || []
    previewRows.value = items.map((row) => ({ ...row }))

    if (res.status && res.status.includes('成功') && items.length) {
      parseMessage.value = `已解析 ${items.length} 条记录，请核对后导入。`
      parseAlertType.value = 'success'
      ElMessage.success(res.status)
    } else {
      parseMessage.value = res.status || '未解析到条目'
      parseAlertType.value = items.length ? 'warning' : 'error'
      if (!items.length) {
        ElMessage.warning(res.status || '未解析到记录')
      }
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('解析请求失败，请检查后端服务')
  } finally {
    parsing.value = false
  }
}

const clearPreview = () => {
  previewRows.value = []
  parseMessage.value = ''
}

const removeRow = (index) => {
  previewRows.value.splice(index, 1)
}

const confirmImport = async () => {
  if (!previewRows.value.length) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  importing.value = true
  try {
    const res = await vulnerabilityAPI.importCweJson({
      user_id: userStore.userInfo.id,
      items: previewRows.value
    })
    const created = res.created ?? 0
    if (created > 0) {
      ElMessage.success(`成功导入 ${created} 条漏洞记录`)
      previewRows.value = []
      parseMessage.value = ''
    } else {
      ElMessage.warning(res.status || '导入未完成')
    }
    if (res.errors && res.errors.length) {
      console.warn('导入部分错误', res.errors)
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('导入请求失败')
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.import-container {
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

.import-card {
  max-width: 960px;
  margin: 0 auto;
}

.card-header h3 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 18px;
}

.hint {
  margin: 0 0 16px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.hint code {
  padding: 0 4px;
  background: #f4f4f5;
  border-radius: 3px;
  font-size: 13px;
}

.upload-block {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.parse-alert {
  margin-top: 16px;
}

.confirm-bar {
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
}
</style>
