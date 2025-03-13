import  { useState, useEffect, useCallback } from 'react';
import { listEmployeeRevenue, EmployeeRevenue } from "../../api/employeeRevenue";
import { getAllUsers, UserProfile } from "../../api/user";
import DateEmployeeFilter from './DateEmployeeFilter';
import DataDisplay from './DataDisplay';
import { debounce } from "lodash";

const Dashboard = () => {
    const [revenueList, setRevenueList] = useState<EmployeeRevenue[]>([]);
    const [employeeList, setEmployeeList] = useState<UserProfile[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // 加载员工列表
    useEffect(() => {
        getAllUsers()
            .then((res) => setEmployeeList(res))
            .catch((err) => console.error("获取员工列表失败:", err));
    }, []);

    // 加载收益数据
    const fetchData = useCallback(
        debounce(async (start?: Date, end?: Date, user?: number) => {
            try {
                setLoading(true);
                setError("");
                const { data } = await listEmployeeRevenue(
                    1,
                    100,
                    start || undefined,
                    end || undefined,
                    user || undefined
                );
                setRevenueList(data);
            } catch (err) {
                console.error("获取收益数据失败:", err);
                setError("无法加载数据，请稍后再试！");
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // 当 startDate / endDate / selectedUser 改变时，发起请求
    useEffect(() => {
        fetchData(startDate ?? undefined, endDate ?? undefined, selectedUser ?? undefined);
    }, [fetchData, startDate, endDate, selectedUser]);

    // 回调给子组件
    const handleDateChange = (start: string | null, end: string | null) => {
        setStartDate(start ? new Date(start) : null);
        setEndDate(end ? new Date(end) : null);
    };

    const handleEmployeeChange = (employeeId: number | null) => {
        setSelectedUser(employeeId);
    };

    return (
        <div>
            <h2>📊 收益展示</h2>
            <DateEmployeeFilter
                onDateChange={handleDateChange}
                onEmployeeChange={handleEmployeeChange}
                employeeList={employeeList.map(u => ({ id: u.id, nickname: u.nickname }))}
            />
            <DataDisplay data={revenueList} loading={loading} error={error} selectedUser={selectedUser} />
        </div>
    );
};

export default Dashboard;
