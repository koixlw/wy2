// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 成功响应
export function ok<T>(data: T, code: number = 200, msg: string = '操作成功'): ApiResponse<T> {
  return {
    code,
    msg,
    data
  };
}

// 错误响应
export function error(msg: string, code: number = 400, data: any = null): ApiResponse {
  return {
    code,
    msg,
    data
  };
}

// 分页响应数据结构
export interface PaginationData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 创建分页响应
export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  msg: string = '获取成功'
): ApiResponse<PaginationData<T>> {
  const totalPages = Math.ceil(total / limit);

  return ok({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  }, 200, msg);
}