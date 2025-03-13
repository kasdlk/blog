import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogsPaginated, Blog } from "../../api/blog";

// ===== MUI =====
import {
    Container,
    Typography,
    Stack,
    Button,
    Box,
    CircularProgress,
    Alert,
    List,
    Card,
    CardContent,
    Pagination,
} from "@mui/material";

// ===== MUI Date Pickers (v6+) =====
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

// 定义接口返回类型（参考前端 API 文件中的定义）
export interface BlogsResponse {
    data: Blog[];
    totalPages: number;
}

const BlogManagement: React.FC = () => {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // 使用 Dayjs 记录选中日期
    const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

    // 分页状态（当前页码、总页数）
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 获取博客数据（始终调用分页接口）
    const fetchBlogs = async (pageNumber = page, date?: Dayjs | null) => {
        setLoading(true);
        try {
            let dateStr: string | undefined;
            if (date) {
                // 将 Dayjs 转成 JS Date，再转成 "YYYY-MM-DD"
                const jsDate = date.toDate();
                dateStr = new Date(jsDate.getTime() - jsDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
            }
            const response: BlogsResponse = await getBlogsPaginated(pageNumber, dateStr);
            const blogsData = response.data || [];
            setBlogs(blogsData);
            setTotalPages(response.totalPages);
            setError("");
        } catch (err) {
            console.error("获取博客分页列表失败:", err);
            setBlogs([]);
            setError("获取博客分页列表失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(page, filterDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterDate]);

    // 点击查询时重置页码
    const handleQueryByDate = () => {
        setPage(1);
        fetchBlogs(1, filterDate);
    };

    // 点击重置时，清空筛选并重置分页
    const handleResetDateFilter = () => {
        setFilterDate(null);
        setPage(1);
        fetchBlogs(1, null);
    };

    // 点击预览
    const handlePreview = (id: number | undefined) => {
        if (id && !isNaN(Number(id))) {
            navigate(`/blog/${id}`);
        } else {
            console.error("Invalid blog ID:", id);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                博客管理
            </Typography>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems="center"
                    >
                        <Typography variant="body1">按天查询:</Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="选择日期"
                                value={filterDate}
                                onChange={(newValue) => setFilterDate(newValue)}
                                format="YYYY-MM-DD"
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        sx: { minWidth: 150 },
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        <Button variant="contained" onClick={handleQueryByDate}>
                            查询
                        </Button>
                        <Button variant="outlined" onClick={handleResetDateFilter}>
                            重置
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {loading && (
                <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    博客列表
                </Typography>

                {blogs.length === 0 && !loading ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        暂无数据
                    </Alert>
                ) : (
                    <List sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 1 }}>
                        {blogs.map((blog) => (
                            <Card key={blog.id} sx={{ mb: 2, boxShadow: 2 }}>
                                <CardContent
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                    }}
                                >
                                    <Typography variant="h6" component="div">
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        作者：{blog.nickname || "未知作者"}, 分类：{blog.category}, 标签：{blog.tags}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {blog.content.length > 100
                                            ? blog.content.slice(0, 100) + "..."
                                            : blog.content}
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            创建：{new Date(blog.created_at).toLocaleString()}
                                            {blog.updated_at
                                                ? `, 更新：${new Date(blog.updated_at).toLocaleString()}`
                                                : ""}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handlePreview(blog.id)}
                                        >
                                            预览
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>
                )}
            </Box>

            {/* 分页控件始终显示 */}
            {!loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );
};

export default BlogManagement;
