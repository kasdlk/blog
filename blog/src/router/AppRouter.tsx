import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../view/home/Home";
import BlogDetail from "../view/blog/BlogDetail";
import RequireAuth from "./RequireAuth";
import Login from "../view/login/Login";

// 管理后台的子页面
import Blogs from "../view/blog/Blogs";
import Profile from "../view/profile/Profile";
import Settings from "../view/settings/Settings";
import BlogForm from "../view/blog/BlogForm";
import Dashboard from "../view/dashboard/Dashboard";
import DataEntry from "../view/dataentry/DataEntry";
import Admin from "../view/admin/Admin";
import DataEntryForm from "../view/dataentry/DataEntryForm";
import BlogManagement from "../view/blogManage/BlogManagement";
import UserManagement from "../view/user/UserManagement";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 公共页面 */}
                <Route path="/home" element={<Home />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/login" element={<Login />} />

                {/* 管理后台（权限保护） */}
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <Admin />
                        </RequireAuth>
                    }
                >
                    {/* 控制台 */}
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* 博客新增 */}
                    <Route path="blog" element={<Blogs />} />
                    <Route path="blog/form" element={<BlogForm />} />
                    <Route path="blog/form/:id" element={<BlogForm />} />

                    {/* 数据管理 */}
                    <Route path="data-entry" element={<DataEntry />} />
                    <Route path="data-entry/form" element={<DataEntryForm />} />
                    <Route path="data-entry/form/:id" element={<DataEntryForm />} />

                    {/* 博客管理 */}
                    <Route path="user" element={<UserManagement />} />
                    <Route path="user-blog" element={<BlogManagement />} />

                    {/* 其他配置 */}
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
