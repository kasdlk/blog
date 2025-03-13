import React, { useMemo, useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Switch,
    FormControlLabel,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { debounce } from "lodash";

interface Employee {
    id: number;
    nickname: string;
}

interface DateEmployeeFilterProps {
    onDateChange: (start: string | null, end: string | null) => void;
    onEmployeeChange: (employeeId: number | null) => void;
    employeeList: Employee[];
}

const DateEmployeeFilter_MUI: React.FC<DateEmployeeFilterProps> = ({
                                                                       onDateChange,
                                                                       onEmployeeChange,
                                                                       employeeList,
                                                                   }) => {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [activeOverview, setActiveOverview] = useState<string | null>(null);
    const [isManualSelectActive, setIsManualSelectActive] = useState<boolean>(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // ✅ 去抖，减少接口请求频率
    const debouncedDateChange = useMemo(
        () =>
            debounce((start: Dayjs | null, end: Dayjs | null) => {
                onDateChange(
                    start ? start.format('YYYY-MM-DD') : null,
                    end ? end.format('YYYY-MM-DD') : null
                );
            }, 300),
        [onDateChange]
    );

    // ✅ 选择时间区间
    const handleOverviewToggle = (
        _event: React.MouseEvent<HTMLElement>,
        newValue: string | null
    ) => {
        if (activeOverview === newValue) {
            setActiveOverview(null);
            setStartDate(null);
            setEndDate(null);
            debouncedDateChange(null, null);
            return;
        }
        setActiveOverview(newValue);
        setIsManualSelectActive(false);
        const now = dayjs();
        let start: Dayjs;
        let end: Dayjs;
        switch (newValue) {
            case "today":
                start = now.startOf("day");
                end = now.endOf("day");
                break;
            case "yesterday":
                start = now.subtract(1, "day").startOf("day");
                end = now.subtract(1, "day").endOf("day");
                break;
            case "week":
                start = now.startOf("week");
                end = now.endOf("week");
                break;
            case "month":
                start = now.startOf("month");
                end = now.endOf("month");
                break;
            case "quarter": {
                const quarter = Math.floor(now.month() / 3);
                start = now.set("month", quarter * 3).startOf("month");
                end = start.add(3, "month").subtract(1, "day").endOf("day");
                break;
            }
            default:
                return;
        }
        setStartDate(start);
        setEndDate(end);
        debouncedDateChange(start, end);
    };

    // ✅ 手动选择时间区间
    const handleManualSelectToggle = () => {
        const newValue = !isManualSelectActive;
        setIsManualSelectActive(newValue);
        setActiveOverview(null);
        if (!newValue) {
            setStartDate(null);
            setEndDate(null);
            debouncedDateChange(null, null);
        }
    };

    // ✅ 选择开始日期
    const handleStartDateChange = (value: Dayjs | null) => {
        setStartDate(value);
        debouncedDateChange(value, endDate);
    };

    // ✅ 选择结束日期
    const handleEndDateChange = (value: Dayjs | null) => {
        setEndDate(value);
        debouncedDateChange(startDate, value);
    };

    // ✅ 选择员工
    const handleEmployeeSelect = (event: SelectChangeEvent) => {
        const value = event.target.value === "" ? null : Number(event.target.value);
        setSelectedEmployee(value);
        onEmployeeChange(value);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Stack
                direction={isSmallScreen ? "column" : "row"}
                spacing={3}
                alignItems="center"
            >
                {/* 预设时间区间 */}
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={activeOverview}
                    onChange={handleOverviewToggle}
                    aria-label="时间区间预设"
                >
                    <ToggleButton value="today">今天</ToggleButton>
                    <ToggleButton value="yesterday">昨天</ToggleButton>
                    <ToggleButton value="week">本周</ToggleButton>
                    <ToggleButton value="month">本月</ToggleButton>
                    <ToggleButton value="quarter">本季度</ToggleButton>
                </ToggleButtonGroup>

                {/* 员工选择 */}
                <FormControl sx={{ width: isSmallScreen ? "100%" : 180 }}>
                    <InputLabel id="employee-select-label">员工</InputLabel>
                    <Select
                        labelId="employee-select-label"
                        label="员工"
                        value={selectedEmployee?.toString() ?? ""}
                        onChange={handleEmployeeSelect}
                    >
                        <MenuItem value="">所有员工</MenuItem>
                        {employeeList.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                                {emp.nickname}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 自定义时间区间 */}
                <FormControlLabel
                    label="自定义区间"
                    control={
                        <Switch
                            checked={isManualSelectActive}
                            onChange={handleManualSelectToggle}
                        />
                    }
                />
            </Stack>

            {/* 日期选择器 */}
            {isManualSelectActive && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack
                        direction={isSmallScreen ? "column" : "row"}
                        spacing={2}
                        alignItems="center"
                    >
                        <DatePicker
                            label="开始日期"
                            value={startDate}
                            onChange={handleStartDateChange}
                            format="YYYY-MM-DD" // ✅ 只显示年月日
                        />
                        <DatePicker
                            label="结束日期"
                            value={endDate}
                            onChange={handleEndDateChange}
                            format="YYYY-MM-DD" // ✅ 只显示年月日
                        />
                    </Stack>
                </LocalizationProvider>
            )}
        </Box>
    );
};

export default DateEmployeeFilter_MUI;
