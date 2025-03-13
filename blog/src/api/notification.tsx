
import api from './api';

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    content: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// 创建通知
export const createNotification = async (
    notificationData: { user_id: number; type: string; content: string; status?: string }
): Promise<Notification> => {
    const response = await api.post<Notification>('/notification', notificationData);
    return response.data;
};

// 获取单个通知
export const getNotification = async (id: number): Promise<Notification> => {
    const response = await api.get<Notification>(`/notification/${id}`);
    return response.data;
};

// 更新通知
export const updateNotification = async (
    id: number,
    updateData: Partial<{ type: string; content: string; status: string }>
): Promise<Notification> => {
    const response = await api.put<Notification>(`/notification/${id}`, updateData);
    return response.data;
};

// 删除通知
export const deleteNotification = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/notification/${id}`);
        return true;
    } catch (error) {
        console.error("删除通知失败:", error);
        return false;
    }
};

// 分页查询通知
export const listNotifications = async (page = 1, limit = 10): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(`/notification?page=${page}&limit=${limit}`);
    return response.data;
};
