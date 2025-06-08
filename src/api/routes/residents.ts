import { Elysia, t } from 'elysia';
import { ResidentService } from '../../services/residentService';
import { ok } from '../../utils/R';
import { residentModels } from '@/type/resident.type';

// 路由定义
export const residentsRoute = new Elysia({ prefix: '/api/residents' })
    .model(residentModels)

    // 获取住户列表（分页）
    .get('/', async ({ query }) => {
        const result = await ResidentService.getAllResidents(query);
        return ok(result, 200, "获取住户列表成功");
    }, {
        query: 'residentQueryParams',
        detail: {
            summary: '获取住户列表',
            description: '获取系统中所有住户的列表，支持分页查询和筛选',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentListResponse'
        }
    })

    // 获取单个住户详情
    .get('/:id', async ({ params: { id } }) => {
        const result = await ResidentService.getResidentById(Number(id));
        return ok(result, 200, "获取住户详情成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '获取住户详情',
            description: '根据住户ID获取单个住户的详细信息',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentGetResponse'
        }
    })

    // 根据住址获取住户列表
    .get('/by-address/:addressId', async ({ params: { addressId } }) => {
        const result = await ResidentService.getResidentsByAddress(Number(addressId));
        return ok(result, 200, "获取住址住户成功");
    }, {
        params: t.Object({
            addressId: t.String()
        }),
        detail: {
            summary: '根据住址获取住户',
            description: '根据住址ID获取该住址下的所有住户',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentByAddressResponse'
        }
    })

    // 创建新住户
    .post('/', async ({ body }) => {
        const result = await ResidentService.createResident(body);
        return ok(result, 200, "创建住户成功");
    }, {
        body: 'residentCreateBody',
        detail: {
            summary: '创建住户',
            description: '创建一个新的住户',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentCreateResponse'
        }
    })

    // 更新住户信息
    .put('/:id', async ({ params: { id }, body }) => {
        const result = await ResidentService.updateResident(Number(id), body);
        return ok(result, 200, "更新住户成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: 'residentUpdateBody',
        detail: {
            summary: '更新住户信息',
            description: '更新指定住户的信息',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentUpdateResponse'
        }
    })

    // 住户搬出
    .put('/:id/move-out', async ({ params: { id } }) => {
        const result = await ResidentService.moveOutResident(Number(id));
        return ok(result, 200, "住户搬出成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '住户搬出',
            description: '标记住户搬出，设置搬出时间',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentMoveOutResponse'
        }
    })

    // 删除住户
    .delete('/:id', async ({ params: { id } }) => {
        await ResidentService.deleteResident(Number(id));
        return ok({ success: true }, 200, "删除住户成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '删除住户',
            description: '根据住户ID删除指定住户',
            tags: ['住户管理'],
        },
        response: {
            200: 'residentDeleteResponse'
        }
    });