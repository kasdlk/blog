// src/pages/BlogDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogDetail } from "../../api/blog";
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from "@mui/material";
import Comments from "./Comments"; // 引入评论列表组件
import CommentForm from "./CommentForm";
import Markdown from "mui-markdown";

interface Blog {
    id: number;
    title: string;
    content: string;
    author_id: number;
    // 可继续添加其他字段
}

const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [commentsUpdate, setCommentsUpdate] = useState<number>(0);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getBlogDetail(Number(id))
                .then((data) => {
                    if (data) {
                        setBlog(data);
                        setError(null);
                        document.title = data.title;
                    } else {
                        setError("博客不存在");
                    }
                })
                .catch((err) => {
                    console.error("获取博客详情失败:", err);
                    setError("博客加载失败，请稍后重试");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleCommentCreated = () => {
        setCommentsUpdate((prev) => prev + 1);
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>加载中...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={() => window.location.reload()}>
                        重试
                    </Button>
                    <Button variant="outlined" onClick={handleBack}>
                        返回
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!blog) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    博客不存在
                </Alert>
                <Button variant="outlined" onClick={handleBack}>
                    返回
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
                返回
            </Button>
            <Typography variant="h4" gutterBottom>
                {blog.title}
            </Typography>
            <Box
                sx={{
                    flex: 1,
                    borderRadius: 2,
                    overflow: "auto",
                    padding: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Markdown
                    options={{
                        overrides: {
                            h1: {
                                component: "h1",
                                props: {
                                    style: {
                                        fontSize: "22px",
                                        color: "#333",
                                        marginBottom: "8px",
                                    },
                                },
                            },
                        },
                    }}
                >
                    {blog.content}
                </Markdown>
            </Box>
            {/* 评论表单 */}
            <CommentForm blogId={blog.id} onCommentCreated={handleCommentCreated} />
            {/* 传入博客作者ID 用于权限判断 */}
            <Comments blogId={blog.id} blogAuthorId={blog.author_id} update={commentsUpdate} />
        </Container>
    );
};

export default BlogDetail;
