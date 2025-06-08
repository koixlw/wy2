import { Elysia, t } from 'elysia';
import { ExpenseService } from '../../services/expenseService';
import { ok } from '../../utils/R';
import { expenseModels } from '@/type/expense.type';

// 路由定义
export const expensesRoute = new Elysia({ prefix: '/api/expenses' })
    .model(expenseModels)

    // 获取费用列表（分页）
    .get('/', async ({ query }) => {
        const result = await ExpenseService.getAllExpenses(query);
        return ok(result, 200, "获取费用列表成功");
    }, {
        query: 'expenseQueryParams',
        detail: {
            summary: '获取费用列表',
            description: '获取系统中所有费用的列表，支持分页查询和筛选',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseListResponse'
        }
    })

    // 获取费用统计
    .get('/stats', async ({ query }) => {
        const result = await ExpenseService.getExpenseStats(query);
        return ok(result, 200, "获取费用统计成功");
    }, {
        query: 'expenseQueryParams',
        detail: {
            summary: '获取费用统计',
            description: '获取费用的统计信息，包括总金额、已缴费、未缴费等',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseStatsResponse'
        }
    })

    // 获取单个费用详情
    .get('/:id', async ({ params: { id } }) => {
        const result = await ExpenseService.getExpenseById(Number(id));
        return ok(result, 200, "获取费用详情成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '获取费用详情',
            description: '根据费用ID获取单个费用的详细信息',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseGetResponse'
        }
    })

    // 根据住址获取费用列表
    .get('/by-address/:addressId', async ({ params: { addressId }, query }) => {
        const result = await ExpenseService.getExpensesByAddress(Number(addressId), query);
        return ok(result, 200, "获取住址费用成功");
    }, {
        params: t.Object({
            addressId: t.String()
        }),
        query: t.Object({
            expenseType: t.Optional(t.String()),
            status: t.Optional(t.String()),
            period: t.Optional(t.String())
        }),
        detail: {
            summary: '根据住址获取费用',
            description: '根据住址ID获取该住址下的所有费用',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseByAddressResponse'
        }
    })

    // 创建新费用
    .post('/', async ({ body }) => {
        const result = await ExpenseService.createExpense(body);
        return ok(result, 200, "创建费用成功");
    }, {
        body: 'expenseCreateBody',
        detail: {
            summary: '创建费用',
            description: '创建一个新的费用记录',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseCreateResponse'
        }
    })

    // 批量创建费用
    .post('/batch', async ({ body }) => {
        const result = await ExpenseService.createBatchExpenses(body);
        return ok(result, 200, "批量创建费用成功");
    }, {
        body: 'expenseBatchCreateBody',
        detail: {
            summary: '批量创建费用',
            description: '批量创建多个费用记录',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseBatchCreateResponse'
        }
    })

    // 更新费用信息
    .put('/:id', async ({ params: { id }, body }) => {
        const result = await ExpenseService.updateExpense(Number(id), body);
        return ok(result, 200, "更新费用成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: 'expenseUpdateBody',
        detail: {
            summary: '更新费用信息',
            description: '更新指定费用的信息',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseUpdateResponse'
        }
    })

    // 缴费
    .put('/:id/pay', async ({ params: { id }, body }) => {
        const result = await ExpenseService.payExpense(Number(id), body);
        return ok(result, 200, "缴费成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: 'expensePayBody',
        detail: {
            summary: '缴费',
            description: '标记费用为已缴费状态',
            tags: ['费用管理'],
        },
        response: {
            200: 'expensePayResponse'
        }
    })

    // 删除费用
    .delete('/:id', async ({ params: { id } }) => {
        await ExpenseService.deleteExpense(Number(id));
        return ok({ success: true }, 200, "删除费用成功");
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: {
            summary: '删除费用',
            description: '根据费用ID删除指定费用',
            tags: ['费用管理'],
        },
        response: {
            200: 'expenseDeleteResponse'
        }
    });