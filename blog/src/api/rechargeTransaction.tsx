import api from './api';

export interface RechargeTransaction {
    id: number;
    user_id: number;
    order_number: string;
    amount: number;
    payment_method: string;
    status: string;
    transaction_time: string;
    remark: string;
    created_at: string;
    updated_at: string;
}

// 创建充值流水记录
export const createRechargeTransaction = async (
    data: Omit<RechargeTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<RechargeTransaction> => {
    const response = await api.post<RechargeTransaction>('/recharge-transaction', data);
    return response.data;
};

// 获取单条充值流水记录
export const getRechargeTransaction = async (id: number): Promise<RechargeTransaction> => {
    const response = await api.get<RechargeTransaction>(`/recharge-transaction/${id}`);
    return response.data;
};

// 更新充值流水记录
export const updateRechargeTransaction = async (
    id: number,
    updateData: Partial<RechargeTransaction>
): Promise<RechargeTransaction> => {
    const response = await api.put<RechargeTransaction>(`/recharge-transaction/${id}`, updateData);
    return response.data;
};

// 删除充值流水记录
export const deleteRechargeTransaction = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/recharge-transaction/${id}`);
        return true;
    } catch (error) {
        console.error("删除充值流水记录失败:", error);
        return false;
    }
};

// 分页查询充值流水记录
export const listRechargeTransactions = async (page = 1, limit = 10): Promise<RechargeTransaction[]> => {
    const response = await api.get<RechargeTransaction[]>(`/recharge-transaction?page=${page}&limit=${limit}`);
    return response.data;
};
