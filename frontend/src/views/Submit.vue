<template>
  <div class="submit-container">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>提交漏洞</h2>
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
        <el-card class="submit-form-card">
          <div class="form-header">
            <h3>漏洞信息</h3>
          </div>

          <el-form
            :model="vulnerabilityForm"
            :rules="formRules"
            ref="formRef"
            label-width="100px"
            class="submit-form"
          >
            <el-form-item label="CVE ID" prop="cve_id">
              <el-input
                v-model="vulnerabilityForm.cve_id"
                placeholder="可选，如: CVE-2024-12345"
                clearable
              />
            </el-form-item>

            <el-form-item label="漏洞描述" prop="description">
              <el-input
                v-model="vulnerabilityForm.description"
                type="textarea"
                :rows="6"
                placeholder="请详细描述漏洞信息..."
                resize="vertical"
              />
            </el-form-item>

            <el-form-item label="AI预测">
              <el-button
                type="info"
                @click="handleAIPredict"
                :loading="aiLoading"
                :disabled="!vulnerabilityForm.description"
              >
                AI预测严重性
              </el-button>
              <span v-if="aiResult" class="ai-result">
                预测结果: <el-tag :type="getSeverityType(aiResult)">{{ getSeverityName(aiResult) }}</el-tag>
              </span>
            </el-form-item>

            <el-form-item label="严重性" prop="severity">
              <el-select
                v-model="vulnerabilityForm.severity"
                placeholder="请选择严重性"
                style="width: 200px"
              >
                <el-option label="严重" value="critical" />
                <el-option label="高危" value="high" />
                <el-option label="中等" value="medium" />
                <el-option label="低危" value="low" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="submitting"
                size="large"
              >
                提交漏洞
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="message" class="form-message" :class="messageType">
            {{ message }}
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useVulnerabilityStore } from '../stores/vulnerability'
import { ArrowLeft, DataBoard, Plus, Search, Tickets, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const vulnerabilityStore = useVulnerabilityStore()

const activeMenu = ref('submit')
const formRef = ref()
const aiLoading = ref(false)
const submitting = ref(false)
const message = ref('')
const messageType = ref('')
const aiResult = ref('')

const vulnerabilityForm = reactive({
  cve_id: '',
  description: '',
  severity: ''
})

const formRules = {
  description: [
    { required: true, message: '请输入漏洞描述', trigger: 'blur' }
  ],
  severity: [
    { required: true, message: '请选择严重性', trigger: 'change' }
  ]
}

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
    'low': '低危'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': 'success'
  }
  return typeMap[severity] || 'info'
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') {
    router.push('/dashboard')
  } else if (index === 'search') {
    router.push('/search')
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

const handleAIPredict = async () => {
  if (!vulnerabilityForm.description) {
    showMessage('请先输入漏洞描述', 'error')
    return
  }

  aiLoading.value = true
  try {
    const result = await vulnerabilityStore.predictSeverity(vulnerabilityForm.description)
    if (result.success) {
      aiResult.value = result.severity
      vulnerabilityForm.severity = result.severity
      showMessage('AI预测完成', 'success')
    } else {
      showMessage(result.message || 'AI预测失败', 'error')
    }
  } catch (error) {
    showMessage('AI预测服务异常', 'error')
  } finally {
    aiLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      message.value = ''

      try {
        const result = await vulnerabilityStore.submitVulnerability({
          ...vulnerabilityForm,
          user_id: userStore.userInfo.id
        })

        if (result.success) {
          showMessage('漏洞提交成功', 'success')
          // 清空表单
          vulnerabilityForm.cve_id = ''
          vulnerabilityForm.description = ''
          vulnerabilityForm.severity = ''
          aiResult.value = ''
        } else {
          showMessage(result.message || '提交失败', 'error')
        }
      } catch (error) {
        showMessage('提交失败，请稍后重试', 'error')
      } finally {
        submitting.value = false
      }
    }
  })
}

const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type

  // 3秒后自动清除消息
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.submit-container {
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

.submit-form-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
}

.form-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.submit-form {
  margin-top: 20px;
}

.ai-result {
  margin-left: 15px;
  font-size: 14px;
  color: #606266;
}

.form-message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
}

.form-message.success {
  background-color: #f0f9ff;
  border: 1px solid #bae7ff;
  color: #1890ff;
}

.form-message.error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .submit-form-card {
    margin: 10px;
  }

  .form-header {
    padding: 15px;
  }
}
</style>
