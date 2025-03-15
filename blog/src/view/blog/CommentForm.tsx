// src/components/CommentForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";
import { createComment } from "../../api/comment";

interface CommentFormProps {
    blogId: number;
    onCommentCreated?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ blogId, onCommentCreated }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError("评论内容不能为空");
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            // 这里假设当前用户ID为 1，实际项目中可从用户上下文或 token 中获取
            await createComment({ blog_id: blogId, user_id: 1, content });
            setContent("");
            if (onCommentCreated) onCommentCreated();
        } catch {
            setError("评论提交失败，请稍后再试");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                    {error}
                </Alert>
            )}
            <TextField
                label="发表评论"
                multiline
                fullWidth
                minRows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 1 }}
            />
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "提交中..." : "发表评论"}
            </Button>
        </Box>
    );
};

export default CommentForm;
