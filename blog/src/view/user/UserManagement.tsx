import React, { useEffect, useState, ChangeEvent } from "react";
import {
    deleteUser,
    createUserByAdmin,
    updateUserByAdmin,
    UserProfile, getAdminAllUsers,
} from "../../api/user";

// MUI 组件
import {
    Container,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    CircularProgress,
    Alert,
    Stack,
    Snackbar,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// 定义表单数据类型，允许包含 password 字段（仅在创建时使用）
interface UserFormData extends Partial<UserProfile> {
    password?: string;
}

const ROLE_OPTIONS = [
    { value: 1, label: "管理员" },
    { value: 2, label: "财务" },
    { value: 3, label: "投手" },
    { value: 4, label: "普通用户" },
];

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);

    // 表单数据
    const [formData, setFormData] = useState<UserFormData>({ role: 4 });
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    // 拉取用户列表
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAdminAllUsers();
            setUsers(data);
            setError("");
        } catch (err) {
            console.error("获取用户列表失败:", err);
            setError("获取用户列表失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 删除用户
    const handleDelete = async (id: number) => {
        if (window.confirm("确定删除该用户吗？")) {
            try {
                const success = await deleteUser(id);
                if (success) {
                    setSnackbarMessage("删除成功");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                    fetchUsers();
                } else {
                    setSnackbarMessage("删除失败，请稍后重试");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                }
            } catch (err) {
                console.error(err);
                setSnackbarMessage("删除失败，请稍后重试");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        }
    };

    // 点击“编辑”按钮
    const handleEdit = (user: UserProfile) => {
        setEditingUser(user);
        setIsAdding(false);
        setFormData(user);
    };

    // 点击“新增用户”按钮
    const handleAdd = () => {
        setIsAdding(true);
        setEditingUser(null);
        setFormData({ role: 4 });
    };

    // 取消编辑/新增
    const handleCancel = () => {
        setEditingUser(null);
        setIsAdding(false);
        setFormData({ role: 4 });
    };

    // 处理 TextField、Textarea 的 onChange 事件
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 单独处理 MUI Select 的 onChange 事件
    const handleSelectChange = (event: SelectChangeEvent<number>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: Number(value),
        }));
    };

    // 提交表单（包含密码重置逻辑）
    const handleSubmit = async () => {
        if (!formData.username || !formData.nickname || !formData.email) {
            setSnackbarMessage("请填写用户名、昵称、邮箱等必填信息");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            if (isAdding) {
                if (!formData.password) {
                    setSnackbarMessage("密码不能为空");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                    return;
                }
                const newUser = await createUserByAdmin({
                    username: formData.username,
                    password: formData.password,
                    nickname: formData.nickname,
                    email: formData.email,
                    role: formData.role || 4,
                });
                if (newUser && newUser.id) {
                    setUsers((prev) => [...prev, newUser]);
                    setSnackbarMessage("新增用户成功");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                } else {
                    fetchUsers();
                }
            } else if (editingUser) {
                // 只在需要重置密码时才传密码
                const updateData: Partial<UserProfile & { password?: string }> = {
                    nickname: formData.nickname,
                    email: formData.email,
                    status: Number(formData.status) || 1,
                    role: formData.role || 4,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                const updatedUser = await updateUserByAdmin(editingUser.id, updateData);
                setUsers((prev) =>
                    prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
                );
                setSnackbarMessage("更新成功");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
            }
            handleCancel();
        } catch (err) {
            console.error("提交失败:", err);
            setSnackbarMessage("提交失败，请稍后重试");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                用户管理
            </Typography>

            {/* 顶部按钮 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" onClick={handleAdd}>
                    新增用户
                </Button>
            </Box>

            {/* 新增/编辑表单 */}
            {(isAdding || editingUser) && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {isAdding ? "新增用户" : "编辑用户"}
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="用户名"
                                name="username"
                                value={formData.username || ""}
                                onChange={handleInputChange}
                                disabled={!isAdding}
                                fullWidth
                            />
                            <TextField
                                label={isAdding ? "密码" : "重置密码（可选）"}
                                type="password"
                                name="password"
                                value={formData.password || ""}
                                onChange={handleInputChange}
                                fullWidth
                            />
                            <TextField
                                label="昵称"
                                name="nickname"
                                value={formData.nickname || ""}
                                onChange={handleInputChange}
                                fullWidth
                            />
                            <TextField
                                label="邮箱"
                                type="email"
                                name="email"
                                value={formData.email || ""}
                                onChange={handleInputChange}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel id="role-label">角色</InputLabel>
                                <Select
                                    labelId="role-label"
                                    label="角色"
                                    name="role"
                                    // 如果 role 未定义则传入空字符串，否则传入 number 类型
                                    value={formData.role !== undefined ? formData.role : ""}
                                    onChange={handleSelectChange}
                                >
                                    {ROLE_OPTIONS.map((role) => (
                                        <MenuItem key={role.value} value={role.value}>
                                            {role.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="status-label">状态</InputLabel>
                                <Select
                                    labelId="status-label"
                                    label="状态"
                                    name="status"
                                    value={formData.status !== undefined ? formData.status : ""}
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value={1}>正常</MenuItem>
                                    <MenuItem value={0}>禁用</MenuItem>
                                </Select>
                            </FormControl>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button variant="contained" onClick={handleSubmit}>
                                    保存
                                </Button>
                                <Button variant="outlined" onClick={handleCancel}>
                                    取消
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* 用户列表 */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>用户名</TableCell>
                                <TableCell>昵称</TableCell>
                                <TableCell>角色</TableCell>
                                <TableCell>邮箱</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u, index) => (
                                <TableRow key={u.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell>{u.nickname}</TableCell>
                                    <TableCell>{u.role}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button variant="outlined" onClick={() => handleEdit(u)}>
                                                编辑
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(u.id)}
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
            )}

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
        </Container>
    );
};

export default UserManagement;
