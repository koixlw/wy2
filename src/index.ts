import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { db } from './db/index';

// 导入路由
import { addressesRoute } from './api/routes/addresses';
import { residentsRoute } from './api/routes/residents';
import { expensesRoute } from './api/routes/expenses';



// 创建应用实例
const app = new Elysia()
  // 配置 CORS
  .use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))

  // 配置 Swagger 文档
  .use(swagger({
    documentation: {
      info: {
        title: '物业管理系统 API',
        description: '物业管理系统后端API文档，包含住址、住户、费用管理功能',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@property-management.com'
        }
      },
      tags: [
        {
          name: '住址管理',
          description: '住址相关的API接口，支持小区、栋、楼层、房间的树形结构管理'
        },
        {
          name: '住户管理',
          description: '住户相关的API接口，包括业主和租户的管理'
        },
        {
          name: '费用管理',
          description: '费用相关的API接口，包括水电气费、物业费等的管理'
        }
      ],
      servers: [
        {
          url: 'http://localhost:3000',
          description: '开发环境'
        }
      ]
    }
  }))

  // 健康检查接口
  .get('/', () => ({
    message: '物业管理系统 API 服务正在运行',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    docs: '/docs',
    // database: {
    //   connected: db ? true : false,
    //   status: db ? true : false ? '已连接' : '未连接'
    // }
  }), {
    detail: {
      summary: '健康检查',
      description: '检查API服务是否正常运行，包括数据库连接状态',
      tags: ['系统']
    }
  })

  // 注册路由
  .use(addressesRoute)
  .use(residentsRoute)
  .use(expensesRoute)

  // 全局错误处理
  .onError(({ code, error, set }) => {
    console.error('API错误:', error);

    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          code: 400,
          msg: '请求参数验证失败',
          data: {
            error: error.message
          }
        };

      case 'NOT_FOUND':
        set.status = 404;
        return {
          code: 404,
          msg: '接口不存在',
          data: null
        };

      default:
        set.status = 500;
        return {
          code: 500,
          msg: '服务器内部错误',
          data: {
            error: error.message
          }
        };
    }
  })

  // 启动服务器
  .listen({
    port: Number(process.env.PORT) || 3000,
    hostname: '0.0.0.0'
  });

console.log(`🚀 物业管理系统 API 服务已启动`);
console.log(`📍 服务地址: http://localhost:${app.server?.port}`);
console.log(`📚 API文档: http://localhost:${app.server?.port}/swagger`);
console.log(`🗄️ 数据库: ${process.env.DB_NAME || 'property_management'}`);
console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);

