import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteEmployeeRevenue,
    EmployeeRevenue,
    getUserListEmployeeRevenue,
} from "../../api/employeeRevenue";

// MUI 组件
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Stack,
    AlertColor,
} from "@mui/material";

// 格式化时间
const formatDate = (date?: string | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(date));
};

const DataEntry: React.FC = () => {
    const navigate = useNavigate();

    const [dataList, setDataList] = useState<EmployeeRevenue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 分页相关
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 用于删除确认的 Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // 用于提示成功/失败的 Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

    // 获取数据
    const fetchData = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const { data, totalPages } = await getUserListEmployeeRevenue(pageNumber, 10);
            setDataList(data);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            console.error("获取数据失败:", err);
            setError("获取数据失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // 打开确认删除对话框
    const handleDeleteClick = (id: number) => {
        setDeleteDialogOpen(true);
        setDeleteTargetId(id);
    };

    // 确认删除
    const handleDeleteConfirm = async () => {
        if (!deleteTargetId) return;
        setLoading(true);
        setDeleteDialogOpen(false);
        try {
            const success = await deleteEmployeeRevenue(deleteTargetId);
            if (success) {
                showSnackbar("✅ 删除成功！", "success");
                // 如果当前页只有一条数据且被删除，则跳转回上一页
                const newPage = dataList.length === 1 && page > 1 ? page - 1 : page;
                setPage(newPage);
                fetchData(newPage);
            } else {
                showSnackbar("❌ 删除失败，请稍后重试！", "error");
            }
        } catch (err) {
            console.error("删除出现异常:", err);
            showSnackbar("❌ 删除失败，请稍后重试！", "error");
        } finally {
            setLoading(false);
            setDeleteTargetId(null);
        }
    };

    // 取消删除
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    // 点击编辑，跳转表单
    const handleEdit = (id: number) => {
        navigate(`/data-entry/form/${id}`);
    };

    // 创建新数据
    const handleCreate = () => {
        navigate("/data-entry/form");
    };

    // 展示 Snackbar
    const showSnackbar = (message: string, severity: AlertColor) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // 关闭 Snackbar
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // 翻页
    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* 顶部标题，按钮在左侧，标题居中 */}
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                }}
            >
                <Typography variant="h5" align="center">
                    数据管理
                </Typography>
                <Box sx={{ position: "absolute", left: 0 }}>
                    <Button variant="contained" onClick={handleCreate} disabled={loading}>
                        ➕ 新增数据
                    </Button>
                </Box>
            </Box>

            {/* 加载中 */}
            {loading && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            )}

            {/* 错误提示 */}
            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 数据表格或暂无数据 */}
            {!loading && !error && dataList.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    暂无数据
                </Alert>
            ) : (
                !loading &&
                dataList.length > 0 && (
                    <Paper sx={{ mt: 2, p: 1 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>广告平台</TableCell>
                                        <TableCell>商品类别</TableCell>
                                        <TableCell>广告类型</TableCell>
                                        <TableCell>销售地区</TableCell>
                                        <TableCell>广告支出 ($)</TableCell>
                                        <TableCell>订单数量</TableCell>
                                        <TableCell>ROI</TableCell>
                                        <TableCell>记录时间</TableCell>
                                        <TableCell>备注</TableCell>
                                        <TableCell>操作</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataList.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.ad_platform}</TableCell>
                                            <TableCell>{item.product_categories}</TableCell>
                                            <TableCell>{item.ad_type}</TableCell>
                                            <TableCell>{item.region}</TableCell>
                                            <TableCell>{item.expenditure.toFixed(2)}</TableCell>
                                            <TableCell>{item.order_count}</TableCell>
                                            <TableCell>{item.roi}</TableCell>
                                            <TableCell>{formatDate(item.record_time)}</TableCell>
                                            <TableCell>{item.remark || "-"}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleEdit(item.id)}
                                                        disabled={loading}
                                                    >
                                                        编辑
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        disabled={loading}
                                                    >
                                                        删除
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )
            )}

            {/* 分页 */}
            {!loading && dataList.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}

            {/* 确认删除对话框 */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确定要删除编号为 {deleteTargetId} 的记录吗？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={loading}>
                        取消
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={loading}
                        color="error"
                        variant="contained"
                    >
                        删除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 成功/失败提示 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DataEntry;
