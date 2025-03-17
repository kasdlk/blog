import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    createEmployeeRevenue,
    updateEmployeeRevenue,
    getEmployeeRevenue,
    EmployeeRevenue,
    SaveEmployeeRevenueDto,
    UpdateEmployeeRevenueDto,
} from "../../api/employeeRevenue";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    AlertColor,
    Stack,
    Paper,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

const DataEntryForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = !!id;
    const [formData, setFormData] = useState<Partial<EmployeeRevenue>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

    // 初始加载数据（编辑模式下获取数据）
    useEffect(() => {
        const fetchRecord = async (recordId: number) => {
            try {
                setLoading(true);
                const data = await getEmployeeRevenue(recordId);
                setFormData(data);
                setError(null);
            } catch (err) {
                console.error("获取记录失败:", err);
                setError("获取记录失败");
            } finally {
                setLoading(false);
            }
        };

        if (isEditMode && id) {
            fetchRecord(Number(id));
        }
    }, [isEditMode, id]);

    // 针对 TextField 的 onChange
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (
            ["expenditure", "order_count", "revenue", "ad_creation_count"].includes(
                name
            )
        ) {
            setFormData((prev) => ({
                ...prev,
                [name]: value === "" ? undefined : Number(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // 计算 ROI：销售额 / 广告支出（避免除以零）
    const computedROI =
        formData.expenditure && formData.expenditure > 0
            ? ((formData.revenue || 0) / formData.expenditure).toFixed(2)
            : "0";

    // 表单提交
    const handleSubmit = async () => {
        const requiredFields: (keyof SaveEmployeeRevenueDto)[] = [
            "ad_platform",
            "expenditure",
            "order_count",
            "ad_creation_count",
            "revenue",
        ];

        const missingFields = requiredFields.filter(
            (field) => formData[field] === undefined || formData[field] === ""
        );
        if (missingFields.length > 0) {
            showSnackbar(
                `请填写以下必填字段：${missingFields.join(", ")}`,
                "error"
            );
            return;
        }

        const numericFields: (keyof SaveEmployeeRevenueDto)[] = [
            "expenditure",
            "order_count",
            "ad_creation_count",
            "revenue",
        ];
        const invalidNumericFields = numericFields.filter((field) => {
            const value = formData[field];
            return typeof value !== "number" || isNaN(value);
        });
        if (invalidNumericFields.length > 0) {
            showSnackbar(
                `请确保以下字段为有效数字：${invalidNumericFields.join(", ")}`,
                "error"
            );
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && id) {
                await updateEmployeeRevenue(Number(id), {
                    ...formData,
                    record_time: formData.record_time ?? undefined,
                } as UpdateEmployeeRevenueDto);
                showSnackbar("更新成功！", "success");
            } else {
                await createEmployeeRevenue({
                    ...formData,
                    record_time:
                        formData.record_time ??
                        new Date().toISOString().split("T")[0],
                } as SaveEmployeeRevenueDto);
                showSnackbar("创建成功！", "success");
            }
            navigate("/data-entry");
        } catch (err) {
            console.error("保存失败:", err);
            showSnackbar("保存失败，请稍后重试！", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/data-entry");
    };

    const showSnackbar = (message: string, severity: AlertColor) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // 定义下拉选项
    const adPlatformOptions = [
        "Google Ads",
        "Facebook Ads",
        "Instagram Ads",
        "Twitter Ads",
    ];
    const productCategoriesOptions = ["电子产品", "服装", "家居", "食品", "其他"];
    const adTypeOptions = ["搜索广告", "展示广告", "视频广告", "社交广告"];
    const regionOptions = ["北美", "欧洲", "亚洲", "南美", "非洲", "大洋洲", "中东"];

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                {isEditMode ? "编辑记录" : "新增记录"}
            </Typography>

            {loading && (
                <Box sx={{ textAlign: "center", my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <Paper sx={{ p: 2, maxWidth: 600, margin: "0 auto" }}>
                    <Stack spacing={2}>
                        {/* 修改为 Autocomplete 组件，支持下拉选择和手动输入 */}
                        <Autocomplete
                            freeSolo
                            filterOptions={(options) => options}
                            options={adPlatformOptions}
                            value={formData.ad_platform || ""}
                            onChange={(_, newValue) => {
                                // 如果 newValue 为字符串，直接设置；如果为对象，可以做进一步处理
                                setFormData((prev) => ({
                                    ...prev,
                                    ad_platform: newValue as string,
                                }));
                            }}
                            onInputChange={(_, newInputValue) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    ad_platform: newInputValue,
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="广告平台"
                                    placeholder="请选择或输入广告平台"
                                    size="small"
                                />
                            )}
                        />

                        <Autocomplete
                            freeSolo
                            filterOptions={(options) => options}  // 始终显示所有选项，不进行过滤
                            options={productCategoriesOptions}
                            value={formData.product_categories || ""}
                            onChange={(_, newValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    product_categories: newValue || "",
                                }))
                            }
                            onInputChange={(_, newInputValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    product_categories: newInputValue,
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="商品类别"
                                    placeholder="请选择或输入商品类别"
                                    size="small"
                                />
                            )}
                        />


                        <Autocomplete
                            freeSolo
                            filterOptions={(options) => options}
                            options={adTypeOptions}
                            value={formData.ad_type || ""}
                            onChange={(_, newValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    ad_type: newValue || "",
                                }))
                            }
                            onInputChange={(_, newInputValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    ad_type: newInputValue,
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="广告类型"
                                    placeholder="请选择或输入广告类型"
                                    size="small"
                                />
                            )}
                        />

                        <Autocomplete
                            freeSolo
                            filterOptions={(options) => options}
                            options={regionOptions}
                            value={formData.region || ""}
                            onChange={(_, newValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    region: newValue || "",
                                }))
                            }
                            onInputChange={(_, newInputValue) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    region: newInputValue,
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="销售地区"
                                    placeholder="请选择或输入销售地区"
                                    size="small"
                                />
                            )}
                        />

                        <TextField
                            type="number" // 使用 type="number"
                            label="广告支出($)"
                            name="expenditure"
                            value={formData.expenditure !== undefined ? formData.expenditure : ""}
                            onChange={(e) => {
                                const { name, value } = e.target;
                                // 空字符串或者有效数字时设置值
                                setFormData((prev) => ({
                                    ...prev,
                                    [name]: value === "" ? "" : Number(value),
                                }));
                            }}
                            size="small"
                            placeholder="请输入广告支出"
                            inputProps={{
                                inputMode: "decimal", // 允许小数输入
                            }}
                        />

                        <TextField
                            label="订单数量"
                            name="order_count"
                            value={formData.order_count !== undefined ? formData.order_count : ""}
                            onChange={(e) => {
                                const { name, value } = e.target;
                                // 只允许整数输入
                                if (value === "" || /^[0-9]+$/.test(value)) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        [name]: value === "" ? "" : Number(value),
                                    }));
                                }
                            }}
                            size="small"
                            placeholder="请输入订单数量"
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            }}
                        />

                        <TextField
                            type="number"
                            label="上新品数量"
                            name="ad_creation_count"
                            value={formData.ad_creation_count !== undefined ? formData.ad_creation_count : ""}
                            onChange={(e) => {
                                const { name, value } = e.target;
                                setFormData((prev) => ({
                                    ...prev,
                                    [name]: value === "" ? "" : Number(value),
                                }));
                            }}
                            size="small"
                            placeholder="请输入上新品数量"
                            inputProps={{
                                inputMode: "numeric",
                                step: "1",
                            }}
                        />

                        <TextField
                            type="number"
                            label="销售额($)"
                            name="revenue"
                            value={formData.revenue !== undefined ? formData.revenue : ""}
                            onChange={(e) => {
                                const { name, value } = e.target;
                                setFormData((prev) => ({
                                    ...prev,
                                    [name]: value === "" ? "" : Number(value),
                                }));
                            }}
                            size="small"
                            placeholder="请输入销售额"
                            inputProps={{
                                inputMode: "numeric",
                                step: "any", // 允许小数
                            }}
                        />

                        <TextField
                            label="ROI"
                            value={computedROI}
                            size="small"
                            disabled
                        />
                        <TextField
                            label="记录时间"
                            type="date"
                            value={formData.record_time ?? ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    record_time: e.target.value,
                                }))
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="备注"
                            name="remark"
                            value={formData.remark ?? ""}
                            onChange={handleChange}
                            size="small"
                            multiline
                            placeholder="请输入备注"
                        />

                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                保存
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                返回
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DataEntryForm;
