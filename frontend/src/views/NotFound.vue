<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.not-found h1 {
  font-size: 120px;
  color: #409eff;
  margin: 0;
  font-weight: bold;
}

.not-found h2 {
  font-size: 24px;
  color: #303133;
  margin: 20px 0;
}

.not-found p {
  color: #909399;
  margin-bottom: 30px;
}
</style>