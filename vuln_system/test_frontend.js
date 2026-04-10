// 前端登录测试脚本
const axios = require('axios');

// 模拟前端登录请求
async function testLogin() {
    try {
        const response = await axios.post('http://localhost:8000/vulnerability/login/', {
            username: 'newuser',
            password: 'testpass123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('登录成功:', response.data);
    } catch (error) {
        console.error('登录失败:', error.response?.data || error.message);
    }
}

// 模拟前端注册请求
async function testRegister() {
    try {
        const response = await axios.post('http://localhost:8000/vulnerability/register/', {
            username: 'testuser2',
            password: 'testpass123',
            role: 'reporter'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('注册成功:', response.data);
    } catch (error) {
        console.error('注册失败:', error.response?.data || error.message);
    }
}

testLogin();
testRegister();