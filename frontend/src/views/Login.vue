<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true" />
    <div class="login-grid">
      <aside class="login-aside">
        <div class="aside-inner">
          <div class="brand-mark">
            <el-icon :size="28"><Lock /></el-icon>
          </div>
          <h2 class="aside-title">漏洞全生命周期管理</h2>
          <p class="aside-desc">
            集中收录、分级处置与闭环跟踪，让安全响应更高效。
          </p>
          <ul class="aside-points">
            <li><el-icon><CircleCheck /></el-icon> CVE / CWE 导入与检索</li>
            <li><el-icon><CircleCheck /></el-icon> 多角色协作与状态流转</li>
            <li><el-icon><CircleCheck /></el-icon> 风险统计与可视化</li>
          </ul>
        </div>
      </aside>

      <main class="login-main">
        <router-link to="/" class="back-home">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </router-link>

        <div class="login-card">
          <header class="login-header">
            <p class="eyebrow">安全运营工作台</p>
            <h1>欢迎回来</h1>
            <p class="sub">使用您的账号登录漏洞管理系统</p>
          </header>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username" label="用户名">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                clearable
                autocomplete="username"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon class="input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password" label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-alert
              v-if="errorMessage"
              :title="errorMessage"
              type="error"
              :closable="true"
              show-icon
              class="login-alert"
              @close="errorMessage = ''"
            />

            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="loading"
              native-type="submit"
              @click="handleLogin"
            >
              {{ loading ? '登录中…' : '登录' }}
            </el-button>
          </el-form>

          <footer class="login-footer">
            <span class="muted">还没有账户？</span>
            <router-link to="/register" class="register-link">立即注册</router-link>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { User, Key, Lock, CircleCheck, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref('')
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      errorMessage.value = ''

      try {
        const result = await userStore.login(loginForm)

        if (result.success) {
          const redirect = route.query.redirect || '/dashboard'
          router.push(redirect)
        } else {
          errorMessage.value = result.message
        }
      } catch {
        errorMessage.value = '登录失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #0f1419;
}

.login-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(64, 158, 255, 0.22), transparent),
    radial-gradient(ellipse 60% 40% at 100% 50%, rgba(118, 75, 162, 0.12), transparent),
    radial-gradient(ellipse 50% 30% at 0% 80%, rgba(64, 158, 255, 0.08), transparent),
    linear-gradient(180deg, #121820 0%, #0f1419 45%, #0c1015 100%);
  pointer-events: none;
}

.login-grid {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
}

.login-aside {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 5vw, 64px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.aside-inner {
  max-width: 380px;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.25), rgba(64, 158, 255, 0.08));
  border: 1px solid rgba(64, 158, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #79bbff;
  margin-bottom: 28px;
}

.aside-title {
  margin: 0 0 12px;
  font-size: clamp(22px, 2.5vw, 28px);
  font-weight: 600;
  color: #e8eaed;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.aside-desc {
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.55);
}

.aside-points {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aside-points li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
}

.aside-points .el-icon {
  color: #67c23a;
  flex-shrink: 0;
}

.login-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 48px);
  position: relative;
}

.back-home {
  position: absolute;
  top: clamp(20px, 3vw, 32px);
  left: clamp(20px, 3vw, 32px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-home:hover {
  color: #a0cfff;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 40px 36px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.login-header {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(64, 158, 255, 0.85);
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 600;
  color: #f0f2f5;
  letter-spacing: -0.02em;
}

.sub {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
}

.login-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  padding-bottom: 6px;
}

.login-form :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.55) inset, 0 0 0 3px rgba(64, 158, 255, 0.12);
}

.login-form :deep(.el-input__inner) {
  color: #e8eaed;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

.input-icon {
  color: rgba(255, 255, 255, 0.4);
}

.login-alert {
  margin-bottom: 16px;
  border-radius: 10px;
}

.login-alert :deep(.el-alert__title) {
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
}

.submit-btn:hover {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
}

.login-footer {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  font-size: 14px;
}

.muted {
  color: rgba(255, 255, 255, 0.45);
}

.register-link {
  margin-left: 6px;
  color: #79bbff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #a0cfff;
}

@media (max-width: 900px) {
  .login-grid {
    grid-template-columns: 1fr;
  }

  .login-aside {
    display: none;
  }

  .login-main {
    padding-top: 56px;
  }

  .back-home {
    top: 20px;
    left: 20px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 22px 24px;
    border-radius: 16px;
  }

  .login-header h1 {
    font-size: 22px;
  }
}
</style>
