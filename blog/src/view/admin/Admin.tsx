import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer, IconButton, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AdminLayout: React.FC = () => {
    const theme = useTheme();
    // 判断屏幕是否为小屏幕：例如 md 以下
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* 顶部导航 */}
            <Header />

            {/* 小屏幕下悬浮的菜单按钮 */}
            {isMobile && (
                <IconButton
                    color="inherit"
                    onClick={handleDrawerToggle}
                    sx={{
                        position: "fixed",
                        top: 16,
                        left: 16,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* 主体区域 */}
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* 大屏幕下显示侧边栏 */}
                {!isMobile && (
                    <Box sx={{ width: 250, borderRight: `1px solid ${theme.palette.divider}` }}>
                        <Sidebar />
                    </Box>
                )}

                {/* 内容区 */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                    <Outlet />
                </Box>
            </Box>

            {/* 小屏幕下的 Drawer，不占据内容布局 */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
                    }}
                >
                    <Sidebar />
                </Drawer>
            )}
        </Box>
    );
};

export default AdminLayout;
