import { dbTable } from "@/db/dbTable"
import { t } from "elysia"

// 解构 Drizzle 类型
const { addresses: SAddresses } = dbTable.select;
const { addresses: IAddresses } = dbTable.insert;

/**
 * 地址管理模块类型定义
 * 包含地址的增删改查、树形结构等相关接口类型
 */
export const addressModels = {
    // === 查询参数类型 ===
    /**
     * 地址查询参数
     * @description 用于地址列表查询的参数 
     */
    'addressQueryParams': t.Object({
        /** 搜索关键词，支持地址名称模糊查询 */
        search: t.Optional(t.String({ description: '搜索关键词' })),
        /** 地址类型，如：小区、楼栋、单元、房间 */
        type: t.Optional(t.String({ description: '地址类型' })),
        /** 父级地址ID，用于查询下级地址 */
        parentId: t.Optional(t.Number({ description: '父级地址ID' })),
        /** 是否启用状态 */
        isActive: t.Optional(t.Boolean({ description: '启用状态' })),
    }, {
        description: '地址查询参数',
        examples: [{
            search: '阳光小区',
            type: '小区',
            page: 1,
            limit: 20
        }]
    }),

    // === 请求体类型 ===
    /**
     * 创建地址请求体
     * @description 创建新地址时需要提供的数据
     */
    'addressCreateBody': t.Object({
        /** 地址名称，如：阳光小区、1号楼、1单元、101室 */
        name: IAddresses.name,
        /** 地址类型：community(小区)、building(楼栋)、unit(单元)、room(房间) */
        type: IAddresses.type,
        /** 父级地址ID，顶级地址可为空 */
        parentId: t.Optional(IAddresses.parentId),
        /** 地址编码，用于快速检索 */
        code: t.Optional(IAddresses.code),
        /** 地址描述信息 */
        description: t.Optional(IAddresses.description),
        /** 地址面积（平方米） */
        area: t.Optional(IAddresses.area)
    }, {
        description: '创建地址请求体',
        examples: [{
            name: '阳光小区',
            type: 'community',
            code: 'YG001',
            description: '位于市中心的高档住宅小区',
            area: 50000
        }]
    }),

    /**
     * 更新地址请求体
     * @description 更新地址信息时需要提供的数据，所有字段均为可选
     */
    'addressUpdateBody': t.Object({
        /** 地址名称 */
        name: t.Optional(IAddresses.name),
        /** 地址类型 */
        type: t.Optional(IAddresses.type),
        /** 父级地址ID */
        parentId: t.Optional(IAddresses.parentId),
        /** 地址编码 */
        code: t.Optional(IAddresses.code),
        /** 地址描述 */
        description: t.Optional(IAddresses.description),
        /** 地址面积 */
        area: t.Optional(IAddresses.area),
        /** 启用状态 */
        isActive: t.Optional(IAddresses.isActive)
    }, {
        description: '更新地址请求体',
        examples: [{
            name: '阳光花园小区',
            description: '更新后的小区描述',
            isActive: true
        }]
    }),

    // === 响应类型 ===
    /**
     * 获取单个地址响应
     * @description 根据ID获取地址详情的响应格式
     */
    'addressGetResponse': t.Object({
        /** 响应状态码：200成功，400参数错误，404未找到，500服务器错误 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 地址详情数据 */
        data: t.Object({
            /** 地址ID */
            id: SAddresses.id,
            /** 地址名称 */
            name: SAddresses.name,
            /** 地址类型 */
            type: SAddresses.type,
            /** 父级地址ID */
            parentId: t.Optional(SAddresses.parentId),
            /** 地址编码 */
            code: t.Optional(SAddresses.code),
            /** 地址描述 */
            description: t.Optional(SAddresses.description),
            /** 地址面积 */
            area: t.Optional(SAddresses.area),
            /** 启用状态 */
            isActive: SAddresses.isActive,
            /** 创建时间 */
            createdAt: SAddresses.createdAt,
            /** 更新时间 */
            updatedAt: SAddresses.updatedAt
        }, { description: '地址详情' })
    }, {
        description: '获取地址详情响应',
        examples: [{
            code: 200,
            msg: '获取成功',
            data: {
                id: 1,
                name: '阳光小区',
                type: 'community',
                parentId: null,
                code: 'YG001',
                description: '位于市中心的高档住宅小区',
                area: 50000,
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        }]
    }),

    /**
     * 地址列表响应
     * @description 分页查询地址列表的响应格式
     */
    'addressListResponse': t.Object({
        /** 响应状态码 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 列表数据 */
        data: t.Object({
            /** 地址列表 */
            items: t.Array(t.Object({
                /** 地址ID */
                id: SAddresses.id,
                /** 地址名称 */
                name: SAddresses.name,
                /** 地址类型 */
                type: SAddresses.type,
                /** 父级地址ID */
                parentId: t.Optional(SAddresses.parentId),
                /** 地址编码 */
                code: t.Optional(SAddresses.code),
                /** 地址描述 */
                description: t.Optional(SAddresses.description),
                /** 地址面积 */
                area: t.Optional(SAddresses.area),
                /** 启用状态 */
                isActive: SAddresses.isActive,
                /** 创建时间 */
                createdAt: SAddresses.createdAt,
                /** 更新时间 */
                updatedAt: SAddresses.updatedAt
            }, { description: '地址信息' }), { description: '地址列表' }),
            /** 分页信息 */
            pagination: t.Object({
                /** 当前页码 */
                page: t.Number({ description: '当前页码' }),
                /** 每页数量 */
                limit: t.Number({ description: '每页数量' }),
                /** 总记录数 */
                total: t.Number({ description: '总记录数' }),
                /** 总页数 */
                totalPages: t.Number({ description: '总页数' })
            }, { description: '分页信息' })
        }, { description: '列表数据' })
    }, {
        description: '地址列表响应',
        examples: [{
            code: 200,
            msg: '获取成功',
            data: {
                items: [{
                    id: 1,
                    name: '阳光小区',
                    type: 'community',
                    parentId: null,
                    code: 'YG001',
                    description: '位于市中心的高档住宅小区',
                    area: 50000,
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    totalPages: 1
                }
            }
        }]
    }),

    /**
     * 创建地址响应
     * @description 创建地址成功后的响应格式
     */
    'addressCreateResponse': t.Object({
        /** 响应状态码 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 创建的地址数据 */
        data: t.Object({
            /** 地址ID */
            id: SAddresses.id,
            /** 地址名称 */
            name: SAddresses.name,
            /** 地址类型 */
            type: SAddresses.type,
            /** 父级地址ID */
            parentId: t.Optional(SAddresses.parentId),
            /** 地址编码 */
            code: t.Optional(SAddresses.code),
            /** 地址描述 */
            description: t.Optional(SAddresses.description),
            /** 地址面积 */
            area: t.Optional(SAddresses.area),
            /** 启用状态 */
            isActive: SAddresses.isActive,
            /** 创建时间 */
            createdAt: SAddresses.createdAt,
            /** 更新时间 */
            updatedAt: SAddresses.updatedAt
        }, { description: '创建的地址信息' })
    }, {
        description: '创建地址响应',
        examples: [{
            code: 200,
            msg: '创建成功',
            data: {
                id: 1,
                name: '阳光小区',
                type: 'community',
                parentId: null,
                code: 'YG001',
                description: '位于市中心的高档住宅小区',
                area: 50000,
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        }]
    }),

    /**
     * 更新地址响应
     * @description 更新地址成功后的响应格式
     */
    'addressUpdateResponse': t.Object({
        /** 响应状态码 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 更新后的地址数据 */
        data: t.Object({
            /** 地址ID */
            id: SAddresses.id,
            /** 地址名称 */
            name: SAddresses.name,
            /** 地址类型 */
            type: SAddresses.type,
            /** 父级地址ID */
            parentId: t.Optional(SAddresses.parentId),
            /** 地址编码 */
            code: t.Optional(SAddresses.code),
            /** 地址描述 */
            description: t.Optional(SAddresses.description),
            /** 地址面积 */
            area: t.Optional(SAddresses.area),
            /** 启用状态 */
            isActive: SAddresses.isActive,
            /** 创建时间 */
            createdAt: SAddresses.createdAt,
            /** 更新时间 */
            updatedAt: SAddresses.updatedAt
        }, { description: '更新后的地址信息' })
    }, {
        description: '更新地址响应',
        examples: [{
            code: 200,
            msg: '更新成功',
            data: {
                id: 1,
                name: '阳光花园小区',
                type: 'community',
                parentId: null,
                code: 'YG001',
                description: '更新后的小区描述',
                area: 50000,
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T12:00:00.000Z'
            }
        }]
    }),

    /**
     * 删除地址响应
     * @description 删除地址操作的响应格式
     */
    'addressDeleteResponse': t.Object({
        /** 响应状态码 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 删除操作结果 */
        data: t.Object({
            /** 删除是否成功 */
            success: t.Boolean({ description: '删除是否成功' })
        }, { description: '删除结果' })
    }, {
        description: '删除地址响应',
        examples: [{
            code: 200,
            msg: '删除成功',
            data: {
                success: true
            }
        }]
    }),

    /**
     * 地址树形结构响应
     * @description 获取地址树形结构的响应格式，用于级联选择器等场景
     */
    'addressTreeResponse': t.Object({
        /** 响应状态码 */
        code: t.Number({ description: '状态码' }),
        /** 响应消息 */
        msg: t.String({ description: '响应消息' }),
        /** 树形结构数据，包含嵌套的子级地址 */
        data: t.Any({ description: '树形结构数据，每个节点包含children数组表示子级地址' })
    }, {
        description: '地址树形结构响应',
        examples: [{
            code: 200,
            msg: '获取成功',
            data: [{
                id: 1,
                name: '阳光小区',
                type: 'community',
                children: [{
                    id: 2,
                    name: '1号楼',
                    type: 'building',
                    children: [{
                        id: 3,
                        name: '1单元',
                        type: 'unit',
                        children: [{
                            id: 4,
                            name: '101室',
                            type: 'room',
                            children: []
                        }]
                    }]
                }]
            }]
        }]
    })
};

// 类型提取
export type AddressQueryParams = typeof addressModels.addressQueryParams.static;
export type AddressCreateBody = typeof addressModels.addressCreateBody.static;
export type AddressUpdateBody = typeof addressModels.addressUpdateBody.static;
export type AddressGetResponse = typeof addressModels.addressGetResponse.static;
export type AddressListResponse = typeof addressModels.addressListResponse.static;
export type AddressCreateResponse = typeof addressModels.addressCreateResponse.static;
export type AddressUpdateResponse = typeof addressModels.addressUpdateResponse.static;
export type AddressDeleteResponse = typeof addressModels.addressDeleteResponse.static;
export type AddressTreeResponse = typeof addressModels.addressTreeResponse.static;