<template>
  <div class="register-page">
    <div class="register-bg" aria-hidden="true" />
    <div class="register-grid">
      <aside class="register-aside">
        <div class="aside-inner">
          <div class="brand-mark">
            <el-icon :size="26"><UserFilled /></el-icon>
          </div>
          <h2 class="aside-title">加入协作空间</h2>
          <p class="aside-desc">
            注册后按角色参与漏洞上报、处置与统计，数据仅对授权成员可见。
          </p>
          <ul class="aside-points">
            <li><el-icon><CircleCheck /></el-icon> 报告员：提交与跟踪漏洞</li>
            <li><el-icon><CircleCheck /></el-icon> 工程师：处理与修复闭环</li>
            <li><el-icon><CircleCheck /></el-icon> 管理员：分配与全局视图</li>
          </ul>
        </div>
      </aside>

      <main class="register-main">
        <router-link to="/" class="back-home">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </router-link>

        <div class="register-card">
          <header class="register-header">
            <p class="eyebrow">创建账户</p>
            <h1>注册</h1>
            <p class="sub">填写信息后即可使用漏洞管理系统</p>
          </header>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            label-position="top"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="username" label="用户名" class="form-row-anim d1">
              <el-input
                v-model="registerForm.username"
                placeholder="至少 3 个字符"
                size="large"
                clearable
                autocomplete="username"
              >
                <template #prefix>
                  <el-icon class="input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password" label="密码" class="form-row-anim d2">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="设置登录密码"
                size="large"
                show-password
                autocomplete="new-password"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="role" label="角色" class="form-row-anim d3">
              <el-select
                v-model="registerForm.role"
                placeholder="选择您的角色"
                size="large"
                class="role-select"
                teleported
              >
                <template #prefix>
                  <el-icon class="input-icon prefix-in-select"><OfficeBuilding /></el-icon>
                </template>
                <el-option label="报告员" value="reporter" />
                <el-option label="工程师" value="engineer" />
                <el-option label="管理员" value="manager" />
              </el-select>
            </el-form-item>

            <el-alert
              v-if="errorMessage"
              :title="errorMessage"
              type="error"
              :closable="true"
              show-icon
              class="register-alert"
              @close="errorMessage = ''"
            />

            <el-button
              type="primary"
              size="large"
              class="submit-btn form-row-anim d4"
              :loading="loading"
              native-type="submit"
              @click="handleRegister"
            >
              {{ loading ? '提交中…' : '完成注册' }}
            </el-button>
          </el-form>

          <footer class="register-footer">
            <span class="muted">已有账户？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  User,
  Key,
  UserFilled,
  CircleCheck,
  ArrowLeft,
  OfficeBuilding
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref('')
const registerFormRef = ref()

const registerForm = reactive({
  username: '',
  password: '',
  role: 'reporter'
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名最少3个字符', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      errorMessage.value = ''

      try {
        const result = await userStore.register(registerForm)

        if (result.success) {
          router.push('/login')
        } else {
          errorMessage.value = result.message
        }
      } catch {
        errorMessage.value = '注册失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #0f1419;
}

.register-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 40% at 75% -10%, rgba(64, 158, 255, 0.12), transparent),
    radial-gradient(ellipse 55% 35% at 0% 45%, rgba(64, 158, 255, 0.1), transparent),
    radial-gradient(ellipse 45% 28% at 100% 80%, rgba(118, 75, 162, 0.09), transparent),
    linear-gradient(195deg, #121820 0%, #0f1419 50%, #0c1015 100%);
  pointer-events: none;
}

.register-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 60%, rgba(64, 158, 255, 0.06), transparent 55%);
  animation: bg-soft-pulse 14s ease-in-out infinite;
}

@keyframes bg-soft-pulse {
  0%,
100% {
    opacity: 0.55;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.03);
  }
}

.register-grid {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
}

.register-aside {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 5vw, 64px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.aside-inner {
  max-width: 380px;
  animation: aside-enter 0.65s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes aside-enter {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.22), rgba(64, 158, 255, 0.06));
  border: 1px solid rgba(64, 158, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #79bbff;
  margin-bottom: 28px;
  transition: transform 0.35s ease, border-color 0.35s ease;
}

.brand-mark:hover {
  transform: translateY(-2px);
  border-color: rgba(64, 158, 255, 0.5);
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
  transition: transform 0.25s ease, color 0.25s ease;
}

.aside-points li:hover {
  transform: translateX(4px);
  color: rgba(255, 255, 255, 0.88);
}

.aside-points .el-icon {
  color: #67c23a;
  flex-shrink: 0;
}

.register-main {
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

.register-card {
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
  animation: card-rise 0.58s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: 0.08s;
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(64, 158, 255, 0.88);
}

.register-header h1 {
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

.register-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  padding-bottom: 6px;
}

.register-form :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25) inset;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(64, 158, 255, 0.55) inset,
    0 0 0 3px rgba(64, 158, 255, 0.12);
}

.register-form :deep(.el-input__inner) {
  color: #e8eaed;
}

.register-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

.input-icon {
  color: rgba(255, 255, 255, 0.4);
}

.role-select {
  width: 100%;
}

.register-form :deep(.role-select .el-select__wrapper) {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  min-height: 40px;
  transition: box-shadow 0.2s ease;
}

.register-form :deep(.role-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25) inset;
}

.register-form :deep(.role-select .el-select__wrapper.is-focused) {
  box-shadow:
    0 0 0 1px rgba(64, 158, 255, 0.55) inset,
    0 0 0 3px rgba(64, 158, 255, 0.12);
}

.register-form :deep(.role-select .el-select__placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

.register-form :deep(.role-select .el-select__selected-item) {
  color: #e8eaed;
}

.prefix-in-select {
  margin-right: 8px;
}

.form-row-anim {
  animation: row-fade 0.5s ease backwards;
}

.form-row-anim.d1 {
  animation-delay: 0.2s;
}
.form-row-anim.d2 {
  animation-delay: 0.28s;
}
.form-row-anim.d3 {
  animation-delay: 0.36s;
}
.form-row-anim.d4 {
  animation-delay: 0.44s;
}

@keyframes row-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-alert {
  margin-bottom: 16px;
  border-radius: 10px;
}

.register-alert :deep(.el-alert__title) {
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
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.45);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-footer {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  font-size: 14px;
}

.muted {
  color: rgba(255, 255, 255, 0.45);
}

.login-link {
  margin-left: 6px;
  color: #79bbff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #a0cfff;
}

@media (max-width: 900px) {
  .register-grid {
    grid-template-columns: 1fr;
  }

  .register-aside {
    display: none;
  }

  .register-main {
    padding-top: 56px;
  }

  .back-home {
    top: 20px;
    left: 20px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 28px 22px 24px;
    border-radius: 16px;
  }

  .register-header h1 {
    font-size: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .register-bg::after,
  .aside-inner,
  .register-card,
  .form-row-anim {
    animation: none !important;
  }

  .brand-mark,
  .aside-points li,
  .submit-btn,
  .back-home,
  .login-link {
    transition: none !important;
  }

  .brand-mark:hover,
  .submit-btn:hover:not(:disabled) {
    transform: none;
  }

  .aside-points li:hover {
    transform: none;
  }
}
</style>
