
import { eq, like, and, isNull, desc, sql } from 'drizzle-orm';
import { AddressCreateBody, AddressQueryParams, AddressUpdateBody } from '@/type/address.type';
import { addresses } from '@/db/schema';
import { db } from '@/db';




// 树形节点接口
interface AddressTreeNode {
  id: number;
  name: string;
  type: string;
  parentId?: number | null;
  code?: string | null;
  description?: string | null;
  area?: string | null;
  isActive: boolean;
  children?: AddressTreeNode[];
}

export abstract class AddressService {
  // 获取所有住址（分页）
  static async getAllAddresses(query: AddressQueryParams) {
    try {

      const { search, type, parentId, isActive, page = 1, limit = 10 } = query;

      // 构建查询条件
      const conditions = [];

      if (search) {
        conditions.push(like(addresses.name, `%${search}%`));
      }

      if (type) {
        conditions.push(eq(addresses.type, type));
      }

      if (parentId) {
        if (parentId === 0) {
          conditions.push(isNull(addresses.parentId));
        } else {
          conditions.push(eq(addresses.parentId, Number(parentId)));
        }
      }

      if (isActive !== undefined) {
        conditions.push(eq(addresses.isActive, isActive === true));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 计算分页
      const offset = (page - 1) * limit;

      // 查询数据
      const [addressesList, totalResult] = await Promise.all([
        db.select()
          .from(addresses)
          .where(whereClause)
          .orderBy(desc(addresses.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql`count(*)` })
          .from(addresses)
          .where(whereClause)
      ]);

      const total = Number(totalResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      return {
        items: addressesList,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取住址列表出错:', error);
      throw new Error('获取住址列表失败');
    }
  }

  // 获取住址树形结构
  static async getAddressTree(query: { type?: string; parentId?: number }) {
    try {

      const { type, parentId } = query;

      // 构建查询条件
      const conditions = [eq(addresses.isActive, true)];

      if (type) {
        conditions.push(eq(addresses.type, type));
      }

      if (parentId) {
        if (parentId === 0) {
          conditions.push(isNull(addresses.parentId));
        } else {
          conditions.push(eq(addresses.parentId, Number(parentId)));
        }
      } else {
        // 如果没有指定parentId，默认获取根节点
        conditions.push(isNull(addresses.parentId));
      }

      // 获取所有符合条件的住址
      const allAddresses = await db.select()
        .from(addresses)
        .where(and(...conditions))
        .orderBy(addresses.name);

      // 如果需要构建完整树形结构
      if (!parentId || parentId === 0) {
        return await this.buildAddressTree(allAddresses);
      }

      return allAddresses;
    } catch (error) {
      console.error('获取住址树形结构出错:', error);
      throw new Error('获取住址树形结构失败');
    }
  }

  // 构建树形结构
  private static async buildAddressTree(rootNodes: any[]): Promise<AddressTreeNode[]> {

    const tree: AddressTreeNode[] = [];

    for (const node of rootNodes) {
      const treeNode: AddressTreeNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        parentId: node.parentId,
        code: node.code,
        description: node.description,
        area: node.area,
        isActive: node.isActive,
        children: []
      };

      // 递归获取子节点
      const children = await db.select()
        .from(addresses)
        .where(and(
          eq(addresses.parentId, node.id),
          eq(addresses.isActive, true)
        ))
        .orderBy(addresses.name);

      if (children.length > 0) {
        treeNode.children = await this.buildAddressTree(children);
      }

      tree.push(treeNode);
    }

    return tree;
  }

  // 根据ID获取住址
  static async getAddressById(id: number) {
    try {

      const address = await db.select()
        .from(addresses)
        .where(eq(addresses.id, id))
        .limit(1);

      if (address.length === 0) {
        throw new Error('住址不存在');
      }

      return address[0];
    } catch (error) {
      console.error('获取住址详情出错:', error);
      throw new Error('获取住址详情失败');
    }
  }

  // 创建住址
  static async createAddress(data: AddressCreateBody) {
    try {

      // 验证父级住址是否存在
      if (data.parentId) {
        const parentAddress = await db.select()
          .from(addresses)
          .where(eq(addresses.id, data.parentId))
          .limit(1);

        if (parentAddress.length === 0) {
          throw new Error('父级住址不存在');
        }
      }

      const result = await db.insert(addresses)
        .values({
          ...data,
          isActive: true
        });

      // 获取创建的住址
      const newAddress = await this.getAddressById(Number(result[0].insertId));

      return newAddress;
    } catch (error) {
      console.error('创建住址出错:', error);
      throw new Error('创建住址失败');
    }
  }

  // 更新住址
  static async updateAddress(id: number, data: AddressUpdateBody) {
    try {

      // 验证住址是否存在
      await this.getAddressById(id);

      // 验证父级住址是否存在
      if (data.parentId) {
        const parentAddress = await db.select()
          .from(addresses)
          .where(eq(addresses.id, data.parentId))
          .limit(1);

        if (parentAddress.length === 0) {
          throw new Error('父级住址不存在');
        }

        // 防止循环引用
        if (data.parentId === id) {
          throw new Error('不能将自己设置为父级');
        }
      }

      await db.update(addresses)
        .set(data)
        .where(eq(addresses.id, id));

      // 返回更新后的住址
      return await this.getAddressById(id);
    } catch (error) {
      console.error('更新住址出错:', error);
      throw new Error('更新住址失败');
    }
  }

  // 删除住址
  static async deleteAddress(id: number) {
    try {

      // 验证住址是否存在
      await this.getAddressById(id);

      // 检查是否有子住址
      const children = await db.select()
        .from(addresses)
        .where(eq(addresses.parentId, id))
        .limit(1);

      if (children.length > 0) {
        throw new Error('该住址下还有子住址，无法删除');
      }

      // 软删除：设置为不活跃状态
      await db.update(addresses)
        .set({ isActive: false })
        .where(eq(addresses.id, id));

      return true;
    } catch (error) {
      console.error('删除住址出错:', error);
      throw new Error('删除住址失败');
    }
  }
}