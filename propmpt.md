## 🚀 功能驱动 Elysia + Drizzle 开发流程提示词（完整版）
### 📋 核心开发流程
```
请按照以下严格顺序进行开发：
1. 🎯 **功能清单规划**：明确列出所有需要实现的功能点，完成一个打勾一个
2. 📝 **OpenAPI规范设计**：使用标准OpenAPI 3.1.0格式设计完整的API文档
3. 🗄️ **数据库设计**：基于API需求设计 Drizzle 数据库 schema
4. 🔧 **类型系统**：使用 dbTable.select/insert 生成类型化模型，在model时尽量实现typebox类型的复用，比如使用t.Ref()
5. 🛣️ **路由实现**：实现 Elysia 路由，严格复用 Drizzle 类型
6. 🏗️ **服务层**：实现业务逻辑服务类
7. 🔍 **代码回顾**：每次修改后必须完整检查整个流程，确保类型一致性
要求代码风格必须与提供的示例完全一致！
```

### 🚀 Elysia 标准开发流程

#### 📍 第一步：路由注册 (index.ts)
```typescript
// src/index.ts
import { itemsRoute } from './api/routes/items';

const app = new Elysia()
  .use(itemsRoute)  // 在 index.ts 中注册路由
  .listen(3000);
```

#### 📍 第二步：Model 定义和路由结构
```typescript
// src/api/routes/items.ts
import { Elysia, t } from 'elysia';
import { dbTable } from '../../db/dbTable';
import { ItemService } from '@/services/itemService';
import { ok } from '@/utils/R';

// 解构 Drizzle 类型（必须严格按照此格式）
const { items: SItems } = dbTable.select;
const { items: IItems } = dbTable.insert;

// Model 定义（必须在路由前定义）
export const itemsModel = {
    // 基础类型定义
    'item': t.Object({
        name: SItems.name,
        description: SItems.description,
        imageUrl: SItems.imageUrl,
        buyPrice: SItems.buyPrice,
        sellPrice: SItems.sellPrice,
        takeoverPrice: SItems.takeoverPrice,
        level: SItems.level,
        category: SItems.category
    }),
    // 请求类型 - 使用 t.Ref() 实现类型复用
    'create': t.Ref('item'),
    'update': t.Partial(t.Ref('item')),
    
    // 查询参数
    'queryParams': t.Object({
        search: t.Optional(t.String()),
        category: t.Optional(t.String()),
        level: t.Optional(t.String()),
        minPrice: t.Optional(t.String()),
        maxPrice: t.Optional(t.String())
    }),
    
    // 响应类型
    'itemResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: SItems.id,
            name: SItems.name,
            description: SItems.description,
            // ... 其他字段
        })
    }),
    
    'itemsListResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            items: t.Array(t.Ref('item')),
            pagination: t.Object({
                total: t.Number()
            })
        })
    })
};

// 路由定义（必须严格按照此结构）
export const itemsRoute = new Elysia({ prefix: '/api/items' })
    .model(itemsModel)
```

#### 📍 第三步：接口层实现 - 数据校验和统一返回
```typescript
// 接口层负责：数据校验、参数处理、统一返回格式
.get('/', async ({ query }) => {
    // 直接传递 query 对象到服务层，让服务层处理类型转换
    const result = await ItemService.getAllItems(query);
    
    // 统一使用 ok() 函数返回结果
    return ok(result, 200, "获取所有物品成功");
}, {
    query: 'queryParams',  // 使用 model 中定义的类型
    detail: {
        summary: '获取所有物品',
        description: '获取系统中所有物品的列表，支持分页查询和筛选',
        tags: ['物品管理'],
    },
    response: {
        200: 'itemsListResponse'  // 使用 model 中定义的响应类型
    }
})
```

#### 📍 第四步：服务层逻辑 - 业务处理和类型转换
```typescript
// src/services/itemService.ts
import { itemsModel } from '../api/routes/items';

// 从 model 中提取类型（优先使用此方式）
type ItemQueryParams = typeof itemsModel.queryParams.static

export abstract class ItemService {
  // 服务层负责：业务逻辑、类型转换、数据库操作
  static async getAllItems(query: ItemQueryParams) {
    try {
      const { search, category, level, minPrice, maxPrice } = query;
      
      // 在服务层进行类型转换
      const conditions = [];
      conditions.push(...[
        (search ? like(items.name, `%${search}%`) : undefined),
        (category ? eq(items.category, category) : undefined),
        (level ? eq(items.level, Number(level)) : undefined),  // 字符串转数字
        (minPrice ? gte(items.buyPrice, Number(minPrice)) : undefined),
        (maxPrice ? lte(items.buyPrice, Number(maxPrice)) : undefined),
        eq(items.isActive, true)
      ]);
      
      // 数据库查询逻辑...
      return {
        items: itemsList,
        pagination: { total }
      };
    } catch (error) {
      console.error('获取物品列表出错:', error);
      throw new Error('获取物品列表失败');
    }
  }
}
```

#### 📍 第五步：代码回顾检查清单
**⚠️ 每次修改代码后，必须按此清单完整检查，优先级极高！**

##### 🔍 类型一致性检查
- [ ] ✅ Model 中的类型定义是否使用了正确的 Drizzle 类型
- [ ] ✅ 服务层的参数类型是否从 model 中提取
- [ ] ✅ 接口层的 query/body/response 类型是否引用了 model
- [ ] ✅ 数据库字段变更后，相关的 model 和服务层是否同步更新

##### 🔍 接口层检查
- [ ] ✅ 是否使用了 model 中定义的类型进行校验
- [ ] ✅ 是否使用 ok() 函数统一返回格式
- [ ] ✅ response 类型是否正确引用 model

##### 🔍 服务层检查
- [ ] ✅ 参数类型是否从 model 中提取
- [ ] ✅ 类型转换逻辑是否正确（如字符串转数字）
- [ ] ✅ 错误处理是否完整

##### 🔍 路由注册检查
- [ ] ✅ 新路由是否在 index.ts 中正确注册
- [ ] ✅ 路由前缀是否正确设置

### 🎯 第一步：功能清单规划模板
```markdown
# [模块名称] 功能开发清单

## 📋 核心功能列表
### 基础CRUD功能
- [ ] 获取[实体]列表（支持分页、搜索）
- [ ] 获取单个[实体]详情
- [ ] 创建新[实体]
- [ ] 更新[实体]信息
- [ ] 删除[实体]

### 高级功能（根据需求选择）
- [ ] 批量操作（批量删除、批量更新）
- [ ] 数据导入导出
- [ ] 状态管理（启用/禁用）
- [ ] 分类管理
- [ ] 权限控制
- [ ] 文件上传
- [ ] 数据统计
- [ ] 搜索过滤
- [ ] 排序功能
- [ ] 关联数据管理

### 技术要求
- [ ] 类型安全（TypeScript）
- [ ] 统一响应格式
- [ ] 错误处理
- [ ] 数据验证
- [ ] API文档生成
- [ ] 单元测试

## 🎯 开发优先级
1. **P0 (必须)**: 基础CRUD功能
2. **P1 (重要)**: 分页、搜索、验证
3. **P2 (可选)**: 高级功能和优化

## ✅ 完成状态追踪
- 总功能数: [X]
- 已完成: [Y]
- 完成率: [Y/X * 100]%
```
### 📝 第二步：OpenAPI规范设计模板
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "3dDesign - [模块名称] API",
    "description": "[模块名称]管理 API 文档",
    "version": "1.0.0"
  },
  "tags": [
    {
      "name": "[模块名称]",
      "description": "[模块名称]管理相关接口"
    }
  ],
  "paths": {
    "/api/[entities]/": {
      "get": {
        "summary": "获取所有[实体]",
        "description": "获取系统中所有[实体]的列表，支持分页查询",
        "tags": ["[模块名称]"],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "description": "页码，从1开始",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "每页数量，最大100",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100,
              "default": 10
            }
          },
          {
            "name": "search",
            "in": "query",
            "description": "搜索关键词",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "[实体]列表获取成功",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/[entities]ListResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "创建新[实体]",
        "description": "创建一个新的[实体]",
        "tags": ["[模块名称]"],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/create[Entity]"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "[实体]创建成功",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/[entity]Response"
                }
              }
            }
          },
          "400": {
            "description": "请求参数错误",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/errorResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/[entities]/{id}": {
      "get": {
        "summary": "获取指定[实体]",
        "description": "根据[实体]ID获取单个[实体]的详细信息",
        "tags": ["[模块名称]"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "[实体]ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "[实体]信息获取成功",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/[entity]Response"
                }
              }
            }
          },
          "404": {
            "description": "[实体]不存在",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/errorResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "summary": "更新[实体]信息",
        "description": "更新指定[实体]的信息",
        "tags": ["[模块名称]"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "[实体]ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/update[Entity]"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "[实体]信息更新成功",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/[entity]Response"
                }
              }
            }
          },
          "400": {
            "description": "请求参数错误"
          },
          "404": {
            "description": "[实体]不存在"
          }
        }
      },
      "delete": {
        "summary": "删除[实体]",
        "description": "根据[实体]ID删除指定[实体]",
        "tags": ["[模块名称]"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "[实体]ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "[实体]删除成功",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/successResponse"
                }
              }
            }
          },
          "404": {
            "description": "[实体]不存在"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "create[Entity]": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255,
            "description": "[实体]名称"
          },
          "description": {
            "type": "string",
            "maxLength": 1000,
            "description": "[实体]描述"
          }
        },
        "required": ["name"]
      },
      "update[Entity]": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255,
            "description": "[实体]名称"
          },
          "description": {
            "type": "string",
            "maxLength": 1000,
            "description": "[实体]描述"
          }
        }
      },
      "[entity]Response": {
        "type": "object",
        "properties": {
          "code": {
            "type": "number",
            "description": "响应状态码"
          },
          "msg": {
            "type": "string",
            "description": "响应消息"
          },
          "data": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "description": "[实体]ID"
              },
              "name": {
                "type": "string",
                "description": "[实体]名称"
              },
              "description": {
                "type": "string",
                "description": "[实体]描述"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "description": "创建时间"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "description": "更新时间"
              }
            },
            "required": ["id", "name", "createdAt"]
          }
        },
        "required": ["code", "msg", "data"]
      },
      "[entities]ListResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "number",
            "description": "响应状态码"
          },
          "msg": {
            "type": "string",
            "description": "响应消息"
          },
          "data": {
            "type": "object",
            "properties": {
              "[entities]": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/[entity]Response/properties/data"
                }
              },
              "pagination": {
                "type": "object",
                "properties": {
                  "page": {
                    "type": "integer",
                    "description": "当前页码"
                  },
                  "limit": {
                    "type": "integer",
                    "description": "每页数量"
                  },
                  "total": {
                    "type": "integer",
                    "description": "总记录数"
                  },
                  "totalPages": {
                    "type": "integer",
                    "description": "总页数"
                  }
                },
                "required": ["page", "limit", "total", "totalPages"]
              }
            },
            "required": ["[entities]", "pagination"]
          }
        },
        "required": ["code", "msg", "data"]
      },
      "successResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "number",
            "description": "响应状态码"
          },
          "msg": {
            "type": "string",
            "description": "响应消息"
          },
          "data": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean",
                "description": "操作是否成功"
              }
            }
          }
        },
        "required": ["code", "msg", "data"]
      },
      "errorResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "number",
            "description": "错误状态码"
          },
          "msg": {
            "type": "string",
            "description": "错误消息"
          },
          "data": {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "field": {
                          "type": "string",
                          "description": "错误字段"
                        },
                        "message": {
                          "type": "string",
                          "description": "错误信息"
                        }
                      },
                      "required": ["field", "message"]
                    }
                  }
                }
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "required": ["code", "msg"]
      }
    }
  }
}
```

### 📋 OpenAPI设计要点
1. **标准格式**: 严格遵循OpenAPI 3.1.0规范
2. **统一响应**: 所有接口使用code/msg/data格式
3. **完整验证**: 包含字段长度、类型、必填等验证
4. **分页支持**: 列表接口支持page/limit/search参数
5. **错误处理**: 定义详细的错误响应格式
6. **文档完整**: 每个接口都有清晰的描述和示例
### 🗄️ 第三步：Drizzle Schema 设计
```typescript
// src/db/schema.ts
import { mysqlTable, serial, varchar, text, timestamp, int, decimal } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// [实体]表
export const [entities] = mysqlTable('[entities]', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
// 关联表（如果需要）
export const [relationTable] = mysqlTable('[relation_table]', {
  id: serial('id').primaryKey(),
  [entityId]: int('[entity_id]').notNull(),
  // 其他字段...
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
// 定义关系
export const [entities]Relations = relations([entities], ({ many }) => ({
  [relationItems]: many([relationTable]),
}));
export const [relationTable]Relations = relations([relationTable], ({ one }) => ({
  [entity]: one([entities], {
    fields: [[relationTable].[entityId]],
    references: [[entities].id],
  }),
}));
export const dbSchema = {
  [entities],
  [relationTable],
};
```
### 🔧 第四步：类型系统集成
```typescript
// 确保 dbTable.ts 已正确配置
import { spreads } from "../utils/database"
import { dbSchema } from "./schema"

export const dbTable = {
    insert: spreads({ ...dbSchema }, 'insert'),
    select: spreads({ ...dbSchema }, 'select')
} as const
```

### 🎯 类型定义最佳实践
**优先级原则**：
1. **优先使用 Model 类型**：从 `[entities]Model` 中提取类型，确保类型一致性
2. **避免 interface**：除非是非常简单的类型（如只有1-2个基础字段），否则都应该从 model 中提取
3. **类型复用**：使用 `typeof [entities]Model.queryParams.static` 等方式提取类型

```typescript
// ✅ 推荐：从 model 中提取类型
type ItemQueryParams = typeof itemsModel.queryParams.static
type CreateItemData = typeof itemsModel.create.static
type UpdateItemData = typeof itemsModel.update.static

// ❌ 避免：使用 interface（除非非常简单）
interface CreateItemParams {
  name: string;
  description?: string;
  // ... 复杂字段
}

// ✅ 可接受：非常简单的类型可以使用 interface
interface SimpleId {
  id: string;
}
```
### 🛣️ 第五步：Elysia 路由实现（严格按照示例格式）
```typescript
import { Elysia, t } from 'elysia';
import { dbTable } from '../db/dbTable';
import { [Entity]Service } from '@/services/[entity]Service';
import { ok } from '@/utils/R';

// 解构 Drizzle 类型（必须严格按照此格式）
const { [entities]: S[Entities] } = dbTable.select;
const { [entities]: I[Entities] } = dbTable.insert;
// 模型定义（必须在路由前定义）
export const [entities]Model = {
    // 参数类型
    'paramID': t.Object({
        id: t.String(),
    }),
    // 请求类型
    'create': t.Object({
        name: S[Entities].name,
        description: I[Entities].description
    }),
    'update': t.Object({
        name: t.Optional(I[Entities].name),
        description: I[Entities].description
    }),
    // 响应类型（必须包含完整的统一响应格式）
    '[entity]Response': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: S[Entities].id,
            name: S[Entities].name,
            description: S[Entities].description,
            createdAt: S[Entities].createdAt,
            updatedAt: S[Entities].updatedAt
        })
    }),
    '[entities]ListResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Array(
            t.Object({
                id: S[Entities].id,
                name: S[Entities].name,
                description: S[Entities].description,
                createdAt: S[Entities].createdAt,
                updatedAt: S[Entities].updatedAt
            })
        )
    }),
    'successResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Any()
    })
};
// 模型简写实例（必须按照此格式）
const [entities]MOMO = new Elysia()
    .model({
        ...[entities]Model
    });
// 路由定义（必须严格按照此结构）
export const [entities]Route = new Elysia({ prefix: '/api/[entities]' })
    .use([entities]MOMO)
    
    // 获取所有[实体]
    .get('/', async () => {
        const result = await [Entity]Service.getAll[Entities]();
        return ok(result, 200, "获取所有[实体]成功");
    }, {
        response: {
            200: '[entities]ListResponse'
        },
        detail: {
            summary: '获取所有[实体]',
            description: '获取系统中所有[实体]的列表',
            tags: ['[Entities]'],
        }
    })
    // 获取单个[实体]
    .get('/:id', async ({ params: { id } }) => {
        const [entity]Data = await [Entity]Service.get[Entity]ById(+id);
        return ok([entity]Data, 200, '获取[实体]成功');
    }, {
        params: 'paramID',
        response: {
            200: '[entity]Response'
        },
        detail: {
            summary: '获取指定[实体]详情',
            description: '根据[实体]ID获取单个[实体]的详细信息',
            tags: ['[Entities]'],
        }
    })
    // 创建[实体]
    .post('/', async ({ body }) => {
        try {
            const { name, description } = body;
            return await [Entity]Service.create[Entity](name, description);
        } catch (error) {
            console.error('[实体]创建错误:', error);
            throw new Error('[实体]创建失败');
        }
    }, {
        body: 'create',
        response: {
            200: '[entity]Response'
        },
        detail: {
            summary: '创建新的[实体]',
            description: '创建一个新的[实体]',
            tags: ['[Entities]'],
        }
    })
    // 更新[实体]
    .put('/:id', async ({ params: { id }, body }) => {
        try {
            const { name, description } = body;
            return await [Entity]Service.update[Entity](+id, { name, description });
        } catch (error) {
            console.error('[实体]更新错误:', error);
            throw new Error('[实体]更新失败');
        }
    }, {
        params: 'paramID',
        body: 'update',
        response: {
            200: '[entity]Response'
        },
        detail: {
            summary: '更新[实体]信息',
            description: '更新指定[实体]的信息',
            tags: ['[Entities]'],
        }
    })
    // 删除[实体]
    .delete('/:id', async ({ params: { id } }) => {
        try {
            await [Entity]Service.delete[Entity](id);
            return ok(null, 200, "[实体]删除成功");
        } catch (error) {
            console.error('[实体]删除错误:', error);
            throw new Error('[实体]删除失败');
        }
    }, {
        params: 'paramID',
        response: {
            200: 'successResponse'
        },
        detail: {
            summary: '删除[实体]',
            description: '删除指定的[实体]',
            tags: ['[Entities]'],
        }
    })
    
    // 错误处理（必须包含）
    .onError(({ error }) => {
        console.error('[实体]API错误:', error);
        return {
            success: false,
            error: error.toString() || '[实体]操作失败'
        };
    });
```
### 🏗️ 第六步：服务层实现
```typescript
import { db } from '../db/connection';
import { [entities] } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ok } from '../utils/R';
import { [entities]Model } from '../api/routes/[entities]';

// 从 model 中提取类型（推荐做法）
type [Entity]QueryParams = typeof [entities]Model.queryParams.static
type Create[Entity]Data = typeof [entities]Model.create.static
type Update[Entity]Data = typeof [entities]Model.update.static

// [实体]服务类 - 处理所有[实体]相关的业务逻辑
export abstract class [Entity]Service {
  // 获取所有[实体]
  static async getAll[Entities]() {
    try {
      return await db.select().from([entities]);
    } catch (error) {
      console.error('获取[实体]列表出错:', error);
      throw new Error('获取[实体]列表失败');
    }
  }
  // 获取单个[实体]
  static async get[Entity]ById(id: number) {
    try {
      const [entity] = await db.select().from([entities]).where(eq([entities].id, id));
      if (![entity]) {
        throw new Error('[实体]不存在');
      }
      return [entity];
    } catch (error) {
      console.error(`获取[实体]ID=${id}出错:`, error);
      throw new Error('获取[实体]失败');
    }
  }
  // 创建[实体]
  static async create[Entity](name: string, description?: string | null) {
    try {
      const result = await db.insert([entities]).values({
        name,
        description,
      });
      const [entity]Id = result[0].insertId;
      const new[Entity] = await [Entity]Service.get[Entity]ById([entity]Id);
      return ok(new[Entity], 200, '[实体]创建成功');
    } catch (error) {
      console.error('创建[实体]出错:', error);
      throw new Error('创建[实体]失败');
    }
  }
  // 更新[实体]
  static async update[Entity](id: number, data: { name?: string; description?: string | null }) {
    try {
      await db.update([entities])
        .set(data)
        .where(eq([entities].id, id));

      const updated[Entity] = await [Entity]Service.get[Entity]ById(id);
      return ok(updated[Entity], 200, '[实体]更新成功');
    } catch (error) {
      console.error(`更新[实体]ID=${id}出错:`, error);
      throw new Error('更新[实体]失败');
    }
  }
  // 删除[实体]
  static async delete[Entity](id: string) {
    try {
      return await db.delete([entities]).where(eq([entities].id, Number(id)));
    } catch (error) {
      console.error(`删除[实体]ID=${id}出错:`, error);
      throw new Error('删除[实体]失败');
    }
  }
}
```
### 🔧 Elysia 关键代码风格要求

#### 🎯 核心开发原则
1. **路由注册标准**：所有路由必须在 `index.ts` 中使用 `.use(xxxRoute)` 注册
2. **Model 定义标准**：路由文件中必须先定义 model，再定义路由
3. **Drizzle 类型解构**：必须使用 `const { [entities]: S[Entities] } = dbTable.select` 格式
4. **TypeBox 类型复用**：使用 `t.Ref()` 减小 model 大小，实现类型复用
5. **统一响应格式**：所有接口必须使用 `ok()` 函数返回，包含 `code`, `msg`, `data` 结构
6. **服务层调用**：接口层直接调用服务层方法，传递完整参数对象
7. **类型转换位置**：在服务层进行类型转换，而非接口层
8. **代码回顾机制**：每次修改后必须完整检查类型一致性

#### 📋 标准代码结构

##### 1. 路由注册 (index.ts)
```typescript
// ✅ 正确：在 index.ts 注册路由
import { itemsRoute } from './api/routes/items';

const app = new Elysia()
  .use(itemsRoute)  // 标准注册方式
  .listen(3000);
```

##### 2. Model 定义 (routes/xxx.ts)
```typescript
// ✅ 正确：解构 Drizzle 类型
const { items: SItems } = dbTable.select;
const { items: IItems } = dbTable.insert;

// ✅ 正确：使用 t.Ref() 实现类型复用
export const itemsModel = {
    'item': t.Object({
        name: SItems.name,
        description: SItems.description,
        // ... 其他字段
    }),
    'create': t.Ref('item'),  // 复用 item 类型
    'update': t.Partial(t.Ref('item')),  // 部分更新
    'queryParams': t.Object({
        search: t.Optional(t.String()),
        // ... 查询参数
    })
};

// ✅ 正确：路由定义结构
export const itemsRoute = new Elysia({ prefix: '/api/items' })
    .model(itemsModel)  // 注册 model
```

##### 3. 接口层实现
```typescript
// ✅ 正确：直接传递参数，使用统一返回
.get('/', async ({ query }) => {
    const result = await ItemService.getAllItems(query);
    return ok(result, 200, "获取所有物品成功");  // 统一返回格式
}, {
    query: 'queryParams',  // 使用 model 类型
    response: { 200: 'itemsListResponse' }  // 响应类型
})

// ❌ 错误：在接口层进行复杂的参数处理
.get('/', async ({ query }) => {
    const { search, level, minPrice } = query;
    const processedQuery = {
        search,
        level: level ? parseInt(level) : undefined,  // 不应在此处转换
        minPrice: minPrice ? parseFloat(minPrice) : undefined
    };
    // ...
})
```

##### 4. 服务层实现
```typescript
// ✅ 正确：从 model 提取类型
type ItemQueryParams = typeof itemsModel.queryParams.static

export abstract class ItemService {
  static async getAllItems(query: ItemQueryParams) {
    try {
      const { search, level, minPrice } = query;
      
      // ✅ 正确：在服务层进行类型转换
      const conditions = [
        (level ? eq(items.level, Number(level)) : undefined),
        (minPrice ? gte(items.buyPrice, Number(minPrice)) : undefined)
      ];
      
      // 数据库操作...
    } catch (error) {
      console.error('获取物品列表出错:', error);
      throw new Error('获取物品列表失败');
    }
  }
}
```

#### 🚨 类型定义优先级
1. **🥇 最高优先级**：从 model 中提取类型 `typeof [entities]Model.xxx.static`
2. **🥈 可接受**：简单类型（1-2个基础字段）可使用 interface
3. **🚫 禁止**：复杂类型使用 interface，必须从 model 提取

```typescript
// ✅ 推荐：从 model 提取类型
type ItemQueryParams = typeof itemsModel.queryParams.static
type CreateItemData = typeof itemsModel.create.static

// ✅ 可接受：非常简单的类型
interface SimpleId {
  id: string;
}

// ❌ 禁止：复杂类型使用 interface
interface ComplexItemQuery {
  search?: string;
  category?: string;
  level?: string;
  // ... 多个字段
}
```

#### 🔍 强制性代码回顾流程
**每次代码修改后，必须按以下顺序检查：**

1. **路由注册检查**：新路由是否在 `index.ts` 正确注册
2. **Model 类型检查**：是否使用正确的 Drizzle 类型和 t.Ref()
3. **接口层检查**：是否使用 model 类型和 ok() 返回
4. **服务层检查**：类型是否从 model 提取，转换逻辑是否正确
5. **类型一致性检查**：整个链路的类型是否保持一致

#### 📝 导入顺序标准
```typescript
// 1. Elysia 相关
import { Elysia, t } from 'elysia';

// 2. 数据库相关
import { dbTable } from '../../db/dbTable';

// 3. 服务层
import { ItemService } from '@/services/itemService';

// 4. 工具函数
import { ok } from '@/utils/R';
```

#### 🎯 错误处理标准
1. **服务层**：必须包含 try-catch，记录详细错误日志
2. **接口层**：依赖服务层的错误处理，专注于返回格式
3. **统一错误格式**：使用项目定义的错误响应格式
### 📝 完整检查清单
#### 开发流程检查
- [ ] ✅ API文档已完整设计
- [ ] ✅ Drizzle schema 已创建
- [ ] ✅ dbTable 类型已配置
- [ ] ✅ 路由模型已定义
- [ ] ✅ 路由实现完成
- [ ] ✅ 服务层实现完成
#### 代码质量检查
- [ ] ✅ 严格使用 Drizzle 类型
- [ ] ✅ 统一响应格式 (code/msg/data)
- [ ] ✅ 完整错误处理
- [ ] ✅ 类型安全无 any
- [ ] ✅ 命名规范一致
- [ ] ✅ Swagger 文档简洁
<!-- ### 💡 核心优势 -->
<!-- 1. **类型安全**：从数据库到API的完整类型链
2. **代码复用**：Drizzle类型在整个应用中复用
3. **文档驱动**：先设计API再实现，确保接口合理
4. **统一格式**：所有响应格式完全一致
5. **易于维护**：清晰的分层架构和命名规范 -->

