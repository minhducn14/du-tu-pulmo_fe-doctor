import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Calendar,
    Clock,
    Activity,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'T2', visits: 12 },
    { name: 'T3', visits: 18 },
    { name: 'T4', visits: 15 },
    { name: 'T5', visits: 25 },
    { name: 'T6', visits: 20 },
    { name: 'T7', visits: 30 },
    { name: 'CN', visits: 10 },
];

export function OverviewPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title={<h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h1>}
                subtitle="Chào mừng trở lại, Bác sĩ Demo. Chúc bạn một ngày làm việc hiệu quả."
                rightSlot={
                    <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        Đặt lịch mới
                    </Button>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Bệnh nhân chờ"
                    value="4"
                    icon={Users}
                    description="2 bệnh nhân mới"
                    trend="+20% so với hôm qua"
                    trendUp={true}
                />
                <DashboardCard
                    title="Lịch hẹn hôm nay"
                    value="12"
                    icon={Calendar}
                    description="8:00 AM - 5:00 PM"
                />
                <DashboardCard
                    title="Thời gian khám TB"
                    value="18m"
                    icon={Clock}
                    description="Đạt mục tiêu < 20m"
                    trend="-5% so với tuần trước"
                    trendUp={true} // Lower is better implies good trend depending on context, keeping simple
                />
                <DashboardCard
                    title="Đánh giá"
                    value="4.9"
                    icon={Activity}
                    description="Dựa trên 50 lượt vote"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm drop-shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Lượng bệnh nhân trong tuần</CardTitle>
                        <CardDescription>
                            Biểu đồ thể hiện số lượng bệnh nhân đến khám trong 7 ngày qua.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="visits"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVisits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm drop-shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Bệnh nhân sắp tới</CardTitle>
                        <CardDescription>
                            Danh sách 5 bệnh nhân tiếp theo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            BN
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">Nguyễn Văn A</div>
                                            <div className="text-xs text-gray-500">09:30 AM - Khám tổng quát</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-gray-900">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendUp
}: {
    title: string;
    value: string;
    icon: any;
    description?: string;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <Card className="border-none shadow-sm drop-shadow-sm bg-white/50 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend && (
                            <span className={trendUp ? "text-green-600 font-medium flex items-center" : "text-red-600 font-medium flex items-center"}>
                                {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                                {trend}
                            </span>
                        )}
                        {!trend && description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
