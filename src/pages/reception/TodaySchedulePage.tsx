import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { appointmentService } from '@/services/appointment.service';
import { useQuery } from '@tanstack/react-query';

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export const TodaySchedulePage = () => {
  const today = toYmd(new Date());
  const { data, isLoading } = useQuery({
    queryKey: ['appointments', 'today', today],
    queryFn: () => appointmentService.getMyCalendar(today, today),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch khám hôm nay"
        subtitle={`Ngày ${today} · Dữ liệu từ /appointments/my/doctor/calendar`}
      />
      <Card>
        <CardContent className="p-4 space-y-3">
          {isLoading && <p className="text-sm text-gray-500">Đang tải lịch...</p>}
          {(data || []).map((appt) => (
            <div key={appt.id} className="rounded border p-3 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{appt.patient?.user?.fullName || 'Bệnh nhân'}</p>
                <p className="text-xs text-gray-500">
                  {appt.appointmentNumber} · {formatTime(appt.scheduledAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{appt.status}</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/doctor/appointments/${appt.id}`}>Chi tiết</Link>
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && (data || []).length === 0 && (
            <p className="text-sm text-gray-500">Không có lịch khám trong hôm nay.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodaySchedulePage;
