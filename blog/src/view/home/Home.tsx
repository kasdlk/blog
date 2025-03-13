import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import removeMarkdown from "remove-markdown";
import {
    getMyBlogInfo,
    MyBlogInfoResponse,
    Blog,
    BlogDirectory,
} from "../../api/blog";
import { UserProfile } from "../../api/user";
import {
    Container,
    Grid,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Paper,
    Stack,
} from "@mui/material";

const Home: React.FC = () => {
    const navigate = useNavigate();

    // 状态管理
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [directory, setDirectory] = useState<BlogDirectory>({});
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // 合并接口获取数据
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result: MyBlogInfoResponse = await getMyBlogInfo(page);
            if (page === 1) {
                setBlogs(result.blogs || []);
                setDirectory(result.directory || {});
                setProfile(result.profile);
            } else {
                // 追加不重复的博客
                setBlogs(prev => {
                    const existingIDs = new Set(prev.map(item => item.id));
                    const newData = (result.blogs || []).filter(item => !existingIDs.has(item.id));
                    return [...prev, ...newData];
                });
            }
            setTotalPages(result.totalPages);
            setError("");
        } catch (err) {
            console.error("获取我的博客信息失败:", err);
            setError("获取我的博客信息失败");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* 文章列表区域 */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                            最新文章
                        </Typography>
                        {blogs.map(blog => (
                            <Card
                                key={blog.id}
                                sx={{
                                    mb: 2,
                                    cursor: "pointer",
                                    border: "1px solid #f0f0f0",
                                    borderRadius: 2,
                                    "&:hover": { boxShadow: 3 },
                                }}
                                onClick={() => navigate(`/blog/${blog.id}`)}
                                variant="outlined"
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>
                                        {removeMarkdown(blog.content).slice(0, 100)}...
                                    </Typography>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="caption" color="text.secondary">
                                                分类：{blog.category}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                标签：{blog.tags}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                状态：{blog.status}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                        {loading && (
                            <Typography align="center" sx={{ mt: 2 }}>
                                加载中...
                            </Typography>
                        )}
                        {page < totalPages && !loading && (
                            <Box sx={{ textAlign: "center", mt: 2 }}>
                                <Button variant="outlined" onClick={() => setPage(prev => prev + 1)}>
                                    加载更多
                                </Button>
                            </Box>
                        )}
                        {page >= totalPages && !loading && (
                            <Typography align="center" sx={{ mt: 2 }}>
                                没有更多内容
                            </Typography>
                        )}
                        {error && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                    </Paper>
                </Grid>

                {/* 侧边栏：博主信息和目录 */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 2, textAlign: "center", backgroundColor: "#fff" }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            博主
                        </Typography>
                        {profile ? (
                            <>
                                <Avatar
                                    src={profile.avatar}
                                    alt="头像"
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        margin: "0 auto 12px",
                                        border: "2px solid #3498db",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                                    }}
                                />
                                <Typography variant="body2">
                                    <strong>昵称: </strong>
                                    {profile.nickname}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>邮箱: </strong>
                                    {profile.email}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>个签: </strong>
                                    {profile.bio}
                                </Typography>
                            </>
                        ) : (
                            <Typography>加载中...</Typography>
                        )}
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: "#fff" }}>
                        <Typography variant="h6" sx={{ mb: 2, borderBottom: "1px solid #eee", pb: 1 }}>
                            博客目录
                        </Typography>
                        {Object.keys(directory).length > 0 ? (
                            Object.keys(directory).map(month => (
                                <Box key={month} sx={{ mb: 2, p: 1, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: "#3498db", cursor: "pointer" }}
                                        onClick={() => navigate(`/blog?month=${month}`)}
                                    >
                                        {month}
                                    </Typography>
                                    {directory[month].map(item => (
                                        <Typography
                                            key={item.id}
                                            variant="body2"
                                            sx={{ cursor: "pointer", pl: 2, py: 0.5, borderBottom: "1px dashed #ddd" }}
                                            onClick={() => navigate(`/blog/${item.id}`)}
                                        >
                                            {item.title}
                                        </Typography>
                                    ))}
                                </Box>
                            ))
                        ) : (
                            <Typography>暂无目录数据</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
