import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Avatar,
    TextField,
    Container,
    Stack,
    Divider,
} from "@mui/material";
import { getUserProfile, updateUser, UserProfile } from "../../api/user";

const UserProfileDisplay: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getUserProfile();
            setProfile(data);
            setFormData(data);
            setError(null);
        } catch (err) {
            console.error("获取用户资料失败", err);
            setError("获取用户资料失败");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        try {
            await updateUser(formData);
            await fetchProfile();
            setIsEditing(false);
            alert("修改成功！");
        } catch (err) {
            console.error("修改失败:", err);
            alert("修改失败，请稍后再试");
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="body1" textAlign="center">
                    加载中...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="body1" color="error" textAlign="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="body1" textAlign="center">
                    暂无用户资料
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Card>
                <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        {/* 头像展示 */}
                        <Avatar
                            src={formData.avatar}
                            alt="avatar"
                            sx={{ width: 100, height: 100, mb: 2 }}
                        />

                        {/* 非编辑模式下展示信息 */}
                        {!isEditing ? (
                            <>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    {profile.nickname}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile.email}
                                </Typography>
                                <Divider sx={{ my: 2, width: "100%" }} />

                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {profile.bio || "暂无简介"}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    网站：
                                    {profile.website ? (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profile.website}
                                        </a>
                                    ) : (
                                        "未设置"
                                    )}
                                </Typography>
                            </>
                        ) : (
                            <Stack spacing={2} sx={{ width: "100%" }}>
                                <TextField
                                    label="昵称"
                                    name="nickname"
                                    variant="outlined"
                                    size="small"
                                    value={formData.nickname || ""}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    label="邮箱"
                                    name="email"
                                    variant="outlined"
                                    size="small"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    label="头像链接"
                                    name="avatar"
                                    variant="outlined"
                                    size="small"
                                    placeholder="https://example.com/default_avatar.png"
                                    value={formData.avatar || ""}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    label="个人简介"
                                    name="bio"
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    rows={3}
                                    value={formData.bio || ""}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    label="个人网站"
                                    name="website"
                                    variant="outlined"
                                    size="small"
                                    placeholder="https://..."
                                    value={formData.website || ""}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <Typography variant="body2" color="text.secondary">
                                    上次登录时间：
                                    {profile.lastLoginAt
                                        ? new Date(profile.lastLoginAt).toLocaleString()
                                        : "未登录"}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: "center", mb: 2 }}>
                    {!isEditing ? (
                        <Button variant="contained" onClick={() => setIsEditing(true)}>
                            编辑资料
                        </Button>
                    ) : (
                        <>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                保存
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => setIsEditing(false)}
                            >
                                取消
                            </Button>
                        </>
                    )}
                </CardActions>
            </Card>
        </Container>
    );
};

export default UserProfileDisplay;
