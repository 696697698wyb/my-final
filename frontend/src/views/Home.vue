<template>
  <div class="home-page">
    <div class="home-bg" aria-hidden="true" />

    <template v-if="!userStore.isLoggedIn">
      <header class="home-header">
        <div class="header-inner">
          <router-link to="/" class="brand">
            <span class="brand-mark" aria-hidden="true">
              <el-icon :size="22"><Lock /></el-icon>
            </span>
            <span class="brand-text">漏洞管理系统</span>
          </router-link>
          <nav class="header-nav" aria-label="账户">
            <router-link to="/login" class="nav-link">登录</router-link>
            <router-link to="/register" class="nav-btn">注册</router-link>
          </nav>
        </div>
      </header>

      <main class="home-main">
        <section class="hero">
          <p class="eyebrow hero-anim d1">安全运营</p>
          <h1 class="hero-title hero-anim d2">漏洞收录、处置与统计，在一处完成</h1>
          <p class="hero-lead hero-anim d3">
            支持手工上报与 JSON 导入，按角色协作推进状态，用数据看清风险分布。
          </p>
          <div class="hero-cta hero-anim d4">
            <el-button type="primary" size="large" class="btn-primary" @click="goToLogin">
              立即登录
            </el-button>
            <el-button size="large" class="btn-secondary" @click="goToRegister">
              创建账户
            </el-button>
          </div>
        </section>

        <section class="features" aria-label="能力概览">
          <article class="feature-card card-anim c1">
            <div class="feature-icon">
              <el-icon :size="28"><Upload /></el-icon>
            </div>
            <h2>导入与登记</h2>
            <p>CVE记录、简表或 CWE 字段均可解析预览，确认后入库，减少手工录入。</p>
          </article>
          <article class="feature-card card-anim c2">
            <div class="feature-icon">
              <el-icon :size="28"><DataLine /></el-icon>
            </div>
            <h2>流程与协作</h2>
            <p>待处理、处理中、已修复等状态清晰可筛，便于工程师与管理员分工。</p>
          </article>
          <article class="feature-card card-anim c3">
            <div class="feature-icon">
              <el-icon :size="28"><Key /></el-icon>
            </div>
            <h2>角色与权限</h2>
            <p>报告员、工程师、管理员分权使用，登录后即可进入对应工作台。</p>
          </article>
        </section>
      </main>

      <footer class="home-footer">
        <p>企业内部使用 · 请妥善保管账号</p>
      </footer>
    </template>

    <div v-else class="redirect-wrap">
      <el-icon class="loading-icon" aria-hidden="true"><Loading /></el-icon>
      <p>正在进入工作台…</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Lock, Upload, DataLine, Key, Loading } from '@element-plus/icons-vue'
import { onMounted, watch } from 'vue'

const router = useRouter()
const userStore = useUserStore()

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

watch(
  () => userStore.isLoggedIn,
  (newValue) => {
    if (newValue) {
      router.push('/dashboard')
    }
  }
)

onMounted(() => {
  if (userStore.isLoggedIn) {
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #0f1419;
  display: flex;
  flex-direction: column;
}

.home-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 85% 55% at 50% -25%, rgba(64, 158, 255, 0.18), transparent),
    radial-gradient(ellipse 50% 40% at 100% 30%, rgba(118, 75, 162, 0.1), transparent),
    radial-gradient(ellipse 45% 35% at 0% 70%, rgba(64, 158, 255, 0.07), transparent),
    linear-gradient(180deg, #121820 0%, #0f1419 40%, #0c1015 100%);
  pointer-events: none;
}

.home-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 60%, rgba(64, 158, 255, 0.05), transparent 50%);
  animation: bg-breathe 16s ease-in-out infinite;
}

@keyframes bg-breathe {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.85;
  }
}

.home-header {
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(15, 20, 25, 0.65);
}

.header-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #e8eaed;
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(64, 158, 255, 0.22), rgba(64, 158, 255, 0.06));
  border: 1px solid rgba(64, 158, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #79bbff;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav-link:hover {
  color: #e8eaed;
  background: rgba(255, 255, 255, 0.06);
}

.nav-btn {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #0f1419;
  background: #79bbff;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.nav-btn:hover {
  background: #a0cfff;
  transform: translateY(-1px);
}

.home-main {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 72px) 24px 48px;
  width: 100%;
}

.hero {
  max-width: 720px;
  margin-bottom: clamp(48px, 10vw, 80px);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(64, 158, 255, 0.9);
}

.hero-title {
  margin: 0 0 16px;
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  font-weight: 600;
  line-height: 1.25;
  color: #f0f2f5;
  letter-spacing: -0.03em;
}

.hero-lead {
  margin: 0 0 28px;
  font-size: clamp(0.95rem, 1.8vw, 1.05rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.52);
  max-width: 560px;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-primary {
  min-width: 132px;
  height: 44px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.35);
}

.btn-secondary {
  min-width: 132px;
  height: 44px;
  font-weight: 600;
  border-radius: 10px;
  --el-button-bg-color: rgba(255, 255, 255, 0.08);
  --el-button-border-color: rgba(255, 255, 255, 0.18);
  --el-button-text-color: #e8eaed;
  --el-button-hover-bg-color: rgba(255, 255, 255, 0.12);
  --el-button-hover-border-color: rgba(255, 255, 255, 0.28);
  --el-button-hover-text-color: #fff;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  padding: 24px 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  border-color: rgba(64, 158, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.12);
  border: 1px solid rgba(64, 158, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #79bbff;
  margin-bottom: 16px;
}

.feature-card h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #e8eaed;
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
}

.home-footer {
  position: relative;
  z-index: 1;
  padding: 20px 24px 28px;
  text-align: center;
}

.home-footer p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.redirect-wrap {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 15px;
}

.loading-icon {
  font-size: 32px;
  color: #79bbff;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-anim {
  animation: fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.hero-anim.d1 {
  animation-delay: 0.05s;
}
.hero-anim.d2 {
  animation-delay: 0.12s;
}
.hero-anim.d3 {
  animation-delay: 0.2s;
}
.hero-anim.d4 {
  animation-delay: 0.28s;
}

.card-anim {
  animation: fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.card-anim.c1 {
  animation-delay: 0.35s;
}
.card-anim.c2 {
  animation-delay: 0.42s;
}
.card-anim.c3 {
  animation-delay: 0.49s;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .header-inner {
    padding: 14px 16px;
  }

  .brand-text {
    font-size: 0.95rem;
  }

  .hero-cta {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-bg::after {
    animation: none;
  }

  .hero-anim,
  .card-anim {
    animation: none !important;
  }

  .feature-card:hover {
    transform: none;
  }

  .nav-btn:hover {
    transform: none;
  }

  .loading-icon {
    animation: none;
  }
}
</style>
