import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBlog, getBlogsUser, Blog } from "../../api/blog";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    AlertColor,
    Typography,
    Paper,
    Card,
    CardContent,
    Pagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Blogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(1);

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

    const navigate = useNavigate();

    // 分页状态（当前页码）
    const [page, setPage] = useState(1);

    // 获取博客数据，支持分页
    const fetchBlogs = async (pageNumber = page) => {
        setLoading(true);
        try {
            const result = await getBlogsUser(pageNumber);
            setBlogs(result.data || []);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            console.error("获取博客列表失败:", err);
            setError("获取博客列表失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // 点击删除
    const handleDeleteClick = (id: number) => {
        setDeleteDialogOpen(true);
        setDeleteTargetId(id);
    };

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        setDeleteDialogOpen(false);
        try {
            const success = await deleteBlog(deleteTargetId);
            if (success) {
                setBlogs((prev) => prev.filter((blog) => blog.id !== deleteTargetId));
                showSnackbar("博客删除成功！", "success");
            } else {
                showSnackbar("删除失败，请稍后重试", "error");
            }
        } catch (err) {
            console.error("删除博客失败:", err);
            showSnackbar("删除博客失败，请稍后再试！", "error");
        } finally {
            setDeleteTargetId(null);
        }
    };

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    // 编辑博客
    const handleEdit = (id: number) => {
        navigate(`/blog/form/${id}`);
    };

    // 新建博客
    const handleCreate = () => {
        navigate("/blog/form");
    };

    // 展示提示
    const showSnackbar = (message: string, severity: AlertColor) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* 顶部标题及新增按钮 */}
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}
            >
                <Typography variant="h5" component="h1">
                    博客
                </Typography>
                <Box sx={{ position: "absolute", left: 0 }}>
                    <Button variant="contained" onClick={handleCreate}>
                        ➕ 新增文章
                    </Button>
                </Box>
            </Box>

            {/* 加载中 */}
            {loading && (
                <Box sx={{ textAlign: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* 错误提示 */}
            {!loading && error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* 列表 */}
            {!loading && !error && blogs.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>
                    暂无博客
                </Alert>
            ) : (
                !loading &&
                blogs.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {blogs.map((blog) => (
                            <Card
                                key={blog.id}
                                sx={{ mb: 2, position: "relative", cursor: "pointer" }}
                                onClick={() => navigate(`/blog/${blog.id}`)}
                            >
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        作者：{blog.nickname || "未知作者"}, 分类：{blog.category}, 标签：
                                        {blog.tags}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {blog.content.length > 100
                                            ? blog.content.slice(0, 100) + "..."
                                            : blog.content}
                                    </Typography>

                                    {/* 时间显示放在左下角 */}
                                    <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            创建：{new Date(blog.created_at).toLocaleString()}
                                            {blog.updated_at
                                                ? `, 更新：${new Date(blog.updated_at).toLocaleString()}`
                                                : ""}
                                        </Typography>
                                    </Box>

                                    {/* 操作按钮放在右下角，阻止点击事件冒泡 */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 8,
                                            right: 8,
                                            display: "flex",
                                            gap: 1,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(blog.id);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(blog.id);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                )
            )}

            {/* 分页控件 */}
            {!loading && blogs.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <DialogContentText>确定要删除这篇博客吗？</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="inherit">
                        取消
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        删除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar 提示 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Blogs;
