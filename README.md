# 物业管理系统 API

基于 Elysia + Drizzle + MySQL 构建的现代化物业管理系统后端API。

## 🚀 功能特性

### 📍 住址管理
- 支持小区、栋、楼层、房间的四级树形结构
- 住址的增删改查操作
- 树形结构展示和层级管理
- 软删除机制，保护数据完整性

### 👥 住户管理
- 业主和租户信息管理
- 住户与住址的关联关系
- 住户迁入迁出记录
- 联系方式和身份信息管理

### 💰 费用管理
- 多种费用类型支持（水费、电费、燃气费、物业费等）
- 费用的批量创建和管理
- 缴费状态跟踪
- 费用统计和报表功能
- 逾期费用提醒

## 🛠️ 技术栈

- **框架**: [Elysia](https://elysiajs.com/) - 高性能 TypeScript Web 框架
- **ORM**: [Drizzle](https://orm.drizzle.team/) - 类型安全的 SQL ORM
- **数据库**: MySQL 8.0+
- **类型系统**: TypeScript 5.0+
- **API文档**: Swagger/OpenAPI 3.0
- **开发工具**: Drizzle Kit, Bun

## 📦 安装和配置

### 1. 环境要求

- Node.js 18+ 或 Bun 1.0+
- MySQL 8.0+
- Git

### 2. 克隆项目

```bash
git clone <repository-url>
cd wy2
```

### 3. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 bun (推荐)
bun install
```

### 4. 环境配置

复制环境变量文件并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=property_management

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 5. 数据库初始化

```bash
# 生成数据库迁移文件
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# (可选) 查看数据库结构
npm run db:studio
```

### 6. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 📚 API 文档

启动服务后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:3000/docs
- **健康检查**: http://localhost:3000/

## 🗂️ 项目结构

```
wy2/
├── src/
│   ├── api/
│   │   └── routes/          # API路由定义
│   │       ├── addresses.ts # 住址管理路由
│   │       ├── residents.ts # 住户管理路由
│   │       └── expenses.ts  # 费用管理路由
│   ├── db/
│   │   ├── schema.ts        # 数据库表结构定义
│   │   ├── dbTable.ts       # 数据库表类型定义
│   │   └── index.ts         # 数据库连接配置
│   ├── services/            # 业务逻辑层
│   │   ├── addressService.ts
│   │   ├── residentService.ts
│   │   └── expenseService.ts
│   ├── utils/               # 工具函数
│   │   ├── R.ts            # 统一响应格式
│   │   └── database.ts     # 数据库工具
│   └── index.ts            # 应用入口文件
├── drizzle/                # 数据库迁移文件
├── .env                    # 环境变量配置
├── drizzle.config.ts       # Drizzle配置文件
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 开发指南

### 数据库操作

```bash
# 生成新的迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 启动 Drizzle Studio (数据库可视化工具)
npm run db:studio

# 删除数据库 (谨慎使用)
npm run db:drop
```

### 代码规范

项目遵循以下开发规范：

1. **路由注册**: 所有路由必须在 `src/index.ts` 中使用 `.use()` 方法注册
2. **类型定义**: 优先使用 Drizzle 生成的类型，通过 `dbTable` 解构获取
3. **响应格式**: 统一使用 `utils/R.ts` 中的 `ok()` 函数返回响应
4. **错误处理**: 在服务层进行错误捕获和处理
5. **类型转换**: 在服务层而非路由层进行类型转换

### API 设计原则

- **RESTful**: 遵循 REST API 设计规范
- **类型安全**: 使用 TypeScript 和 TypeBox 确保类型安全
- **统一响应**: 所有接口返回统一的响应格式
- **错误处理**: 完善的错误处理和状态码
- **文档完整**: 每个接口都有完整的 OpenAPI 文档

## 📋 API 接口概览

### 住址管理 (`/api/addresses`)

- `GET /` - 获取住址列表 (支持分页和搜索)
- `GET /tree` - 获取住址树形结构
- `GET /:id` - 获取单个住址详情
- `POST /` - 创建新住址
- `PUT /:id` - 更新住址信息
- `DELETE /:id` - 删除住址 (软删除)

### 住户管理 (`/api/residents`)

- `GET /` - 获取住户列表 (支持分页和搜索)
- `GET /:id` - 获取单个住户详情
- `GET /address/:addressId` - 获取指定住址的住户
- `POST /` - 创建新住户
- `PUT /:id` - 更新住户信息
- `PUT /:id/move-out` - 住户迁出
- `DELETE /:id` - 删除住户 (软删除)

### 费用管理 (`/api/expenses`)

- `GET /` - 获取费用列表 (支持分页和搜索)
- `GET /statistics` - 获取费用统计信息
- `GET /:id` - 获取单个费用详情
- `GET /address/:addressId` - 获取指定住址的费用
- `POST /` - 创建新费用
- `POST /batch` - 批量创建费用
- `PUT /:id` - 更新费用信息
- `PUT /:id/pay` - 费用缴费
- `DELETE /:id` - 删除费用

## 🚀 部署

### Docker 部署 (推荐)

```bash
# 构建镜像
docker build -t property-management-api .

# 运行容器
docker run -d \
  --name property-api \
  -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_db_password \
  property-management-api
```

### 传统部署

```bash
# 构建项目
npm run build

# 启动服务
npm start
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至: 2379668489@qq.com

---

**注意**: 这是一个演示项目，请根据实际需求调整配置和安全设置。
