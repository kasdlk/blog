import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginUser } from "../../api/user";
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";

const LoginPage: React.FC = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            setError("用户名和密码不能为空");
            return;
        }
        try {
            setError("");
            const response = await loginUser(form.username, form.password);
            if (response?.status === "success" && response?.user?.token) {
                // 存储 token 和用户信息
                sessionStorage.setItem("token", response.user.token);
                sessionStorage.setItem("role", response.user.role);
                // 跳转到 admin 页面
                navigate("/");
            } else {
                setError("登录失败，请检查用户名或密码");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "登录失败");
            } else {
                setError("发生未知错误");
            }
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    登录
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="用户名"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="密码"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                        登录
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;
