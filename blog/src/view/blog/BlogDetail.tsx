import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { getBlogDetail } from "../../api/blog";
import {
    Container,
    Paper,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from "@mui/material";

interface Blog {
    id: number;
    title: string;
    content: string;
    // 如果还有其他字段，可以继续添加
}

const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mt: 2 }}>
                    <MDEditor.Markdown source={blog.content} style={{ whiteSpace: "pre-wrap" }} />
                </Box>
            </Paper>
        </Container>
    );
};

export default BlogDetail;
