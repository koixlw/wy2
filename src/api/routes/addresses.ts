import { Elysia, t } from 'elysia';

import { AddressService } from '../../services/addressService';
import { ok } from '../../utils/R';
import { addressModels } from '@/type/address.type';

// 路由定义
export const addressesRoute = new Elysia({ prefix: '/api/addresses' })
    .model(addressModels)

    // 获取住址列表（分页）
    .get('/', async ({ query }) => {
        const result = await AddressService.getAllAddresses(query);
        return ok(result, 200, "获取住址列表成功");
    }, {
        query: 'addressQueryParams',
        detail: {
            summary: '获取住址列表',
            description: '获取系统中所有住址的列表，支持分页查询和筛选',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressListResponse'
        }
    })

    // 获取住址树形结构
    .get('/tree', async ({ query }) => {
        const result = await AddressService.getAddressTree(query);
        return ok(result, 200, "获取住址树形结构成功");
    }, {
        query: 'addressQueryParams',
        detail: {
            summary: '获取住址树形结构',
            description: '获取住址的树形结构，用于展示小区-栋-楼层-房间的层级关系',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressTreeResponse'
        }
    })

    // 获取单个住址详情
    .get('/:id', async ({ params: { id } }) => {
        const result = await AddressService.getAddressById(Number(id));
        return ok(result, 200, "获取住址详情成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '获取住址详情',
            description: '根据住址ID获取单个住址的详细信息',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressGetResponse'
        }
    })

    // 创建新住址
    .post('/', async ({ body }) => {
        const result = await AddressService.createAddress(body);
        return ok(result, 200, "创建住址成功");
    }, {
        body: 'addressCreateBody',
        detail: {
            summary: '创建住址',
            description: '创建一个新的住址（小区、栋、楼层或房间）',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressCreateResponse'
        }
    })

    // 更新住址信息
    .put('/:id', async ({ params: { id }, body }) => {
        const result = await AddressService.updateAddress(Number(id), body);
        return ok(result, 200, "更新住址成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: 'addressUpdateBody',
        detail: {
            summary: '更新住址信息',
            description: '更新指定住址的信息',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressUpdateResponse'
        }
    })

    // 删除住址
    .delete('/:id', async ({ params: { id } }) => {
        await AddressService.deleteAddress(Number(id));
        return ok({ success: true }, 200, "删除住址成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '删除住址',
            description: '根据住址ID删除指定住址',
            tags: ['住址管理'],
        },
        response: {
            200: 'addressDeleteResponse'
        }
    });