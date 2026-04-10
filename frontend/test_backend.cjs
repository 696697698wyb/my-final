const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:8000/vulnerability/';
let authToken = '';
let userId = null;

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAll() {
  console.log('=== 后端API测试开始 ===\n');

  try {
    // 1. 测试注册接口
    console.log('1. 测试用户注册...');
    const registerData = {
      username: 'testuser_' + Date.now(),
      password: 'testpass123',
      role: 'reporter'
    };

    const registerResponse = await api.post('register/', registerData);
    console.log('✅ 注册成功:', registerResponse.data);

    // 2. 测试登录接口
    console.log('\n2. 测试用户登录...');
    const loginData = {
      username: registerData.username,
      password: registerData.password
    };

    const loginResponse = await api.post('login/', loginData);
    console.log('✅ 登录成功:', loginResponse.data);

    // 保存认证信息
    authToken = loginResponse.data.token;
    userId = loginResponse.data.user_id;

    // 设置认证头
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 3. 测试统计数据
    console.log('\n3. 测试统计数据...');
    const statsResponse = await api.get('stats/');
    console.log('✅ 统计数据:', statsResponse.data);

    // 4. 测试漏洞列表
    console.log('\n4. 测试漏洞列表...');
    const listResponse = await api.get('list/?page=1&page_size=5');
    console.log('✅ 漏洞列表:', listResponse.data);

    // 5. 测试AI预测
    console.log('\n5. 测试AI预测...');
    const aiData = {
      description: 'SQL注入漏洞，攻击者可以通过恶意SQL语句获取数据库信息'
    };
    const aiResponse = await api.post('ai/', aiData);
    console.log('✅ AI预测:', aiResponse.data);

    // 6. 测试提交漏洞
    console.log('\n6. 测试提交漏洞...');
    const vulnData = {
      cve_id: 'CVE-2024-TEST',
      description: '测试漏洞描述',
      severity: 'high',
      user_id: userId
    };
    const submitResponse = await api.post('submit/', vulnData);
    console.log('✅ 提交漏洞:', submitResponse.data);

    // 7. 重新获取列表验证提交
    console.log('\n7. 验证漏洞列表更新...');
    const updatedListResponse = await api.get('list/?page=1&page_size=5');
    console.log('✅ 更新后的列表:', updatedListResponse.data);

    console.log('\n=== 🎉 所有接口测试通过！===');
    console.log('✅ 前后端对接完全正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('状态码:', error.response.status);
    }
  }
}

// 运行测试
testAll();