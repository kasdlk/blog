
import api from './api';

export interface Comment {
    id: number;
    blog_id: number;
    user_id: number;
    nickname: string;
    content: string;
    parent_id?: number;
    created_at: string;
    updated_at: string;

}

// 创建留言
export const createComment = async (commentData: {
    blog_id: number;
    user_id: number;
    content: string;
    parent_id?: number;
}): Promise<Comment> => {
    const response = await api.post<Comment>('/comment', commentData);
    return response.data;
};

// 获取单个留言
export const getComment = async (id: number): Promise<Comment> => {
    const response = await api.get<Comment>(`/comment/${id}`);
    return response.data;
};

// 更新留言
export const updateComment = async (
    id: number,
    updateData: Partial<{ content: string; parent_id?: number }>
): Promise<Comment> => {
    const response = await api.put<Comment>(`/comment/${id}`, updateData);
    return response.data;
};

// 删除留言
export const deleteComment = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/comment/${id}`);
        return true;
    } catch (error) {
        console.error("删除留言失败:", error);
        return false;
    }
};

// 分页查询所有留言
export const listComments = async (page = 1, limit = 10): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comment?page=${page}&limit=${limit}`);
    return response.data;
};

// 根据博客ID查询留言（支持分页）
export const listCommentsByBlog = async (
    blog_id: number,
    page = 1,
    limit = 10
): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comment/blog/${blog_id}?page=${page}&limit=${limit}`);
    return response.data;
};

export interface CommentsResponse {
    data: Comment[];
    totalPages: number;
}
// 如果后端返回直接就是数组
export const getCommentsByBlog = async (blogId: number, page: number = 1): Promise<Comment[]> => {
    try {
        const response = await api.get<Comment[]>(`/comment/blog/${blogId}?page=${page}`);
        return response.data;
    } catch (error) {
        console.error("获取评论失败", error);
        throw error;
    }
};
