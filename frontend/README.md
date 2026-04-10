# 漏洞管理系统前端 (VulnGuard)

基于 Vue 3 + Element Plus 的现代化漏洞管理系统前端应用。

## 🚀 技术栈

- **框架**: Vue 3 + Composition API
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **图表**: Chart.js + vue-chartjs
- **工具库**: @vueuse/core

## 🌟 主要功能

### 用户认证
- ✅ 用户登录/注册
- ✅ 角色权限控制（管理员、工程师、报告员）
- ✅ 路由守卫和权限验证

### 仪表板
- ✅ 统计卡片（总漏洞数、待处理、本月提交、已解决）
- ✅ 严重性分布饼图
- ✅ 状态分布柱状图
- ✅ 最近7天趋势折线图
- ✅ 用户信息和快速操作

### 漏洞管理
- ✅ 漏洞列表（支持分页、搜索、过滤）
- ✅ 漏洞详情查看
- ✅ 提交新漏洞（支持AI分析）
- ✅ 漏洞分配和状态更新
- ✅ 高级搜索功能

### 用户管理（管理员）
- ✅ 用户列表查看
- ✅ 角色更新
- ✅ 用户信息编辑

## 🎨 界面特色

- **响应式设计**: 完美支持桌面端和移动端
- **现代化 UI**: 使用 Element Plus 组件库
- **南大紫主题**: 采用南大紫作为主要配色
- **动画效果**: 平滑的页面切换和交互动画
- **数据可视化**: 丰富的图表展示

## 📡 API 接口

### 认证相关
- `POST /vulnerability/login/` - 用户登录
- `POST /vulnerability/register/` - 用户注册
- `GET /vulnerability/user/{id}/` - 获取用户信息
- `POST /vulnerability/user/role/` - 更新用户角色

### 漏洞管理
- `POST /vulnerability/ai/` - AI预测严重性
- `POST /vulnerability/submit/` - 提交漏洞
- `GET /vulnerability/list/` - 漏洞列表
- `GET /vulnerability/{id}/` - 漏洞详情
- `POST /vulnerability/assign/` - 分配漏洞
- `POST /vulnerability/status/` - 更新状态
- `GET /vulnerability/search/` - 搜索漏洞

### 统计报表
- `GET /vulnerability/stats/` - 基础统计
- `GET /vulnerability/dashboard/` - 仪表板数据
- `GET /vulnerability/engineers/` - 工程师列表

## 🎯 用户角色和权限

### 管理员 (admin)
- 查看所有漏洞
- 分配漏洞给工程师
- 更新漏洞状态
- 管理用户账户
- 查看统计数据

### 工程师 (engineer)
- 查看分配的漏洞
- 更新漏洞状态
- 添加解决方案
- 查看统计数据

### 报告员 (reporter)
- 提交新漏洞
- 查看自己提交的漏洞
- 编辑自己的漏洞
- 使用AI分析功能

## 🔧 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 📁 项目结构

```
src/
├── api/                 # API 接口封装
│   ├── index.js        # Axios 实例配置
│   ├── auth.js         # 认证相关 API
│   ├── vulnerability.js # 漏洞管理 API
│   └── stats.js        # 统计数据 API
├── assets/             # 静态资源
├── components/         # 通用组件
│   └── charts/         # 图表组件
├── layouts/            # 布局组件
│   ├── MainLayout.vue  # 主布局
│   └── AuthLayout.vue  # 认证布局
├── router/             # 路由配置
│   └── index.js        #
