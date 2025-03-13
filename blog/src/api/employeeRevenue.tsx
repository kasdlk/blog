import api from "./api";

// 1) 定义接口：record_time 就是字符串
export interface EmployeeRevenue {
    id: number;
    user_id?: number;
    nickname?: string;   // 后端生成
    avatar?: string;   // 后端生成
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

// 2) 在你希望“传输专用”的类型里，也让 record_time 是可选字符串
export type ApiEmployeeRevenue = Omit<EmployeeRevenue, "record_time"> & {
    record_time?: string;
};

// 3) 创建/更新 DTO 同理
export type SaveEmployeeRevenueDto = Omit<ApiEmployeeRevenue, "id" | "nickname" | "roi">;
export type UpdateEmployeeRevenueDto = Partial<SaveEmployeeRevenueDto>;

// ----- 核心：去掉所有 new Date() / toISOString() 转换函数 -----
// 我们不需要 convertFromApiFormat 或 formatRecordTime 了，如果只想保持字符串
// 当然，如果你想保留一些功能，也可以做最小改动——看后文示例

// 4) 创建员工收益
export const createEmployeeRevenue = async (
    data: SaveEmployeeRevenueDto
): Promise<EmployeeRevenue> => {
    // 后端返回的 record_time 也会是 string
    const response = await api.post<ApiEmployeeRevenue>("/employee-revenue", data);
    return response.data;  // 直接返回
};

// 5) 获取单条记录
export const getEmployeeRevenue = async (id: number): Promise<EmployeeRevenue> => {
    const response = await api.get<ApiEmployeeRevenue>(`/employee-revenue/${id}`);
    return response.data; // 直接返回
};

// 6) 更新
export const updateEmployeeRevenue = async (
    id: number,
    data: UpdateEmployeeRevenueDto
): Promise<EmployeeRevenue> => {
    const response = await api.put<ApiEmployeeRevenue>(`/employee-revenue/${id}`, data);
    return response.data;
};

// 7) 删除
export const deleteEmployeeRevenue = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/employee-revenue/${id}`);
        return true;
    } catch (error) {
        console.error(`❌ 删除员工收益记录失败 (ID: ${id}):`, error);
        return false;
    }
};

// 8) 分页查询（支持筛选）
// 如果后端返回 record_time 一定是字符串，就直接返回即可
export const listEmployeeRevenue = async (
    page = 1,
    limit = 10,
    startDate?: Date | undefined,
    endDate?: Date | undefined,
    userId?: number | undefined
): Promise<{ data: EmployeeRevenue[]; total: number; totalPages: number }> => {
    // 将 Date 转换为字符串（ISO 格式）
    const params: Record<string, string | number | undefined> = {
        page,
        limit,
        startDate: startDate ? startDate.toISOString() : undefined, // 👈 转换成字符串
        endDate: endDate ? endDate.toISOString() : undefined,       // 👈 转换成字符串
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


// 9) 获取用户收益列表
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
