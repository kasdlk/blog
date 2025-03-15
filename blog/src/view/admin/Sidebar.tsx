import React, { useEffect, useState } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Card,
    ListItemIcon,
    Divider,
    ListItemButton,
    useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import CalicoCatSvg from "../../icons/三花猫";
import HamsterSvg from "../../icons/仓鼠";
import PsyduckSvg from "../../icons/可达鸭";
import HuskySvg from "../../icons/哈士奇";
import RagdollCatSvg from "../../icons/布偶猫";
import SphynxCatSvg from "../../icons/无毛猫";
import SiameseCatSvg from "../../icons/暹罗猫";

export interface MenuItemType {
    key: string;
    label: string;
    visible: boolean;
    icon?: React.ReactNode;
}

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [role, setRole] = useState<number | null>(null);

    useEffect(() => {
        const storedRole = sessionStorage.getItem("role");
        if (storedRole) {
            setRole(Number(storedRole));
        }
    }, []);

    // 主功能区菜单
    const mainItems: MenuItemType[] = [
        { key: "dashboard", label: "数据中心", visible: true, icon: <CalicoCatSvg /> },
        { key: "data-entry", label: "数据记录", visible: true, icon: <HamsterSvg /> },
        { key: "blog", label: "博客创建", visible: true, icon: <PsyduckSvg /> },
        { key: "user", label: "用户管理", visible: role !== null && role <= 1, icon: <HuskySvg /> },
        { key: "user-blog", label: "用户博客", visible: true, icon: <RagdollCatSvg /> },
    ];

    // 次要功能区菜单
    const secondaryItems: MenuItemType[] = [
        { key: "profile", label: "个人资料", visible: true, icon: <SphynxCatSvg /> },
        { key: "settings", label: "系统设置", visible: true, icon: <SiameseCatSvg /> },
    ];

    const handleMenuClick = (menu: string) => {
        navigate(`/${menu}`);
    };

    const isActive = (key: string) => location.pathname === `/${key}`;

    const renderListItems = (items: MenuItemType[]) =>
        items.filter((item) => item.visible).map((item) => {
            const active = isActive(item.key);

            return (
                <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => handleMenuClick(item.key)}
                        selected={active}
                        sx={{
                            borderRadius: 1,
                            backgroundColor: active ? theme.palette.action.selected : "transparent",
                            transition: "background-color 0.3s",
                            "&:hover": {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    >
                        {item.icon && (
                            <ListItemIcon
                                sx={{
                                    minWidth: 30,
                                    color: active ? theme.palette.primary.main : "inherit",
                                    "& svg": {
                                        width: 24,
                                        height: 24,
                                    },
                                }}
                            >
                                {React.isValidElement(item.icon)
                                    ? React.cloneElement(item.icon as React.ReactElement)
                                    : item.icon}
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontSize: "0.9rem",
                                fontWeight: active ? 600 : 400,
                                color: theme.palette.text.primary,
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            );
        });

    return (
        <Box
            sx={{
                width: 250,
                backgroundColor: theme.palette.background.default,
                overflowY: "auto",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                p: 2,
                borderRight: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Card sx={{ p: 1, mb: 2, borderRadius: 2 }}>
                <List disablePadding>{renderListItems(mainItems)}</List>
            </Card>

            <Divider sx={{ mb: 2 }} />

            <Card sx={{ p: 1, borderRadius: 2 }}>
                <List disablePadding>{renderListItems(secondaryItems)}</List>
            </Card>
        </Box>
    );
};

export default Sidebar;
