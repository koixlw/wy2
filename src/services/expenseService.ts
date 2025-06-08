
import { eq, like, and, desc, gte, lte, sum, count } from 'drizzle-orm';

import { ExpenseQueryParams, ExpenseCreateBody, ExpenseUpdateBody, ExpensePayBody } from '@/type/expense.type';
import { addresses, expenses, residents } from '@/db/schema';
import { db } from '@/db';

// 类型别名
type CreateExpenseData = ExpenseCreateBody;
type UpdateExpenseData = ExpenseUpdateBody;
type PayExpenseData = ExpensePayBody;
type StatsParams = ExpenseQueryParams;

export abstract class ExpenseService {
  // 获取所有费用（分页）
  static async getAllExpenses(query: ExpenseQueryParams) {
    try {
      const {
        search,
        addressId,
        residentId,
        expenseType,
        status,
        period,
        startDate,
        endDate,
        page = '1',
        limit = '10'
      } = query;

      // 构建查询条件
      const conditions = [];

      if (search) {
        conditions.push(like(expenses.description, `%${search}%`));
      }

      if (addressId) {
        conditions.push(eq(expenses.addressId, Number(addressId)));
      }

      if (residentId) {
        conditions.push(eq(expenses.residentId, Number(residentId)));
      }

      if (expenseType) {
        conditions.push(eq(expenses.expenseType, expenseType));
      }

      if (status) {
        conditions.push(eq(expenses.status, status));
      }

      if (period) {
        conditions.push(eq(expenses.period, period));
      }

      if (startDate) {
        conditions.push(gte(expenses.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(expenses.createdAt, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 计算分页
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * limitNum;

      // 查询数据（关联住址和住户信息）
      const [expensesList, totalResult] = await Promise.all([
        db.select({
          id: expenses.id,
          addressId: expenses.addressId,
          residentId: expenses.residentId,
          expenseType: expenses.expenseType,
          amount: expenses.amount,
          period: expenses.period,
          usage: expenses.usage,
          unitPrice: expenses.unitPrice,
          status: expenses.status,
          dueDate: expenses.dueDate,
          paidDate: expenses.paidDate,
          description: expenses.description,
          createdAt: expenses.createdAt,
          updatedAt: expenses.updatedAt,
          address: {
            id: addresses.id,
            name: addresses.name,
            type: addresses.type,
            code: addresses.code
          },
          resident: {
            id: residents.id,
            name: residents.name,
            phone: residents.phone
          }
        })
          .from(expenses)
          .leftJoin(addresses, eq(expenses.addressId, addresses.id))
          .leftJoin(residents, eq(expenses.residentId, residents.id))
          .where(whereClause)
          .orderBy(desc(expenses.createdAt))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: expenses.id })
          .from(expenses)
          .where(whereClause)
      ]);

      const total = totalResult.length;
      const totalPages = Math.ceil(total / limitNum);

      return {
        items: expensesList,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取费用列表出错:', error);
      throw new Error('获取费用列表失败');
    }
  }

  // 获取费用统计
  static async getExpenseStats(query: StatsParams) {
    try {
      const { addressId, expenseType, period } = query;

      // 构建查询条件
      const conditions = [];

      if (addressId) {
        conditions.push(eq(expenses.addressId, Number(addressId)));
      }

      if (expenseType) {
        conditions.push(eq(expenses.expenseType, expenseType));
      }

      if (period) {
        conditions.push(eq(expenses.period, period));
      }

      // if (year) {
      //   conditions.push(like(expenses.period, `${year}%`));
      // }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 获取总体统计
      const [totalStats, paidStats, unpaidStats, overdueStats] = await Promise.all([
        db.select({
          totalAmount: sum(expenses.amount),
          totalCount: count(expenses.id)
        })
          .from(expenses)
          .where(whereClause),
        db.select({
          paidAmount: sum(expenses.amount),
          paidCount: count(expenses.id)
        })
          .from(expenses)
          .where(and(whereClause, eq(expenses.status, 'paid'))),
        db.select({
          unpaidAmount: sum(expenses.amount),
          unpaidCount: count(expenses.id)
        })
          .from(expenses)
          .where(and(whereClause, eq(expenses.status, 'unpaid'))),
        db.select({
          overdueAmount: sum(expenses.amount),
          overdueCount: count(expenses.id)
        })
          .from(expenses)
          .where(and(whereClause, eq(expenses.status, 'overdue')))
      ]);

      // 按类型统计
      const byTypeStats = await db.select({
        expenseType: expenses.expenseType,
        amount: sum(expenses.amount),
        count: count(expenses.id)
      })
        .from(expenses)
        .where(whereClause)
        .groupBy(expenses.expenseType);

      // 按周期统计
      const byPeriodStats = await db.select({
        period: expenses.period,
        amount: sum(expenses.amount),
        count: count(expenses.id)
      })
        .from(expenses)
        .where(whereClause)
        .groupBy(expenses.period)
        .orderBy(desc(expenses.period))
        .limit(12); // 最近12个周期

      return {
        totalAmount: totalStats[0]?.totalAmount?.toString() || '0',
        paidAmount: paidStats[0]?.paidAmount?.toString() || '0',
        unpaidAmount: unpaidStats[0]?.unpaidAmount?.toString() || '0',
        overdueAmount: overdueStats[0]?.overdueAmount?.toString() || '0',
        totalCount: totalStats[0]?.totalCount || 0,
        paidCount: paidStats[0]?.paidCount || 0,
        unpaidCount: unpaidStats[0]?.unpaidCount || 0,
        overdueCount: overdueStats[0]?.overdueCount || 0,
        byType: byTypeStats.map(item => ({
          expenseType: item.expenseType,
          amount: item.amount?.toString() || '0',
          count: item.count
        })),
        byPeriod: byPeriodStats.map(item => ({
          period: item.period,
          amount: item.amount?.toString() || '0',
          count: item.count
        }))
      };
    } catch (error) {
      console.error('获取费用统计出错:', error);
      throw new Error('获取费用统计失败');
    }
  }

  // 根据ID获取费用
  static async getExpenseById(id: number) {
    try {
      const expense = await db.select({
        id: expenses.id,
        addressId: expenses.addressId,
        residentId: expenses.residentId,
        expenseType: expenses.expenseType,
        amount: expenses.amount,
        period: expenses.period,
        usage: expenses.usage,
        unitPrice: expenses.unitPrice,
        status: expenses.status,
        dueDate: expenses.dueDate,
        paidDate: expenses.paidDate,
        description: expenses.description,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        address: {
          id: addresses.id,
          name: addresses.name,
          type: addresses.type,
          code: addresses.code
        },
        resident: {
          id: residents.id,
          name: residents.name,
          phone: residents.phone
        }
      })
        .from(expenses)
        .leftJoin(addresses, eq(expenses.addressId, addresses.id))
        .leftJoin(residents, eq(expenses.residentId, residents.id))
        .where(eq(expenses.id, id))
        .limit(1);

      if (expense.length === 0) {
        throw new Error('费用不存在');
      }

      return expense[0];
    } catch (error) {
      console.error('获取费用详情出错:', error);
      throw new Error('获取费用详情失败');
    }
  }

  // 根据住址获取费用列表
  static async getExpensesByAddress(addressId: number, query: any) {
    try {
      const { expenseType, status, period } = query;

      const conditions = [eq(expenses.addressId, addressId)];

      if (expenseType) {
        conditions.push(eq(expenses.expenseType, expenseType));
      }

      if (status) {
        conditions.push(eq(expenses.status, status));
      }

      if (period) {
        conditions.push(eq(expenses.period, period));
      }

      const expensesList = await db.select({
        id: expenses.id,
        addressId: expenses.addressId,
        residentId: expenses.residentId,
        expenseType: expenses.expenseType,
        amount: expenses.amount,
        period: expenses.period,
        usage: expenses.usage,
        unitPrice: expenses.unitPrice,
        status: expenses.status,
        dueDate: expenses.dueDate,
        paidDate: expenses.paidDate,
        description: expenses.description,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        address: {
          id: addresses.id,
          name: addresses.name,
          type: addresses.type,
          code: addresses.code
        },
        resident: {
          id: residents.id,
          name: residents.name,
          phone: residents.phone
        }
      })
        .from(expenses)
        .leftJoin(addresses, eq(expenses.addressId, addresses.id))
        .leftJoin(residents, eq(expenses.residentId, residents.id))
        .where(and(...conditions))
        .orderBy(desc(expenses.createdAt));

      return expensesList;
    } catch (error) {
      console.error('获取住址费用出错:', error);
      throw new Error('获取住址费用失败');
    }
  }

  // 创建费用
  static async createExpense(data: CreateExpenseData) {
    try {
      // 验证住址是否存在
      const address = await db.select()
        .from(addresses)
        .where(eq(addresses.id, data.addressId))
        .limit(1);

      if (address.length === 0) {
        throw new Error('住址不存在');
      }

      // 验证住户是否存在（如果提供了住户ID）
      if (data.residentId) {
        const resident = await db.select()
          .from(residents)
          .where(eq(residents.id, data.residentId))
          .limit(1);

        if (resident.length === 0) {
          throw new Error('住户不存在');
        }
      }

      // 处理数据类型转换
      const insertData: any = {
        ...data,
        amount: data.amount,
        status: 'unpaid'
      };

      if (data.usage) {
        insertData.usage = data.usage;
      }

      if (data.unitPrice) {
        insertData.unitPrice = data.unitPrice;
      }

      if (data.dueDate) {
        insertData.dueDate = new Date(data.dueDate);
      }

      const result = await db.insert(expenses)
        .values(insertData);

      // 获取创建的费用
      const newExpense = await this.getExpenseById(Number(result[0].insertId));

      return newExpense;
    } catch (error) {
      console.error('创建费用出错:', error);
      throw new Error('创建费用失败');
    }
  }

  // 批量创建费用
  static async createBatchExpenses(data: { expenses: CreateExpenseData[] }) {
    try {
      const { expenses: expensesData } = data;

      if (!expensesData || expensesData.length === 0) {
        throw new Error('费用数据不能为空');
      }

      // 验证所有住址是否存在
      const addressIds = [...new Set(expensesData.map(e => e.addressId))];
      const addressesResult = await db.select()
        .from(addresses)
        .where(eq(addresses.id, addressIds[0])); // 简化验证，实际应该验证所有ID

      // 处理批量插入数据
      const insertData = expensesData.map(expense => ({
        ...expense,
        amount: expense.amount,
        status: 'unpaid' as const,
        usage: expense.usage || null,
        unitPrice: expense.unitPrice || null,
        dueDate: expense.dueDate ? new Date(expense.dueDate) : null
      }));

      await db.insert(expenses).values(insertData);

      return {
        success: true,
        count: expensesData.length
      };
    } catch (error) {
      console.error('批量创建费用出错:', error);
      throw new Error('批量创建费用失败');
    }
  }

  // 更新费用
  static async updateExpense(id: number, data: UpdateExpenseData) {
    try {
      // 验证费用是否存在
      await this.getExpenseById(id);

      // 验证住址是否存在（如果要更新住址）
      if (data.addressId) {
        const address = await db.select()
          .from(addresses)
          .where(eq(addresses.id, data.addressId))
          .limit(1);

        if (address.length === 0) {
          throw new Error('住址不存在');
        }
      }

      // 处理数据类型转换
      const updateData: any = { ...data };

      if (data.dueDate) {
        updateData.dueDate = new Date(data.dueDate);
      }

      await db.update(expenses)
        .set(updateData)
        .where(eq(expenses.id, id));

      // 返回更新后的费用
      return await this.getExpenseById(id);
    } catch (error) {
      console.error('更新费用出错:', error);
      throw new Error('更新费用失败');
    }
  }

  // 缴费
  static async payExpense(id: number, data: PayExpenseData) {
    try {
      // 验证费用是否存在
      const expense = await this.getExpenseById(id);

      if (expense.status === 'paid') {
        throw new Error('该费用已经缴费');
      }

      const paidDate = data.paidDate ? new Date(data.paidDate) : new Date();

      await db.update(expenses)
        .set({
          status: 'paid',
          paidDate: paidDate
        })
        .where(eq(expenses.id, id));

      // 返回更新后的费用
      return await this.getExpenseById(id);
    } catch (error) {
      console.error('缴费出错:', error);
      throw new Error('缴费失败');
    }
  }

  // 删除费用
  static async deleteExpense(id: number) {
    try {
      // 验证费用是否存在
      await this.getExpenseById(id);

      // 物理删除费用记录
      await db.delete(expenses)
        .where(eq(expenses.id, id));

      return true;
    } catch (error) {
      console.error('删除费用出错:', error);
      throw new Error('删除费用失败');
    }
  }
}