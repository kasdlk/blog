import api from './api';
import axios from "axios";

export interface UserProfile {
    id: number;
    username: string;
    nickname: string;
    email: string;
    avatar: string;
    bio: string;
    website: string;
    role: number;
    lastLoginAt?: string;
    status: number;
}

// 注册用户
export const registerUser = async (userData: {
    username: string;
    password: string;
    nickname: string;
    email: string;
}): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/user/register', userData);
    return response.data;
};

// 用户登录
export const loginUser = async (username: string, password: string) => {
    try {
        const response = await api.post('/user/signin', { username, password });
        if (response.data.token) {
            sessionStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || '登录失败');
        }
        throw new Error('登录请求失败');
    }
};

// 获取当前用户资料
export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/user/profile');
    return response.data;
};

// 更新当前用户资料
export const updateUser = async (
    updateData: Partial<{ nickname: string; avatar: string; bio: string; website: string }>
): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/user/profile', updateData);
    return response.data;
};

// 查询所有用户
export const getAllUsers = async (): Promise<UserProfile[]> => {
    const response = await api.get('/user/all');
    return response.data.data; // 从包装对象中取出真正的用户数组
};


// 查询所有用户（管理员权限）
export const getAdminAllUsers = async (): Promise<UserProfile[]> => {
    const response = await api.get('/user/admin/all');
    return response.data.data; // 从包装对象中取出真正的用户数组
};

// 删除用户（管理员权限）
export const deleteUser = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/user/${id}`);
        return true;
    } catch (error) {
        console.error("删除用户失败:", error);
        return false;
    }
};
// 管理员创建用户
export const createUserByAdmin = async (userData: {
    username: string;
    password: string;
    nickname: string;
    email: string;
    role: number;
}): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/user/admin/create', userData);
    return response.data;
};
// 管理员更新用户
export const updateUserByAdmin = async (
    id: number,
    userData: Partial<{
        nickname: string;
        email: string;
        role: number;
        status: number;
    }>
): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(`/user/admin/${id}`, userData);
    return response.data;
};
