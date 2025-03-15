// src/components/Comments.tsx
import React, { useState, useEffect } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    List,
    Paper,
    ListItem,
    ListItemText,
    Alert,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getCommentsByBlog, deleteComment, Comment } from "../../api/comment";

interface CommentsProps {
    blogId: number;
    blogAuthorId: number; // 博客作者ID
    update?: number; // 当该值变化时重新加载评论
}

const Comments: React.FC<CommentsProps> = ({ blogId, update }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await getCommentsByBlog(blogId, 1);

            console.log(Number(localStorage.getItem("role") || "999"))
            setComments(response);
            setError(null);
        } catch {
            setError("获取评论失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [blogId, update]);

    const handleDelete = async (commentId: number) => {
        try {
            const success = await deleteComment(commentId);
            if (success) {
                // 删除成功后刷新评论列表
                fetchComments();
            }
        } catch (err) {
            console.error("删除评论失败", err);
        }
    };

    const currentRole = Number(sessionStorage.getItem("role") || "999");

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                评论
            </Typography>
            {(!comments || comments.length === 0) ? (
                <Alert severity="info">暂无评论</Alert>
            ) : (
                <List sx={{ width: "100%" }}>
                    {comments.map((comment) => (
                        <Paper
                            key={comment.id}
                            sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "#f7f7f7",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ListItem disablePadding sx={{ flex: 1 }}>
                                <ListItemText
                                    primary={comment.content}
                                    secondary={`用户: ${comment.nickname} | ${new Date(
                                        comment.created_at
                                    ).toLocaleString()}`}
                                    sx={{ "& .MuiTypography-root": { fontSize: "0.9rem" } }}
                                />
                            </ListItem>
                            {((currentRole === 0)) && (
                                <IconButton
                                    onClick={() => handleDelete(comment.id)}
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Paper>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default Comments;
