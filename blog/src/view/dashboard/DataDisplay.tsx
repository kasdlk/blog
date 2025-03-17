import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Container,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    CircularProgress,
    Avatar,
    Alert,
    Tooltip as MuiTooltip
} from "@mui/material";
import { blue, grey } from '@mui/material/colors';

// 定义聚合数据接口，与后端返回数据结构一致
export interface AggregatedEmployeeRevenue {
    user_id: number;
    nickname: string;
    avatar: string;
    total_revenue: number;
    total_expenditure: number;
    total_order_count: number;
    total_ad_creation_count: number;
    average_roi: number;
}

interface DataDisplayProps {
    selectedUser?: number | null;
    // 现在 data 直接为聚合后的数据
    data: AggregatedEmployeeRevenue[];
    loading: boolean;
    error: string | null;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
                                                     selectedUser,
                                                     data,
                                                     loading,
                                                     error,
                                                 }) => {
    // 初始指标选择默认展示销售额（聚合数据字段为 total_revenue）
    const [selectedMetric, setSelectedMetric] = useState<string>("total_revenue");

    const metricsOptions = [
        { key: "total_revenue", label: "销售额" },
        { key: "total_expenditure", label: "广告支出" },
        { key: "total_order_count", label: "订单数量" },
        { key: "total_ad_creation_count", label: "上新品数量" },
        { key: "average_roi", label: "ROI" },
    ];

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 2 }}>
                    暂无数据
                </Alert>
            </Container>
        );
    }

    // 若未选中具体员工，直接使用后端返回的聚合数据
    if (selectedUser === null) {
        const aggregatedData = data;

        // 计算总统计数据（前端可自行统计总额）
        const summary = aggregatedData.reduce(
            (acc, item) => ({
                revenue: acc.revenue + item.total_revenue,
                expenditure: acc.expenditure + item.total_expenditure,
                order_count: acc.order_count + item.total_order_count,
                ad_creation_count: acc.ad_creation_count + item.total_ad_creation_count,
            }),
            { revenue: 0, expenditure: 0, order_count: 0, ad_creation_count: 0 }
        );

        const averageROI =
            aggregatedData.length > 0
                ? aggregatedData.reduce((sum, item) => sum + item.average_roi, 0) /
                aggregatedData.length
                : 0;

        // 构造图表数据：横轴为员工昵称，纵轴为选择指标的值
        const chartData = aggregatedData.map(item => ({
            name: item.nickname,
            value: item[selectedMetric as keyof AggregatedEmployeeRevenue],
        }));

        return (
            <Container sx={{ mt: 4 }}>
                {/* 指标选择 */}
                <Box sx={{ mb: 3, display: 'flex' }}>
                    <FormControl variant="outlined" sx={{ minWidth: 240 }}>
                        <InputLabel>选择比较指标</InputLabel>
                        <Select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                        >
                            {metricsOptions.map((option) => (
                                <MenuItem key={option.key} value={option.key}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* 汇总统计展示 */}
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: 400,
                        backgroundColor: "#fafafa",
                        borderRadius: 3,
                        boxShadow: 5,
                        p: 3,
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            backgroundColor: "rgba(0, 0, 0, 0.65)",
                            color: "#fff",
                            borderRadius: 2,
                            p: 2,
                            zIndex: 1,
                            boxShadow: 3,
                            fontSize: "0.875rem",
                        }}
                    >
                        <Box sx={{ fontWeight: "bold", mb: 1 }}>汇总统计</Box>
                        <Box>总销售额: ${summary.revenue.toFixed(2)}</Box>
                        <Box>总广告支出: ${summary.expenditure.toFixed(2)}</Box>
                        <Box>订单数量: {summary.order_count}</Box>
                        <Box>上新品数量: {summary.ad_creation_count}</Box>
                        <Box>平均 ROI: {averageROI.toFixed(2)}</Box>
                    </Box>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="value"
                                fill={blue[400]}
                                barSize={40}
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* 数据表格 */}
                <DataTable data={aggregatedData} />
            </Container>
        );
    } else {
        // 当选中具体员工时，根据 selectedUser 过滤数据
        const filteredData = data.filter(item => item.user_id === selectedUser);
        if (filteredData.length === 0) {
            return (
                <Container>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        暂无数据
                    </Alert>
                </Container>
            );
        }
        return (
            <Container sx={{ mt: 4 }}>
                <DataTable data={filteredData} />
            </Container>
        );
    }
};

// 🏆 数据表格组件：直接显示聚合数据，不再包含详细记录的 record_time 字段
interface DataTableProps {
    data: AggregatedEmployeeRevenue[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    return (
        <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 3, mb: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>头像</TableCell>
                        <TableCell>昵称</TableCell>
                        <TableCell>总销售额</TableCell>
                        <TableCell>总广告支出</TableCell>
                        <TableCell>总订单数量</TableCell>
                        <TableCell>总上新品数量</TableCell>
                        <TableCell>平均ROI</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.user_id} hover>
                            <TableCell>
                                <MuiTooltip title={item.nickname}>
                                    <Avatar
                                        src={item.avatar}
                                        alt={item.nickname}
                                        sx={{ width: 40, height: 40, border: `2px solid ${grey[300]}` }}
                                    />
                                </MuiTooltip>
                            </TableCell>
                            <TableCell>{item.nickname}</TableCell>
                            <TableCell>${item.total_revenue.toFixed(2)}</TableCell>
                            <TableCell>${item.total_expenditure.toFixed(2)}</TableCell>
                            <TableCell>{item.total_order_count}</TableCell>
                            <TableCell>{item.total_ad_creation_count}</TableCell>
                            <TableCell>{item.average_roi.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataDisplay;
