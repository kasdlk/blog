import api from "./api.tsx";
import {UserProfile} from "./user.tsx";

export interface Blog {
    id: number;
    title: string;
    content: string;
    author_id: number;
    category: string;
    tags: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    nickname?: string;
}

// 博客提交表单数据结构（用于创建和更新）
export interface BlogPayload {
    title: string;
    content: string;
    category: string;
    tags?: string;
    created_at?: string;
}


// 博客目录数据结构：按年月分组
export interface BlogDirectory {
    [key: string]: Blog[];
}

// 分页获取博客列表（支持时间筛选），调用 GET /blog/paginated?page=1&date=2025-03
export interface BlogsResponse {
    data: Blog[];
    totalPages: number;
}

export const getBlogsPaginated = async (
    page: number,
    date?: string,
    userId?: number
): Promise<BlogsResponse> => {
    try {
        let url = `/blog/paginated?page=${page}`;
        if (date) {
            url += `&date=${encodeURIComponent(date)}`;
        }
        if (userId) {
            url += `&userId=${userId}`;
        }
        const response = await api.get<BlogsResponse>(url);
        return response.data;
    } catch (error) {
        console.error("获取博客分页列表失败:", error);
        return { data: [], totalPages: 1 };
    }
};


export interface BlogsResponse {
    data: Blog[];
    totalPages: number;
}

export const getBlogsUser = async (
    page: number,
    date?: string
): Promise<BlogsResponse> => {
    try {
        let url = `/blog/user?page=${page}`;
        if (date) {
            url += `&date=${encodeURIComponent(date)}`;
        }
        const response = await api.get<BlogsResponse>(url);
        return response.data;
    } catch (error) {
        console.error("获取博客分页列表失败:", error);
        return { data: [], totalPages: 1 };
    }
};




// 获取博客目录（仅返回标题和创建时间），调用 GET /blog/directory
export const getBlogDirectory = async (): Promise<BlogDirectory | null> => {
    try {
        const response = await api.get<BlogDirectory>("/blog/directory");
        return response.data;
    } catch (error) {
        console.error("获取博客目录失败:", error);
        return null;
    }
};

// 获取单个博客详情，调用 GET /blog/:id
export const getBlogDetail = async (id: number): Promise<Blog | null> => {
    try {
        const response = await api.get<Blog>(`/blog/${id}`);
        return response.data;
    } catch (error) {
        console.error("获取博客详情失败:", error);
        return null;
    }
};

// 创建博客，调用 POST /blog
export const createBlog = async (
    blog: BlogPayload
): Promise<Blog | null> => {
    try {
        const response = await api.post<Blog>("/blog", blog);
        return response.data;
    } catch (error) {
        console.error("创建博客失败:", error);
        return null;
    }
};


// 更新博客，调用 PUT /blog/:id
export const updateBlog = async (
    id: number,
    blog: Partial<BlogPayload> // 使用 Partial 支持只更新部分字段
): Promise<Blog | null> => {
    try {
        const response = await api.put<Blog>(`/blog/${id}`, blog);
        return response.data;
    } catch (error) {
        console.error("更新博客失败:", error);
        return null;
    }
};


// 删除博客，调用 DELETE /blog/:id
export const deleteBlog = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/blog/${id}`);
        return true;
    } catch (error) {
        console.error("删除博客失败:", error);
        return false;
    }
};

export interface MyBlogInfoResponse {
    blogs: Blog[];
    totalPages: number;
    directory: BlogDirectory;
    profile: UserProfile;
}

export const getMyBlogInfo = async (page: number): Promise<MyBlogInfoResponse> => {
    try {
        const response = await api.get<MyBlogInfoResponse>(`/blog/my?page=${page}`);
        return response.data;
    } catch (error) {
        console.error("获取我的博客信息失败:", error);
        return {
            blogs: [],
            totalPages: 1,
            directory: {},
            profile: {} as UserProfile,
        };
    }
};
