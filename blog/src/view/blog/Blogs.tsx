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
    Pagination, List,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import removeMarkdown from "remove-markdown";
// ===== MUI Date Pickers (v6+) =====
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

const Blogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(1);

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Snackbar 提示
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

    const navigate = useNavigate();

    // 分页状态（当前页码）
    const [page, setPage] = useState(1);
    // 按日期查询的日期状态（使用 Dayjs 记录）
    const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

    // 获取博客数据，支持分页及日期查询
    const fetchBlogs = async (pageNumber = page, date?: Dayjs | null) => {
        setLoading(true);
        try {
            let dateStr: string | undefined;
            if (date) {
                // 将 Dayjs 转为 JS Date，再转为 "YYYY-MM-DD" 格式（处理时区偏差）
                const jsDate = date.toDate();
                dateStr = new Date(jsDate.getTime() - jsDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
            }
            // 假设 getBlogsUser 接口支持第二个参数传入日期过滤
            const result = await getBlogsUser(pageNumber, dateStr);
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

    // 每当页码或日期变化时重新查询
    useEffect(() => {
        fetchBlogs(page, filterDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterDate]);

    // 点击查询按钮：重置页码并查询
    const handleQueryByDate = () => {
        setPage(1);
        fetchBlogs(1, filterDate);
    };

    // 重置日期筛选
    const handleResetDateFilter = () => {
        setFilterDate(null);
        setPage(1);
        fetchBlogs(1, null);
    };

    // 删除相关操作
    const handleDeleteClick = (id: number) => {
        setDeleteDialogOpen(true);
        setDeleteTargetId(id);
    };

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

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    // 编辑、新建博客
    const handleEdit = (id: number) => {
        navigate(`/blog/form/${id}`);
    };

    const handleCreate = () => {
        navigate("/blog/form");
    };

    // Snackbar 提示相关
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

            {/* 日期筛选区域 */}
            <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body1">按日期查询:</Typography>
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
                </Box>
            </Paper>

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
                    <List>
                        {blogs.map((blog) => (
                            <Card
                                key={blog.id}
                                sx={{ mb: 2,
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "scale(1.02)" },

                            }}
                                onClick={() => navigate(`/blog/${blog.id}`)}
                            >
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        作者：{blog.nickname || "未知作者"}，分类：{blog.category}，标签：
                                        {blog.tags}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>
                                        {removeMarkdown(blog.content).slice(0, 100)}...
                                    </Typography>

                                    {/* 时间显示放在左下角 */}
                                    <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            创建：{new Date(blog.created_at).toLocaleString()}
                                            {blog.updated_at
                                                ? `，更新：${new Date(blog.updated_at).toLocaleString()}`
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
                    </List>
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
