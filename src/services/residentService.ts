import { db } from '@/db';
import { eq, like, and, desc } from 'drizzle-orm';
import { ResidentQueryParams, ResidentCreateBody, ResidentUpdateBody } from '@/type/resident.type';
import { addresses, residents } from '@/db/schema';

// 类型别名
type CreateResidentData = ResidentCreateBody;
type UpdateResidentData = ResidentUpdateBody;

export abstract class ResidentService {
  // 获取所有住户（分页）
  static async getAllResidents(query: ResidentQueryParams) {
    try {
      const { search, addressId, residentType, isActive, page = '1', limit = '10' } = query;

      // 构建查询条件
      const conditions = [];

      if (search) {
        conditions.push(like(residents.name, `%${search}%`));
      }

      if (addressId) {
        conditions.push(eq(residents.addressId, Number(addressId)));
      }

      if (residentType) {
        conditions.push(eq(residents.residentType, residentType));
      }

      if (isActive !== undefined) {
        conditions.push(eq(residents.isActive, isActive === 'true'));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 计算分页
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * limitNum;

      // 查询数据（关联住址信息）
      const [residentsList, totalResult] = await Promise.all([
        db.select({
          id: residents.id,
          name: residents.name,
          phone: residents.phone,
          idCard: residents.idCard,
          addressId: residents.addressId,
          residentType: residents.residentType,
          moveInDate: residents.moveInDate,
          moveOutDate: residents.moveOutDate,
          isActive: residents.isActive,
          createdAt: residents.createdAt,
          updatedAt: residents.updatedAt,
          address: {
            id: addresses.id,
            name: addresses.name,
            type: addresses.type,
            code: addresses.code
          }
        })
          .from(residents)
          .leftJoin(addresses, eq(residents.addressId, addresses.id))
          .where(whereClause)
          .orderBy(desc(residents.createdAt))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: residents.id })
          .from(residents)
          .where(whereClause)
      ]);

      const total = totalResult.length;
      const totalPages = Math.ceil(total / limitNum);

      // 转换日期字段为字符串
      const formattedResidentsList = residentsList.map(resident => ({
        ...resident,
        moveInDate: resident.moveInDate ? resident.moveInDate.toISOString() : null,
        moveOutDate: resident.moveOutDate ? resident.moveOutDate.toISOString() : null,
        createdAt: resident.createdAt.toISOString(),
        updatedAt: resident.updatedAt ? resident.updatedAt.toISOString() : null
      }));

      return {
        items: formattedResidentsList,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取住户列表出错:', error);
      throw new Error('获取住户列表失败');
    }
  }

  // 根据ID获取住户
  static async getResidentById(id: number) {
    try {
      const resident = await db.select({
        id: residents.id,
        name: residents.name,
        phone: residents.phone,
        idCard: residents.idCard,
        addressId: residents.addressId,
        residentType: residents.residentType,
        moveInDate: residents.moveInDate,
        moveOutDate: residents.moveOutDate,
        isActive: residents.isActive,
        createdAt: residents.createdAt,
        updatedAt: residents.updatedAt,
        address: {
          id: addresses.id,
          name: addresses.name,
          type: addresses.type,
          code: addresses.code
        }
      })
        .from(residents)
        .leftJoin(addresses, eq(residents.addressId, addresses.id))
        .where(eq(residents.id, id))
        .limit(1);

      if (resident.length === 0) {
        throw new Error('住户不存在');
      }

      // 转换日期字段为字符串
      const formattedResident = {
        ...resident[0],
        moveInDate: resident[0].moveInDate ? resident[0].moveInDate.toISOString() : null,
        moveOutDate: resident[0].moveOutDate ? resident[0].moveOutDate.toISOString() : null,
        createdAt: resident[0].createdAt.toISOString(),
        updatedAt: resident[0].updatedAt ? resident[0].updatedAt.toISOString() : null
      };

      return formattedResident;
    } catch (error) {
      console.error('获取住户详情出错:', error);
      throw new Error('获取住户详情失败');
    }
  }

  // 根据住址获取住户列表
  static async getResidentsByAddress(addressId: number) {
    try {
      const residentsList = await db.select({
        id: residents.id,
        name: residents.name,
        phone: residents.phone,
        idCard: residents.idCard,
        addressId: residents.addressId,
        residentType: residents.residentType,
        moveInDate: residents.moveInDate,
        moveOutDate: residents.moveOutDate,
        isActive: residents.isActive,
        createdAt: residents.createdAt,
        updatedAt: residents.updatedAt,
        address: {
          id: addresses.id,
          name: addresses.name,
          type: addresses.type,
          code: addresses.code
        }
      })
        .from(residents)
        .leftJoin(addresses, eq(residents.addressId, addresses.id))
        .where(and(
          eq(residents.addressId, addressId),
          eq(residents.isActive, true)
        ))
        .orderBy(residents.name);

      // 转换日期字段为字符串
      const formattedResidentsList = residentsList.map(resident => ({
        ...resident,
        moveInDate: resident.moveInDate ? resident.moveInDate.toISOString() : null,
        moveOutDate: resident.moveOutDate ? resident.moveOutDate.toISOString() : null,
        createdAt: resident.createdAt.toISOString(),
        updatedAt: resident.updatedAt ? resident.updatedAt.toISOString() : null
      }));

      return formattedResidentsList;
    } catch (error) {
      console.error('获取住址住户出错:', error);
      throw new Error('获取住址住户失败');
    }
  }

  // 创建住户
  static async createResident(data: CreateResidentData) {
    try {
      // 验证住址是否存在
      const address = await db.select()
        .from(addresses)
        .where(eq(addresses.id, data.addressId))
        .limit(1);

      if (address.length === 0) {
        throw new Error('住址不存在');
      }

      // 验证住址类型是否为房间
      if (address[0].type !== 'room') {
        throw new Error('只能在房间类型的住址下添加住户');
      }

      // 处理日期字段
      const insertData: any = {
        ...data,
        isActive: true
      };

      if (data.moveInDate) {
        insertData.moveInDate = new Date(data.moveInDate);
      }

      const result = await db.insert(residents)
        .values(insertData);

      // 获取创建的住户
      const newResident = await this.getResidentById(Number(result[0].insertId));

      return newResident;
    } catch (error) {
      console.error('创建住户出错:', error);
      throw new Error('创建住户失败');
    }
  }

  // 更新住户
  static async updateResident(id: number, data: UpdateResidentData) {
    try {
      // 验证住户是否存在
      await this.getResidentById(id);

      // 验证住址是否存在（如果要更新住址）
      if (data.addressId) {
        const address = await db.select()
          .from(addresses)
          .where(eq(addresses.id, data.addressId))
          .limit(1);

        if (address.length === 0) {
          throw new Error('住址不存在');
        }

        if (address[0].type !== 'room') {
          throw new Error('只能在房间类型的住址下添加住户');
        }
      }

      // 处理日期字段
      const updateData: any = { ...data };

      if (data.moveInDate) {
        updateData.moveInDate = new Date(data.moveInDate);
      }

      await db.update(residents)
        .set(updateData)
        .where(eq(residents.id, id));

      // 返回更新后的住户
      return await this.getResidentById(id);
    } catch (error) {
      console.error('更新住户出错:', error);
      throw new Error('更新住户失败');
    }
  }

  // 住户搬出
  static async moveOutResident(id: number) {
    try {
      // 验证住户是否存在
      const resident = await this.getResidentById(id);

      if (resident.moveOutDate) {
        throw new Error('住户已经搬出');
      }

      await db.update(residents)
        .set({
          moveOutDate: new Date(),
          isActive: false
        })
        .where(eq(residents.id, id));

      // 返回更新后的住户
      return await this.getResidentById(id);
    } catch (error) {
      console.error('住户搬出出错:', error);
      throw new Error('住户搬出失败');
    }
  }

  // 删除住户
  static async deleteResident(id: number) {
    try {
      // 验证住户是否存在
      await this.getResidentById(id);

      // 软删除：设置为不活跃状态
      await db.update(residents)
        .set({ isActive: false })
        .where(eq(residents.id, id));

      return true;
    } catch (error) {
      console.error('删除住户出错:', error);
      throw new Error('删除住户失败');
    }
  }
}