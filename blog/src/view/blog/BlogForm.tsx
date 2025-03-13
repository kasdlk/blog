import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Markdown from "mui-markdown";
import { getBlogDetail, createBlog, updateBlog } from "../../api/blog";
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import AppNotification from "../../components/Notification.tsx";

const BlogForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<string>("广告模板");
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<string>("默认分类");
    const [tags, setTags] = useState<string[]>([]);
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const availableCategories = ["默认分类", "营销", "数据分析", "策略", "优化"];
    const TEMPLATES: Record<string, string> = {
        "广告模板": `### 1️⃣ 今日数据表现
- 📊 曝光量：  
- 👀 点击率（CTR）：  
- 💰 成交率（CVR）：  
- 💸 投放花费：  
- 💼 收入：  

### 2️⃣ 有效广告策略与优化
- ✅ 策略 1：  
- ✅ 策略 2：  
- ✅ 策略 3：  

### 3️⃣ 遇到的问题与调整
- ❌ 问题 1：  
- 💡 调整方案：  
- ❌ 问题 2：  
- 💡 调整方案：  

### 4️⃣ 需要测试的新思路
- 🧪 思路 1：  
- 🧪 思路 2：  

### 5️⃣ 总结与反思
- 本日 ROI（投入产出比）：  
- 下一步改进方向：`,

        "简单日报模板": `## 🌅 今日总结
### ✅ 完成任务
- 任务 1  
- 任务 2  
- 任务 3  

### 🚀 进展情况
- 取得进展：  
- 遇到的阻碍：  

### 🎯 明日计划
- 计划 1  
- 计划 2  
- 计划 3  

### 🤔 需要帮助
- 问题 1  
- 问题 2  
`,

        "简单博客模板": `## 📝 标题  
### ✍️ 前言  
这里写一些前言，介绍文章的背景和目的。  

### 💡 内容  
- 第一部分  
- 第二部分  
- 第三部分  

### 🔍 结论  
总结文章的核心内容和关键观点。`,

        "技术分享模板": `## 🖥️ 技术分享  
### 🚀 主题  
- 技术 A  
- 技术 B  

### 📚 细节  
1. 介绍  
2. 实现方式  
3. 注意事项  

### ✅ 成果  
- 代码示例  
- 运行结果  
- 最终优化`,

        "产品更新模板": `## 🚀 产品更新日志  
### 🔥 新功能  
- 新增功能 1  
- 新增功能 2  

### 🛠️ 优化  
- 优化内容 1  
- 优化内容 2  

### 🐞 Bug 修复  
- 修复问题 1  
- 修复问题 2  

### 🌟 未来计划  
- 计划内容 1  
- 计划内容 2`,

        "营销报告模板": `## 📊 营销数据报告  
### 📅 日期  
- 日期范围：  

### 🔍 数据总览  
- 曝光量：  
- 点击率（CTR）：  
- 转化率（CVR）：  
- 成交额：  

### 🧠 优化策略  
- 调整策略 1  
- 调整策略 2  
- 调整策略 3  

### 🎯 下一步行动  
- 计划 1  
- 计划 2  
- 计划 3`,

        "会议纪要模板": `## 📅 会议纪要  
### 🏢 会议名称  
- 会议主题：  
- 参会人员：  
- 会议时间：  

### 🔍 主要讨论内容  
1. 讨论内容 1  
2. 讨论内容 2  
3. 讨论内容 3  

### ✅ 会议决议  
- 决议内容 1  
- 决议内容 2  

### 🎯 下一步计划  
- 计划 1  
- 计划 2  
`,

        "空白模版": ``
    };
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" | "info" }>({
        open: false,
        message: "",
        severity: "success",
    });
    useEffect(() => {
        if (!id) {
            setContent(TEMPLATES[template]);
        }
    }, [template, id]);
    useEffect(() => {
        if (id) {
            const fetchBlog = async () => {
                setLoading(true);
                try {
                    const data = await getBlogDetail(Number(id));
                    if (data) {
                        setTitle(data.title);
                        setCategory(data.category);
                        setTags(data.tags.split(","));
                        setContent(data.content);
                    } else {
                        setError("未找到博客数据");
                    }
                } catch (error) {
                    console.error("获取博客详情失败:", error);
                    setError("获取博客详情失败");
                } finally {
                    setLoading(false);
                }
            };

            fetchBlog();
        }
    }, [id]);

    const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTags(event.target.value.split(","));
    };
    const showNotification = (message: string, severity: "success" | "error" | "warning" | "info") => {
        setNotification({ open: true, message, severity });
    };
    const handleSubmit = async () => {
        if (!title || !content) {
            showNotification("标题和内容不能为空", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            if (id) {
                await updateBlog(Number(id), { title, content, category, tags: tags.join(",") });
                showNotification("更新成功！", "success");
            } else {
                await createBlog({ title, content, category, tags: tags.join(",") });
                showNotification("创建成功！", "success");
            }

            navigate("/blog");
        } catch (error) {
            console.error("操作失败:", error);
            showNotification("操作失败，请稍后再试！", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>加载中...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper
                sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 5,
                    backgroundColor: "#f9fafb",
                    transition: "all 0.3s",
                    "&:hover": { boxShadow: 8 },
                }}
            >
                <Typography variant="h5" gutterBottom>
                    {id ? "编辑博客" : "创建博客"}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* 标题 */}
                <TextField
                    label="标题"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                />

                {/* 分类 */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>分类</InputLabel>
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        label="分类"
                    >
                        {availableCategories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 标签 */}
                <TextField
                    label="标签（用逗号分隔）"
                    fullWidth
                    margin="normal"
                    value={tags.join(",")}
                    onChange={handleTagChange}
                    variant="outlined"
                />
                <FormControl fullWidth>
                    <InputLabel>模板</InputLabel>
                    <Select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        label="模板"
                    >
                        {Object.keys(TEMPLATES).map((template) => (
                            <MenuItem key={template} value={template}>
                                {template}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Markdown 编辑器 + 预览 */}
                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        gap: 2,
                        height: "60vh", // ✅ 控制整体高度
                    }}
                >
                    {/* Markdown 编辑 */}
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            overflow: "auto",
                            padding: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            multiline
                            rows={20}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            variant="outlined"
                            placeholder="在这里输入 Markdown 内容..."
                        />
                        {/*<Markdown>{content || "_在这里显示预览内容_"}</Markdown>*/}
                    </Box>

                    {/* Markdown 预览 */}
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            overflow: "auto",
                            padding: 2,
                            backgroundColor: "#fafafa",
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
                            {content || "_在这里显示预览内容_"}
                        </Markdown>
                    </Box>
                </Box>

                {/* 提交按钮 */}
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 3,
                        backgroundColor: "#00796b",
                        "&:hover": { backgroundColor: "#004d40" },
                    }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "提交中..." : id ? "更新" : "创建"}
                </Button>
            </Paper>

            <AppNotification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={() => setNotification({ ...notification, open: false })}
            />
        </Container>
    );
};

export default BlogForm;
