import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateReport, useMyReports } from '@/hooks/use-reports';
import type { ReportType } from '@/types/report';
import { toast } from 'sonner';

export const IssueReportPage = () => {
  const { data: reports } = useMyReports();
  const createReport = useCreateReport();
  const [reportType, setReportType] = useState<ReportType>('system');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [content, setContent] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport.mutateAsync({
        reportType,
        doctorId: doctorId || undefined,
        appointmentId: appointmentId || undefined,
        content,
      });
      setContent('');
      setDoctorId('');
      setAppointmentId('');
      toast.success('Đã gửi phản ánh sự cố');
    } catch {
      toast.error('Không thể gửi phản ánh');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phản ánh sự cố"
        subtitle="Gửi phản ánh về hệ thống, lịch hẹn hoặc AI X-ray"
      />

      <Card>
        <CardHeader>
          <CardTitle>Tạo phản ánh mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Loại phản ánh</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option value="system">System</option>
                <option value="doctor">Doctor</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Doctor ID (tùy chọn)</Label>
              <Input value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Appointment ID (tùy chọn)</Label>
              <Input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Nội dung</Label>
              <textarea
                className="w-full min-h-28 border rounded-md px-3 py-2 text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createReport.isPending}>
                Gửi phản ánh
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phản ánh của tôi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(reports || []).map((r) => (
            <div key={r.id} className="border rounded-md p-3">
              <div className="text-sm font-medium">{r.reportType.toUpperCase()} · {r.status}</div>
              <div className="text-sm text-gray-700 mt-1">{r.content}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(r.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
          {(reports || []).length === 0 && (
            <p className="text-sm text-gray-500">Bạn chưa gửi phản ánh nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueReportPage;
