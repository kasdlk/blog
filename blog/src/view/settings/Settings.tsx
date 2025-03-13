// Settings.tsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Box,
    Typography,
    Button,
    FormControlLabel,
    Switch,
    Divider,
} from "@mui/material";
import { ThemeContext } from "../../ThemeContext"; // 根据实际路径调整导入

const Settings: React.FC = () => {
    const navigate = useNavigate();
    // 使用全局主题上下文
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);

    // 本地状态管理
    const [isBlogPublic, setIsBlogPublic] = useState<boolean>(true);
    const [isFormVisible, setIsFormVisible] = useState<boolean>(true);

    // 更新博客隐私状态
    const handleToggleBlogPrivacy = () => {
        setIsBlogPublic((prev) => !prev);
    };

    // 更新表单显示状态
    const handleToggleFormVisibility = () => {
        setIsFormVisible((prev) => !prev);
    };

    // 退出登录
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    系统设置
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* 博客隐私设置 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography>博客状态</Typography>
                    <Button
                        variant="contained"
                        color={isBlogPublic ? "success" : "error"}
                        onClick={handleToggleBlogPrivacy}
                    >
                        {isBlogPublic ? "公开" : "私有"}
                    </Button>
                </Box>

                {/* 数据展示设置 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography>数据展示</Typography>
                    <Button
                        variant="contained"
                        onClick={handleToggleFormVisibility}
                        color={isFormVisible ? "primary" : "secondary"}
                    >
                        {isFormVisible ? "显示" : "隐藏"}
                    </Button>
                </Box>

                {/* 黑夜模式切换 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography>黑夜模式</Typography>
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
                        label={darkMode ? "开启" : "关闭"}
                    />
                </Box>

                {/* 系统版本 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography>系统版本</Typography>
                    <Typography>v1.0.0</Typography>
                </Box>

                {/* 服务器状态 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography>状态</Typography>
                    <Typography color="success.main">在线</Typography>
                </Box>

                {/* 退出登录 */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Button variant="contained" color="error" onClick={handleLogout}>
                        退出登录
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Settings;
