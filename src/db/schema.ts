import { mysqlTable, serial, varchar, text, timestamp, int, decimal, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// 住址表 - 使用树形结构存储小区、栋、楼层、房间
export const addresses = mysqlTable('addresses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // 名称：如"阳光小区"、"1栋"、"3楼"、"301室"
  type: varchar('type', { length: 50 }).notNull(), // 类型：community(小区)、building(栋)、floor(楼层)、room(房间)
  parentId: int('parent_id'), // 父级ID，构建树形结构
  code: varchar('code', { length: 100 }), // 编码：如房间号、栋号等
  description: text('description'), // 描述
  area: decimal('area', { precision: 10, scale: 2 }), // 面积（平方米）
  isActive: boolean('is_active').default(true).notNull(), // 是否启用
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 住户表
export const residents = mysqlTable('residents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // 住户姓名
  phone: varchar('phone', { length: 20 }), // 联系电话
  idCard: varchar('id_card', { length: 18 }), // 身份证号
  addressId: int('address_id').notNull(), // 关联住址ID（房间）
  residentType: varchar('resident_type', { length: 50 }).default('owner').notNull(), // 住户类型：owner(业主)、tenant(租户)
  moveInDate: timestamp('move_in_date'), // 入住时间
  moveOutDate: timestamp('move_out_date'), // 搬出时间
  isActive: boolean('is_active').default(true).notNull(), // 是否启用
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 费用表
export const expenses = mysqlTable('expenses', {
  id: serial('id').primaryKey(),
  addressId: int('address_id').notNull(), // 关联住址ID
  residentId: int('resident_id'), // 关联住户ID（可选）
  expenseType: varchar('expense_type', { length: 50 }).notNull(), // 费用类型：water(水费)、electricity(电费)、gas(燃气费)、property(物业费)、parking(停车费)
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // 费用金额
  period: varchar('period', { length: 20 }).notNull(), // 费用周期：如"2024-01"
  usage: decimal('usage', { precision: 10, scale: 3 }), // 用量（水电气的用量）
  unitPrice: decimal('unit_price', { precision: 10, scale: 4 }), // 单价
  status: varchar('status', { length: 20 }).default('unpaid').notNull(), // 状态：unpaid(未缴费)、paid(已缴费)、overdue(逾期)
  dueDate: timestamp('due_date'), // 缴费截止日期
  paidDate: timestamp('paid_date'), // 实际缴费日期
  description: text('description'), // 费用说明
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 定义关系
export const addressesRelations = relations(addresses, ({ one, many }) => ({
  parent: one(addresses, {
    fields: [addresses.parentId],
    references: [addresses.id],
    relationName: 'parent_child'
  }),
  children: many(addresses, {
    relationName: 'parent_child'
  }),
  residents: many(residents),
  expenses: many(expenses),
}));

export const residentsRelations = relations(residents, ({ one }) => ({
  address: one(addresses, {
    fields: [residents.addressId],
    references: [addresses.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  address: one(addresses, {
    fields: [expenses.addressId],
    references: [addresses.id],
  }),
  resident: one(residents, {
    fields: [expenses.residentId],
    references: [residents.id],
  }),
}));

export const dbSchema = {
  addresses,
  residents,
  expenses,
};

