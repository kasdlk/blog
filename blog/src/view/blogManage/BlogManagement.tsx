import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogsPaginated, Blog } from "../../api/blog";

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
    Pagination, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";

// ===== MUI Date Pickers (v6+) =====
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import removeMarkdown from "remove-markdown";
import { getAllUsers, UserProfile } from "../../api/user";

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
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userList, setUserList] = useState<UserProfile[]>([]);

    // 获取博客数据（始终调用分页接口）
    const fetchBlogs = async (pageNumber = page, date?: Dayjs | null) => {
        setLoading(true);
        try {
            let dateStr: string | undefined;
            if (date) {
                const jsDate = date.toDate();
                dateStr = new Date(jsDate.getTime() - jsDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
            }

            // 这里加上 selectedUserId
            const response: BlogsResponse = await getBlogsPaginated(pageNumber, dateStr, selectedUserId || undefined);
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
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await getAllUsers();
                setUserList(users);
            } catch (err) {
                console.error("获取用户失败:", err);
            }
        };
        fetchUsers();
    }, []);

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
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>员工</InputLabel>
                            <Select
                                value={selectedUserId || ""}
                                label="员工"
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setSelectedUserId(val || null);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="">全部</MenuItem>
                                {userList.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.nickname}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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

            <Box sx={{ mt: 4, mx: "auto", maxWidth: 800, px: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    所有博客
                </Typography>

                {blogs.length === 0 && !loading ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        暂无数据
                    </Alert>
                ) : (
                    <List sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2 }}>
                        {blogs.map((blog) => (
                            <Card
                                key={blog.id}
                                sx={{
                                    mb: 3,
                                    boxShadow: 3,
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "scale(1.02)" },
                                }}
                            >
                                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        作者：
                                        <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                                        {blog.nickname || "未知作者"}
                                        </span>
                                        {" | "}
                                        分类：{blog.category} | 标签：{blog.tags}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            WebkitLineClamp: 1,
                                        }}
                                    >
                                        {removeMarkdown(blog.content).slice(0, 100)}...
                                    </Typography>

                                    <Box sx={{ flexGrow: 1 }} />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: 2,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            创建：{new Date(blog.created_at).toLocaleString()}
                                            {blog.updated_at
                                                ? `, 更新：${new Date(blog.updated_at).toLocaleString()}`
                                                : ""}
                                        </Typography>
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
