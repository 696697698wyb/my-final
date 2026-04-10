// 工具函数

// 格式化日期
export const formatDate = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 防抖函数
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 本地存储操作
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return defaultValue
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('设置本地存储失败:', error)
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('删除本地存储失败:', error)
    }
  },

  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空本地存储失败:', error)
    }
  }
}

// 权限检查
export const hasPermission = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true
  return requiredRoles.includes(userRole)
}

// 获取严重性等级配置
export const getSeverityConfig = (severity) => {
  const configs = {
    CRITICAL: {
      label: '严重',
      color: '#8e0000',
      type: 'danger',
      priority: 1
    },
    HIGH: {
      label: '高',
      color: '#e74c3c',
      type: 'warning',
      priority: 2
    },
    MEDIUM: {
      label: '中',
      color: '#f39c12',
      type: 'info',
      priority: 3
    },
    LOW: {
      label: '低',
      color: '#27ae60',
      type: 'success',
      priority: 4
    },
    UNKNOWN: {
      label: '未知',
      color: '#95a5a6',
      type: 'info',
      priority: 5
    }
  }

  return configs[severity] || configs.UNKNOWN
}

// 获取状态配置
export const getStatusConfig = (status) => {
  const configs = {
    pending: {
      label: '待处理',
      color: '#909399',
      type: 'info'
    },
    assigned: {
      label: '已分配',
      color: '#e6a23c',
      type: 'warning'
    },
    in_progress: {
      label: '处理中',
      color: '#409eff',
      type: 'primary'
    },
    resolved: {
      label: '已解决',
      color: '#67c23a',
      type: 'success'
    },
    closed: {
      label: '已关闭',
      color: '#303133',
      type: 'default'
    }
  }

  return configs[status] || configs.pending
}

// 获取角色配置
export const getRoleConfig = (role) => {
  const configs = {
    admin: {
      label: '管理员',
      color: '#f56c6c',
      type: 'danger',
      permissions: ['read', 'write', 'delete', 'manage_users']
    },
    engineer: {
      label: '工程师',
      color: '#409eff',
      type: 'primary',
      permissions: ['read', 'write', 'update_status']
    },
    reporter: {
      label: '报告员',
      color: '#67c23a',
      type: 'success',
      permissions: ['read', 'write']
    }
  }

  return configs[role] || configs.reporter
}

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 文件大小格式化
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证邮箱
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证手机号
export const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证密码强度
export const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const passed = Object.values(checks).filter(Boolean).length

  if (passed < 3) return 'weak'
  if (passed < 5) return 'medium'
  return 'strong'
}