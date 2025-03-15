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
import { EmployeeRevenue } from "../../api/employeeRevenue";
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
    TableBody,
    TableRow,
    TableCell,
    Paper,
    CircularProgress,
    Avatar,
    Alert,
    Tooltip as MuiTooltip
} from "@mui/material";
import { blue, grey } from '@mui/material/colors';

interface DataDisplayProps {
    selectedUser?: number | null;
    data: EmployeeRevenue[];
    loading: boolean;
    error: string | null;
}

interface AggregatedData {
    user_id: number;
    nickname: string;
    avatar: string;
    revenue: number;
    expenditure: number;
    order_count: number;
    ad_creation_count: number;
    roi: number;
    count: number;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
                                                     selectedUser,
                                                     data,
                                                     loading,
                                                     error,
                                                 }) => {
    const [selectedMetric, setSelectedMetric] = useState<string>("revenue");

    const metricsOptions = [
        { key: "revenue", label: "销售额" },
        { key: "expenditure", label: "广告支出" },
        { key: "order_count", label: "订单数量" },
        { key: "ad_creation_count", label: "广告新建数量" },
        { key: "roi", label: "ROI" },
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

    // 当未选中具体员工时，展示聚合视图
    if (selectedUser === null) {
        const aggregatedDataMap = data
            .filter((item) => item.user_id !== undefined)
            .reduce((acc, item) => {
                const key = item.user_id as number;
                if (!acc[key]) {
                    acc[key] = {
                        user_id: item.user_id!,
                        nickname: item.nickname || "-",
                        avatar: item.avatar || "",
                        revenue: 0,
                        expenditure: 0,
                        order_count: 0,
                        ad_creation_count: 0,
                        roi: 0,
                        count: 0,
                    };
                }
                acc[key].revenue += item.revenue;
                acc[key].expenditure += item.expenditure;
                acc[key].order_count += item.order_count;
                acc[key].ad_creation_count += item.ad_creation_count;
                acc[key].roi += item.roi || 0;
                acc[key].count += 1;
                return acc;
            }, {} as Record<number, AggregatedData>);

        const aggregatedData = Object.values(aggregatedDataMap).map(
            (group: AggregatedData) => ({
                user_id: group.user_id,
                nickname: group.nickname,
                avatar: group.avatar,
                revenue: group.revenue / group.count,
                expenditure: group.expenditure / group.count,
                order_count: group.order_count / group.count,
                ad_creation_count: group.ad_creation_count / group.count,
                roi: group.roi / group.count,
            })
        );

        // 计算总统计数据
        const summary = aggregatedData.reduce(
            (acc, item) => ({
                revenue: acc.revenue + item.revenue,
                expenditure: acc.expenditure + item.expenditure,
                order_count: acc.order_count + item.order_count,
                ad_creation_count: acc.ad_creation_count + item.ad_creation_count,
            }),
            { revenue: 0, expenditure: 0, order_count: 0, ad_creation_count: 0 }
        );

        const averageROI =
            aggregatedData.length > 0
                ? aggregatedData.reduce((sum, item) => sum + item.roi, 0) /
                aggregatedData.length
                : 0;

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

                {/* 柱状图 */}
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
                        <Box>广告新建数量: {summary.ad_creation_count}</Box>
                        <Box>平均 ROI: {averageROI.toFixed(2)}</Box>
                    </Box>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregatedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nickname" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey={selectedMetric}
                                fill={blue[400]}
                                barSize={40}
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* 数据表格 */}
                <DataTable data={data} />
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

// 🏆 数据表格组件
interface DataTableProps {
    data: EmployeeRevenue[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    return (
        <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 3, mb: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {/*<TableCell>ID</TableCell>*/}
                        <TableCell>头像</TableCell>
                        <TableCell>昵称</TableCell>
                        <TableCell>销售额</TableCell>
                        <TableCell>广告支出</TableCell>
                        <TableCell>订单数量</TableCell>
                        <TableCell>广告新建数量</TableCell>
                        <TableCell>ROI</TableCell>
                        <TableCell>时间</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} hover>
                            {/*<TableCell>{item.id}</TableCell>*/}
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
                            <TableCell>${item.revenue.toFixed(2)}</TableCell>
                            <TableCell>${item.expenditure.toFixed(2)}</TableCell>
                            <TableCell>{item.order_count}</TableCell>
                            <TableCell>{item.ad_creation_count}</TableCell>
                            <TableCell>{item.roi?.toFixed(2)}</TableCell>
                            <TableCell>
                                {item.record_time
                                    ? new Date(item.record_time).toISOString().split('T')[0]
                                    : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataDisplay;
