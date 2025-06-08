import { dbTable } from "@/db/dbTable"
import { t } from "elysia"

// 解构 Drizzle 类型
const { expenses: SExpenses } = dbTable.select;
const { expenses: IExpenses } = dbTable.insert;
const { addresses: SAddresses } = dbTable.select;
const { residents: SResidents } = dbTable.select;

/**
 * 费用管理模块类型定义
 * 包含费用的查询、创建、更新、删除等相关类型定义
 */
export const expenseModels = {
    // === 查询参数类型 ===
    /**
     * 费用查询参数
     * 用于费用列表查询和筛选
     */
    'expenseQueryParams': t.Object({
        addressId: t.Optional(t.Number({ description: '地址ID，用于筛选特定地址的费用' })),
        residentId: t.Optional(t.Number({ description: '住户ID，用于筛选特定住户的费用' })),
        expenseType: t.Optional(t.String({ description: '费用类型，如：水费、电费、物业费等' })),
        status: t.Optional(t.String({ description: '费用状态：pending(待缴费)、paid(已缴费)、overdue(逾期)' })),
        period: t.Optional(t.String({ description: '费用周期，格式：YYYY-MM，如：2024-01' })),
        search: t.Optional(t.String({ description: '搜索关键词，支持模糊搜索费用描述' })),
        startDate: t.Optional(t.String({ description: '开始日期，格式：YYYY-MM-DD' })),
        endDate: t.Optional(t.String({ description: '结束日期，格式：YYYY-MM-DD' })),
        page: t.Optional(t.String({ description: '页码，从1开始' })),
        limit: t.Optional(t.String({ description: '每页数量，默认10' }))
    }, {
        description: '费用查询参数，支持多条件组合筛选'
    }),

    /**
     * 费用统计查询参数
     * 用于获取费用统计数据
     */
    'expenseStatsQueryParams': t.Object({
        addressId: t.Optional(t.Number({ description: '地址ID，统计特定地址的费用' })),
        period: t.Optional(t.String({ description: '统计周期，格式：YYYY-MM' })),
        expenseType: t.Optional(t.String({ description: '费用类型筛选' }))
    }, {
        description: '费用统计查询参数'
    }),

    /**
     * 按地址查询费用参数
     * 用于获取特定地址下的费用信息
     */
    'expenseByAddressQueryParams': t.Object({
        expenseType: t.Optional(t.String({ description: '费用类型筛选' })),
        status: t.Optional(t.String({ description: '费用状态筛选' })),
        period: t.Optional(t.String({ description: '费用周期筛选' }))
    }, {
        description: '按地址查询费用的筛选参数'
    }),

    // === 请求体类型 ===
    /**
     * 创建费用请求体
     * 用于创建新的费用记录
     */
    'expenseCreateBody': t.Object({
        addressId: t.Number({ description: '地址ID，必填，关联到具体的房屋地址' }),
        residentId: t.Optional(t.Number({ description: '住户ID，可选，关联到具体住户' })),
        expenseType: t.String({ description: '费用类型，如：水费、电费、物业费、燃气费等' }),
        amount: t.Number({ description: '费用金额，单位：元，支持小数' }),
        period: t.String({ description: '费用周期，格式：YYYY-MM，如：2024-01' }),
        usage: t.Optional(t.Number({ description: '用量，如水费的用水量、电费的用电量' })),
        unitPrice: t.Optional(t.Number({ description: '单价，如每度电的价格、每吨水的价格' })),
        dueDate: t.Optional(t.String({ description: '到期日期，格式：YYYY-MM-DD' })),
        description: t.Optional(t.String({ description: '费用描述，补充说明信息' }))
    }, {
        description: '创建费用的请求数据，包含费用的基本信息',
        examples: {
            '水费': {
                addressId: 1,
                residentId: 1,
                expenseType: '水费',
                amount: 45.50,
                period: '2024-01',
                usage: 15,
                unitPrice: 3.03,
                dueDate: '2024-02-15',
                description: '2024年1月份水费'
            }
        }
    }),

    /**
     * 更新费用请求体
     * 用于更新已存在的费用记录
     */
    'expenseUpdateBody': t.Object({
        addressId: t.Optional(t.Number({ description: '地址ID' })),
        residentId: t.Optional(t.Number({ description: '住户ID' })),
        expenseType: t.Optional(t.String({ description: '费用类型' })),
        amount: t.Optional(t.Number({ description: '费用金额' })),
        period: t.Optional(t.String({ description: '费用周期' })),
        usage: t.Optional(t.Number({ description: '用量' })),
        unitPrice: t.Optional(t.Number({ description: '单价' })),
        status: t.Optional(t.String({ description: '费用状态' })),
        dueDate: t.Optional(t.String({ description: '到期日期' })),
        paidDate: t.Optional(t.String({ description: '缴费日期，格式：YYYY-MM-DD' })),
        description: t.Optional(t.String({ description: '费用描述' }))
    }, {
        description: '更新费用的请求数据，所有字段均为可选'
    }),

    /**
     * 费用缴费请求体
     * 用于标记费用为已缴费状态
     */
    'expensePayBody': t.Object({
        paidDate: t.Optional(t.String({ description: '缴费日期，格式：YYYY-MM-DD，默认为当前日期' })),
        paymentMethod: t.Optional(t.String({ description: '支付方式，如：现金、银行转账、支付宝、微信等' })),
        notes: t.Optional(t.String({ description: '缴费备注信息' }))
    }, {
        description: '费用缴费信息',
        examples: {
            '缴费记录': {
                paidDate: '2024-01-15',
                paymentMethod: '支付宝',
                notes: '住户主动缴费'
            }
        }
    }),

    /**
     * 批量创建费用请求体
     * 用于一次性创建多条费用记录
     */
    'expenseBatchCreateBody': t.Object({
        expenses: t.Array(t.Object({
            addressId: t.Number({ description: '地址ID' }),
            residentId: t.Optional(t.Number({ description: '住户ID' })),
            expenseType: t.String({ description: '费用类型' }),
            amount: t.Number({ description: '费用金额' }),
            period: t.String({ description: '费用周期' }),
            usage: t.Optional(t.Number({ description: '用量' })),
            unitPrice: t.Optional(t.Number({ description: '单价' })),
            dueDate: t.Optional(t.String({ description: '到期日期' })),
            description: t.Optional(t.String({ description: '费用描述' }))
        }), { description: '费用记录数组，每个元素包含完整的费用信息' })
    }, {
        description: '批量创建费用的请求数据，包含多条费用记录',
        examples: {
            '批量创建水电费': {
                expenses: [
                    {
                        addressId: 1,
                        expenseType: '水费',
                        amount: 45.50,
                        period: '2024-01'
                    },
                    {
                        addressId: 1,
                        expenseType: '电费',
                        amount: 120.00,
                        period: '2024-01'
                    }
                ]
            }
        }
    }),

    // === 响应类型 ===
    'expenseGetResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: SExpenses.id,
            addressId: SExpenses.addressId,
            residentId: t.Optional(SExpenses.residentId),
            expenseType: SExpenses.expenseType,
            amount: SExpenses.amount,
            period: SExpenses.period,
            usage: t.Optional(SExpenses.usage),
            unitPrice: t.Optional(SExpenses.unitPrice),
            status: SExpenses.status,
            dueDate: t.Optional(SExpenses.dueDate),
            paidDate: t.Optional(SExpenses.paidDate),
            description: t.Optional(SExpenses.description),
            createdAt: SExpenses.createdAt,
            updatedAt: SExpenses.updatedAt,
            address: t.Union([
                t.Object({
                    id: SAddresses.id,
                    name: SAddresses.name,
                    type: SAddresses.type,
                    code: t.Optional(SAddresses.code)
                }),
                t.Null()
            ]),
            resident: t.Union([
                t.Object({
                    id: SResidents.id,
                    name: SResidents.name,
                    phone: t.Optional(SResidents.phone)
                }),
                t.Null()
            ])
        })
    }),

    'expenseListResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            items: t.Array(t.Object({
                id: SExpenses.id,
                addressId: SExpenses.addressId,
                residentId: t.Optional(SExpenses.residentId),
                expenseType: SExpenses.expenseType,
                amount: SExpenses.amount,
                period: SExpenses.period,
                usage: t.Optional(SExpenses.usage),
                unitPrice: t.Optional(SExpenses.unitPrice),
                status: SExpenses.status,
                dueDate: t.Optional(SExpenses.dueDate),
                paidDate: t.Optional(SExpenses.paidDate),
                description: t.Optional(SExpenses.description),
                createdAt: SExpenses.createdAt,
                updatedAt: SExpenses.updatedAt,
                address: t.Union([
                    t.Object({
                        id: SAddresses.id,
                        name: SAddresses.name,
                        type: SAddresses.type,
                        code: t.Optional(SAddresses.code)
                    }),
                    t.Null()
                ]),
                resident: t.Union([
                    t.Object({
                        id: SResidents.id,
                        name: SResidents.name,
                        phone: t.Optional(SResidents.phone)
                    }),
                    t.Null()
                ])
            })),
            pagination: t.Object({
                page: t.Number(),
                limit: t.Number(),
                total: t.Number(),
                totalPages: t.Number()
            })
        })
    }),

    'expenseCreateResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: SExpenses.id,
            addressId: SExpenses.addressId,
            residentId: t.Optional(SExpenses.residentId),
            expenseType: SExpenses.expenseType,
            amount: SExpenses.amount,
            period: SExpenses.period,
            usage: t.Optional(SExpenses.usage),
            unitPrice: t.Optional(SExpenses.unitPrice),
            status: SExpenses.status,
            dueDate: t.Optional(SExpenses.dueDate),
            paidDate: t.Optional(SExpenses.paidDate),
            description: t.Optional(SExpenses.description),
            createdAt: SExpenses.createdAt,
            updatedAt: SExpenses.updatedAt
        })
    }),

    'expenseUpdateResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: SExpenses.id,
            addressId: SExpenses.addressId,
            residentId: t.Optional(SExpenses.residentId),
            expenseType: SExpenses.expenseType,
            amount: SExpenses.amount,
            period: SExpenses.period,
            usage: t.Optional(SExpenses.usage),
            unitPrice: t.Optional(SExpenses.unitPrice),
            status: SExpenses.status,
            dueDate: t.Optional(SExpenses.dueDate),
            paidDate: t.Optional(SExpenses.paidDate),
            description: t.Optional(SExpenses.description),
            createdAt: SExpenses.createdAt,
            updatedAt: SExpenses.updatedAt
        })
    }),

    'expenseDeleteResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            success: t.Boolean()
        })
    }),

    'expensePayResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            id: SExpenses.id,
            addressId: SExpenses.addressId,
            residentId: t.Optional(SExpenses.residentId),
            expenseType: SExpenses.expenseType,
            amount: SExpenses.amount,
            period: SExpenses.period,
            usage: t.Optional(SExpenses.usage),
            unitPrice: t.Optional(SExpenses.unitPrice),
            status: SExpenses.status,
            dueDate: t.Optional(SExpenses.dueDate),
            paidDate: t.Optional(SExpenses.paidDate),
            description: t.Optional(SExpenses.description),
            createdAt: SExpenses.createdAt,
            updatedAt: SExpenses.updatedAt
        })
    }),

    'expenseStatsResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Any()
    }),

    'expenseByAddressResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Any()
    }),

    'expenseBatchCreateResponse': t.Object({
        code: t.Number(),
        msg: t.String(),
        data: t.Object({
            success: t.Boolean(),
            count: t.Number()
        })
    })
};

// 类型提取
export type ExpenseQueryParams = typeof expenseModels.expenseQueryParams.static;
export type ExpenseStatsQueryParams = typeof expenseModels.expenseStatsQueryParams.static;
export type ExpenseByAddressQueryParams = typeof expenseModels.expenseByAddressQueryParams.static;
export type ExpenseCreateBody = typeof expenseModels.expenseCreateBody.static;
export type ExpenseUpdateBody = typeof expenseModels.expenseUpdateBody.static;
export type ExpensePayBody = typeof expenseModels.expensePayBody.static;
export type ExpenseBatchCreateBody = typeof expenseModels.expenseBatchCreateBody.static;
export type ExpenseGetResponse = typeof expenseModels.expenseGetResponse.static;
export type ExpenseListResponse = typeof expenseModels.expenseListResponse.static;
export type ExpenseCreateResponse = typeof expenseModels.expenseCreateResponse.static;
export type ExpenseUpdateResponse = typeof expenseModels.expenseUpdateResponse.static;
export type ExpenseDeleteResponse = typeof expenseModels.expenseDeleteResponse.static;
export type ExpensePayResponse = typeof expenseModels.expensePayResponse.static;
export type ExpenseStatsResponse = typeof expenseModels.expenseStatsResponse.static;
export type ExpenseByAddressResponse = typeof expenseModels.expenseByAddressResponse.static;
export type ExpenseBatchCreateResponse = typeof expenseModels.expenseBatchCreateResponse.static;