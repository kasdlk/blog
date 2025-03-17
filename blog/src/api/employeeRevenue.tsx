import api from "./api";

// 1) 定义详细收益记录接口：record_time 为字符串
export interface EmployeeRevenue {
    id: number;
    user_id?: number;
    nickname?: string;   // 后端生成
    avatar?: string;     // 后端生成
    ad_platform: string;
    product_categories: string;
    ad_type: string;
    region: string;
    expenditure: number;
    order_count: number;
    ad_creation_count: number; // 广告新建数量
    revenue: number;
    roi?: number;              // 后端生成
    record_time?: string;      // ★ 全程字符串
    remark?: string;
}

// 2) 新增聚合数据接口（聚合后每个员工一条记录）
export interface AggregatedEmployeeRevenue {
    user_id: number;
    nickname: string;
    avatar: string;
    total_revenue: number;
    total_expenditure: number;
    total_order_count: number;
    total_ad_creation_count: number;
    average_roi: number;
}

// 3) 传输专用的类型
export type ApiEmployeeRevenue = Omit<EmployeeRevenue, "record_time"> & {
    record_time?: string;
};

// 4) 创建/更新 DTO 同理
export type SaveEmployeeRevenueDto = Omit<ApiEmployeeRevenue, "id" | "nickname" | "roi">;
export type UpdateEmployeeRevenueDto = Partial<SaveEmployeeRevenueDto>;

// 5) 创建员工收益
export const createEmployeeRevenue = async (
    data: SaveEmployeeRevenueDto
): Promise<EmployeeRevenue> => {
    const response = await api.post<ApiEmployeeRevenue>("/employee-revenue", data);
    return response.data;
};

// 6) 获取单条记录
export const getEmployeeRevenue = async (id: number): Promise<EmployeeRevenue> => {
    const response = await api.get<ApiEmployeeRevenue>(`/employee-revenue/${id}`);
    return response.data;
};

// 7) 更新
export const updateEmployeeRevenue = async (
    id: number,
    data: UpdateEmployeeRevenueDto
): Promise<EmployeeRevenue> => {
    const response = await api.put<ApiEmployeeRevenue>(`/employee-revenue/${id}`, data);
    return response.data;
};

// 8) 删除
export const deleteEmployeeRevenue = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/employee-revenue/${id}`);
        return true;
    } catch (error) {
        console.error(`❌ 删除员工收益记录失败 (ID: ${id}):`, error);
        return false;
    }
};

// 9) 分页查询（详细记录，非聚合数据），支持筛选
export const listEmployeeRevenuePaginated = async (
    page = 1,
    limit = 10,
    startDate?: Date,
    endDate?: Date,
    userId?: number
): Promise<{ data: EmployeeRevenue[]; total: number; totalPages: number }> => {
    const params: Record<string, string | number | undefined> = {
        page,
        limit,
        startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        userId,
    };

    const response = await api.get<{
        data: EmployeeRevenue[];
        total: number;
        totalPages: number;
    }>("/employee-revenue", { params });

    return {
        data: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
    };
};

// 10) 获取聚合的用户收益列表（聚合数据）
// 当传入 userId 参数时，返回单个员工的聚合数据（数组中只有一条记录）；否则返回所有员工的聚合数据
export const listAggregatedEmployeeRevenue = async (
    startDate?: Date,
    endDate?: Date,
    userId?: number
): Promise<AggregatedEmployeeRevenue[] | null> => {
    const params: Record<string, string | number | undefined> = {
        startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        userId,
    };

    const response = await api.get<{ data: AggregatedEmployeeRevenue[] | null }>("/employee-revenue", { params });
    return response.data.data;
};

// 11) 获取用户收益列表（非聚合数据，如果需要分页查询用户的详细收益记录）
export const getUserListEmployeeRevenue = async (
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
    userId?: number
): Promise<{ data: EmployeeRevenue[]; total: number; totalPages: number }> => {
    const params: Record<string, string | number | undefined> = {
        page,
        limit,
        startDate,
        endDate,
        userId,
    };

    const response = await api.get<{
        data: EmployeeRevenue[];
        total: number;
        totalPages: number;
    }>("/employee-revenue/user/revenue", { params });

    return {
        data: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
    };
};
