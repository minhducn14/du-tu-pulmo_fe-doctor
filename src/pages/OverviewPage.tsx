import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DollarSign,
    Building2,
    Video,
    BarChart3,
} from 'lucide-react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Line,
    ComposedChart,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import { useDashboardStats } from '@/hooks/use-dashboard';
import type { DashboardPeriod } from '@/types/dashboard';

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
];

const PIE_COLORS = ['#22c55e', '#3b82f6'];

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

export function OverviewPage() {
    const [period, setPeriod] = useState<DashboardPeriod>('today');
    const { data: stats, isLoading } = useDashboardStats(period);

    const pieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Bệnh nhân mới', value: stats.patients.new },
            { name: 'Bệnh nhân cũ', value: stats.patients.returning },
        ].filter((d) => d.value > 0);
    }, [stats]);

    const totalPatients = (stats?.patients.new ?? 0) + (stats?.patients.returning ?? 0);

    // Flatten dailyBreakdown for mini charts
    const dailyData = stats?.dailyBreakdown ?? [];

    return (
        <div className="space-y-5 animate-in fade-in-50 duration-500">
            {/* Header */}
            <PageHeader
                title="Báo cáo tổng quan"
                rightSlot={
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${period === opt.value
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* 4 Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border shadow-sm">
                            <CardContent className="pt-5 pb-4">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-7 w-16 mb-2" />
                                <Skeleton className="h-3 w-28" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <StatsCard
                            icon={<DollarSign className="h-4 w-4" />}
                            iconBg="bg-blue-100 text-blue-600"
                            title="TỔNG DOANH THU"
                            value={formatVND(stats?.revenue.total ?? 0)}
                            sub1={`Lượt khám: ${stats?.revenue.visitCount ?? 0}`}
                        />
                        <StatsCard
                            icon={<Building2 className="h-4 w-4" />}
                            iconBg="bg-green-100 text-green-600"
                            title="PHÒNG KHÁM"
                            value={String(stats?.appointments.inClinic ?? 0)}
                            sub1={`Kỳ trước: ${stats?.comparison.previousPeriod.inClinic ?? 0}`}
                        />
                        <StatsCard
                            icon={<Video className="h-4 w-4" />}
                            iconBg="bg-teal-100 text-teal-600"
                            title="DỊCH VỤ TRỰC TUYẾN"
                            value={String(stats?.appointments.video ?? 0)}
                            sub1={`Cuộc gọi: ${stats?.appointments.video ?? 0}`}
                            sub2={`Tin nhắn: 0`}
                        />
                        <StatsCard
                            icon={<BarChart3 className="h-4 w-4" />}
                            iconBg="bg-purple-100 text-purple-600"
                            title="DOANH THU DỊCH VỤ"
                            value={String((stats?.revenue.prescriptions ?? 0) + (stats?.revenue.labTests ?? 0))}
                            sub1={`Đơn thuốc: ${stats?.revenue.prescriptions ?? 0}`}
                            sub2={`Chỉ định: ${stats?.revenue.labTests ?? 0}`}
                        />
                    </>
                )}
            </div>

            {/* Charts Row: Bar Chart + Donut */}
            <div className="grid gap-4 lg:grid-cols-5">
                {/* Stacked Bar Chart */}
                <Card className="lg:col-span-3 border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Lượt bệnh nhân đến khám</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            {isLoading ? (
                                <Skeleton className="h-full w-full rounded-lg" />
                            ) : dailyData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Không có dữ liệu
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={dailyData} barGap={0}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val: any) => {
                                                const d = new Date(val);
                                                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                                            }}
                                        />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                fontSize: 13,
                                            }}
                                            labelFormatter={(val: any) => {
                                                const d = new Date(val);
                                                return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="square"
                                            iconSize={10}
                                            formatter={(value: any) => <span className="text-xs text-gray-600">{value}</span>}
                                        />
                                        <Bar
                                            dataKey="returningPatients"
                                            name="Bệnh nhân cũ"
                                            stackId="patients"
                                            fill="#3b82f6"
                                            radius={[0, 0, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="newPatients"
                                            name="Bệnh nhân mới"
                                            stackId="patients"
                                            fill="#22c55e"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="visits"
                                            name="Lượt khám"
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#f97316' }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart */}
                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Tỉ lệ khách mới/cũ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] flex items-center justify-center">
                            {isLoading ? (
                                <Skeleton className="h-48 w-48 rounded-full" />
                            ) : totalPatients === 0 ? (
                                <p className="text-sm text-gray-400">Không có dữ liệu</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 13 }}
                                            formatter={(value: any, name: any) => [`${value}`, name]}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(value: any) => <span className="text-xs text-gray-600">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: 3 Mini Area Charts */}
            <div className="grid gap-4 md:grid-cols-3">
                <MiniChart
                    title="Tổng bệnh nhân"
                    value={totalPatients}
                    color="#3b82f6"
                    data={dailyData.map((d) => ({ date: d.date, value: d.newPatients + d.returningPatients }))}
                    isLoading={isLoading}
                />
                <MiniChart
                    title="Khách hàng mới"
                    value={stats?.patients.new ?? 0}
                    color="#22c55e"
                    data={dailyData.map((d) => ({ date: d.date, value: d.newPatients }))}
                    isLoading={isLoading}
                />
                <MiniChart
                    title="Khách hàng cũ"
                    value={stats?.patients.returning ?? 0}
                    color="#f97316"
                    data={dailyData.map((d) => ({ date: d.date, value: d.returningPatients }))}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────── */

function StatsCard({
    icon,
    iconBg,
    title,
    value,
    sub1,
    sub2,
}: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    value: string;
    sub1: string;
    sub2?: string;
}) {
    return (
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
                <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg mb-3 ${iconBg}`}>
                    {icon}
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <p className="text-xl font-bold text-blue-600">{value}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{sub1}</span>
                    {sub2 && <span>{sub2}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function MiniChart({
    title,
    value,
    color,
    data,
    isLoading,
}: {
    title: string;
    value: number;
    color: string;
    data: { date: string; value: number }[];
    isLoading: boolean;
}) {
    return (
        <Card className="border shadow-sm">
            <CardContent className="pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-gray-700">{title}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color }}>{value}</span>
                </div>
                <div className="h-[80px]">
                    {isLoading ? (
                        <Skeleton className="h-full w-full rounded" />
                    ) : data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-300">—</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={`url(#grad-${title})`}
                                    dot={{ r: 2, fill: color }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
