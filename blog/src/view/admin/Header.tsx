import React, { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUserProfile, UserProfile } from "../../api/user"; // 假设这里有获取用户资料的 API

const Header: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const theme = useTheme();

    // 存储用户资料（包括头像 URL）
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        // 获取用户资料
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch (err) {
                console.error("获取用户资料失败:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate("/profile");
    };

    const handleMyBlog = () => {
        handleMenuClose();
        navigate("/home");
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: "none",
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" noWrap sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Starry Sky
                </Typography>


                <IconButton onClick={handleMenuOpen}>
                    {/* 如果 profile.avatar 存在就显示，否则使用默认颜色背景 */}
                    <Avatar
                        src={profile?.avatar || undefined}
                        sx={{ bgcolor: theme.palette.primary.main }}
                    />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <MenuItem
                        onClick={handleProfile}
                        sx={{
                            fontSize: "0.95rem",
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                    >
                        个人资料
                    </MenuItem>
                    <MenuItem
                        onClick={handleMyBlog}
                        sx={{
                            fontSize: "0.95rem",
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                    >
                        我的博客
                    </MenuItem>
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            fontSize: "0.95rem",
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                    >
                        退出登录
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
