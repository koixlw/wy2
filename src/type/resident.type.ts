import { dbTable } from "@/db/dbTable"
import { t } from "elysia"

// 解构 Drizzle 类型
const { residents: SResidents } = dbTable.select;
const { residents: IResidents } = dbTable.insert;
const { addresses: SAddresses } = dbTable.select;

/**
 * 住户管理模块类型定义
 * 包含住户的查询、创建、更新、删除等相关类型定义
 */
export const residentModels = {
    // === 查询参数类型 ===
    /**
     * 住户查询参数
     * 用于住户列表查询和筛选
     */
    'residentQueryParams': t.Object({
        search: t.Optional(t.String({ description: '搜索关键词，支持模糊搜索住户姓名、电话、身份证号' })),
        addressId: t.Optional(t.Number({ description: '地址ID，用于筛选特定地址的住户' })),
        residentType: t.Optional(t.String({ description: '住户类型：owner(业主)、tenant(租户)、family(家属)等' })),
        isActive: t.Optional(t.String({ description: '是否在住：true(在住)、false(已搬出)' })),
        phone: t.Optional(t.String({ description: '联系电话，支持模糊查询' })),
        page: t.Optional(t.String({ description: '页码，从1开始' })),
        limit: t.Optional(t.String({ description: '每页数量，默认10' }))
    }, {
        description: '住户查询参数，支持多条件组合筛选'
    }),

    // === 请求体类型 ===
    /**
     * 创建住户请求体
     * 用于创建新的住户记录
     */
    'residentCreateBody': t.Object({
        name: t.String({ description: '住户姓名，必填' }),
        phone: t.Optional(t.String({ description: '联系电话，格式：11位手机号或固定电话' })),
        idCard: t.Optional(t.String({ description: '身份证号码，18位身份证号' })),
        addressId: t.Number({ description: '地址ID，必填，关联到具体的房屋地址' }),
        residentType: t.String({ description: '住户类型：owner(业主)、tenant(租户)、family(家属)等' }),
        moveInDate: t.Optional(t.String({ description: '入住日期，格式：YYYY-MM-DD' }))
    }, {
        description: '创建住户的请求数据，包含住户的基本信息',
        examples: {
            '业主': {
                name: '张三',
                phone: '13800138000',
                idCard: '110101199001011234',
                addressId: 1,
                residentType: 'owner',
                moveInDate: '2024-01-01'
            },
            '租户': {
                name: '李四',
                phone: '13900139000',
                addressId: 2,
                residentType: 'tenant',
                moveInDate: '2024-02-01'
            }
        }
    }),

    /**
     * 更新住户请求体
     * 用于更新已存在的住户记录
     */
    'residentUpdateBody': t.Object({
        name: t.Optional(t.String({ description: '住户姓名' })),
        phone: t.Optional(t.String({ description: '联系电话' })),
        idCard: t.Optional(t.String({ description: '身份证号码' })),
        addressId: t.Optional(t.Number({ description: '地址ID' })),
        residentType: t.Optional(t.String({ description: '住户类型' })),
        moveInDate: t.Optional(t.String({ description: '入住日期' })),
        moveOutDate: t.Optional(t.String({ description: '搬出日期，格式：YYYY-MM-DD' })),
        isActive: t.Optional(t.Boolean({ description: '是否在住状态' }))
    }, {
        description: '更新住户的请求数据，所有字段均为可选'
    }),

    // === 响应类型 ===
    /**
     * 获取单个住户响应
     * 返回住户详细信息，包含关联的地址信息
     */
    'residentGetResponse': t.Object({
        code: t.Number({ description: '响应状态码，200表示成功' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            id: t.Number({ description: '住户ID' }),
            name: t.String({ description: '住户姓名' }),
            phone: t.Union([t.String(), t.Null()], { description: '联系电话' }),
            idCard: t.Union([t.String(), t.Null()], { description: '身份证号码' }),
            addressId: t.Number({ description: '地址ID' }),
            residentType: t.String({ description: '住户类型' }),
            moveInDate: t.Union([t.String(), t.Null()], { description: '入住日期' }),
            moveOutDate: t.Union([t.String(), t.Null()], { description: '搬出日期' }),
            isActive: t.Boolean({ description: '是否在住' }),
            createdAt: t.String({ description: '创建时间' }),
            updatedAt: t.Union([t.String({ description: '更新时间' }), t.Null()]),
            address: t.Union([
                t.Object({
                    id: t.Number({ description: '地址ID' }),
                    name: t.String({ description: '地址名称' }),
                    type: t.String({ description: '地址类型' }),
                    code: t.Union([t.Optional(t.String({ description: '地址编码' })), t.Null()])
                }, { description: '关联的地址信息' }),
                t.Null()
            ], { description: '关联的地址信息，可能为空' })
        }, { description: '住户详细信息' })
    }, {
        description: '获取住户详情的响应数据'
    }),

    /**
     * 住户列表响应
     * 返回分页的住户列表数据
     */
    'residentListResponse': t.Object({
        code: t.Number({ description: '响应状态码' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            items: t.Array(t.Object({
                id: t.Number({ description: '住户ID' }),
                name: t.String({ description: '住户姓名' }),
                phone: t.Union([t.String(), t.Null()], { description: '联系电话' }),
                idCard: t.Union([t.String(), t.Null()], { description: '身份证号码' }),
                addressId: t.Number({ description: '地址ID' }),
                residentType: t.String({ description: '住户类型' }),
                moveInDate: t.Union([t.String(), t.Null()], { description: '入住日期' }),
                moveOutDate: t.Union([t.String(), t.Null()], { description: '搬出日期' }),
                isActive: t.Boolean({ description: '是否在住' }),
                createdAt: t.String({ description: '创建时间' }),
                updatedAt: t.Union([t.String({ description: '更新时间' }), t.Null()]),
                address: t.Union([
                    t.Object({
                        id: t.Number({ description: '地址ID' }),
                        name: t.String({ description: '地址名称' }),
                        type: t.String({ description: '地址类型' }),
                        code: t.Union([t.Optional(t.String({ description: '地址编码' })), t.Null()])
                    }),
                    t.Null()
                ])
            }), { description: '住户信息数组' }),
            pagination: t.Object({
                page: t.Number({ description: '当前页码' }),
                limit: t.Number({ description: '每页数量' }),
                total: t.Number({ description: '总记录数' }),
                totalPages: t.Number({ description: '总页数' })
            }, { description: '分页信息' })
        }, { description: '住户列表数据' })
    }, {
        description: '住户列表查询的响应数据，包含分页信息'
    }),

    /**
     * 创建住户响应
     * 返回新创建的住户信息
     */
    'residentCreateResponse': t.Object({
        code: t.Number({ description: '响应状态码，201表示创建成功' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            id: t.Number({ description: '新创建的住户ID' }),
            name: t.String({ description: '住户姓名' }),
            phone: t.Union([t.String(), t.Null()], { description: '联系电话' }),
            idCard: t.Union([t.String(), t.Null()], { description: '身份证号码' }),
            addressId: t.Number({ description: '地址ID' }),
            residentType: t.String({ description: '住户类型' }),
            moveInDate: t.Union([t.String(), t.Null()], { description: '入住日期' }),
            moveOutDate: t.Union([t.String(), t.Null()], { description: '搬出日期' }),
            isActive: t.Boolean({ description: '是否在住' }),
            createdAt: t.Union([t.String({ description: '创建时间' }), t.Null()]),
            updatedAt: t.Union([t.String({ description: '更新时间' }), t.Null()])
        }, { description: '新创建的住户信息' })
    }, {
        description: '创建住户成功的响应数据'
    }),

    /**
     * 更新住户响应
     * 返回更新后的住户信息
     */
    'residentUpdateResponse': t.Object({
        code: t.Number({ description: '响应状态码，200表示更新成功' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            id: t.Number({ description: '住户ID' }),
            name: t.String({ description: '住户姓名' }),
            phone: t.Union([t.String(), t.Null()], { description: '联系电话' }),
            idCard: t.Union([t.String(), t.Null()], { description: '身份证号码' }),
            addressId: t.Number({ description: '地址ID' }),
            residentType: t.String({ description: '住户类型' }),
            moveInDate: t.Union([t.String(), t.Null()], { description: '入住日期' }),
            moveOutDate: t.Union([t.String(), t.Null()], { description: '搬出日期' }),
            isActive: t.Boolean({ description: '是否在住' }),
            createdAt: t.String({ description: '创建时间' }),
            updatedAt: t.Union([t.String({ description: '更新时间' }), t.Null()])
        }, { description: '更新后的住户信息' })
    }, {
        description: '更新住户成功的响应数据'
    }),

    /**
     * 删除住户响应
     * 返回删除操作的结果
     */
    'residentDeleteResponse': t.Object({
        code: t.Number({ description: '响应状态码，200表示删除成功' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            success: t.Boolean({ description: '删除是否成功' })
        }, { description: '删除操作结果' })
    }, {
        description: '删除住户的响应数据'
    }),

    /**
     * 按地址查询住户响应
     * 返回特定地址下的住户信息
     */
    'residentByAddressResponse': t.Object({
        code: t.Number({ description: '响应状态码' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Any({ description: '按地址查询的住户数据，具体结构根据业务需求定义' })
    }, {
        description: '按地址查询住户的响应数据'
    }),

    /**
     * 住户搬出响应
     * 返回搬出操作后的住户信息
     */
    'residentMoveOutResponse': t.Object({
        code: t.Number({ description: '响应状态码，200表示搬出操作成功' }),
        msg: t.String({ description: '响应消息' }),
        data: t.Object({
            id: t.Number({ description: '住户ID' }),
            name: t.String({ description: '住户姓名' }),
            phone: t.Union([t.String(), t.Null()], { description: '联系电话' }),
            idCard: t.Union([t.String(), t.Null()], { description: '身份证号码' }),
            addressId: t.Number({ description: '地址ID' }),
            residentType: t.String({ description: '住户类型' }),
            moveInDate: t.Union([t.String(), t.Null()], { description: '入住日期' }),
            moveOutDate: t.Union([t.String(), t.Null()], { description: '搬出日期，已设置为当前日期' }),
            isActive: t.Boolean({ description: '是否在住，已设置为false' }),
            createdAt: t.String({ description: '创建时间' }),
            updatedAt: t.Union([t.String({ description: '更新时间' }), t.Null()])
        }, { description: '搬出后的住户信息' })
    }, {
        description: '住户搬出操作的响应数据'
    })
};

// 类型提取
export type ResidentQueryParams = typeof residentModels.residentQueryParams.static;
export type ResidentCreateBody = typeof residentModels.residentCreateBody.static;
export type ResidentUpdateBody = typeof residentModels.residentUpdateBody.static;
export type ResidentGetResponse = typeof residentModels.residentGetResponse.static;
export type ResidentListResponse = typeof residentModels.residentListResponse.static;
export type ResidentCreateResponse = typeof residentModels.residentCreateResponse.static;
export type ResidentUpdateResponse = typeof residentModels.residentUpdateResponse.static;
export type ResidentDeleteResponse = typeof residentModels.residentDeleteResponse.static;
export type ResidentByAddressResponse = typeof residentModels.residentByAddressResponse.static;
export type ResidentMoveOutResponse = typeof residentModels.residentMoveOutResponse.static;