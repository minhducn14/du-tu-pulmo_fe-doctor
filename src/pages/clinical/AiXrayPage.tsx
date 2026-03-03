import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/hooks/use-patients';
import { useUploadedScreenings } from '@/hooks/use-screenings';
import AIXraySection from '@/components/medical/AIXraySection';
import type { ScreeningType, ScreeningStatus } from '@/types/screening';

const statusColor: Record<ScreeningStatus, string> = {
  UPLOADED: 'bg-slate-100 text-slate-700',
  PENDING_AI: 'bg-yellow-100 text-yellow-700',
  AI_PROCESSING: 'bg-blue-100 text-blue-700',
  AI_COMPLETED: 'bg-green-100 text-green-700',
  AI_FAILED: 'bg-red-100 text-red-700',
  PENDING_DOCTOR: 'bg-orange-100 text-orange-700',
  DOCTOR_REVIEWING: 'bg-purple-100 text-purple-700',
  DOCTOR_COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const screeningTypeLabel: Record<ScreeningType, string> = {
  XRAY: 'X-ray',
  CT: 'CT',
  MRI: 'MRI',
  ULTRASOUND: 'Sieu am',
  OTHER: 'Khac',
};

export const AiXrayPage = () => {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const { data: patients } = usePatients({ page: 1, limit: 50, search: search || undefined });
  const { data: uploaded } = useUploadedScreenings({ page: 1, limit: 10 });

  const patientOptions = useMemo(() => patients?.items || [], [patients]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chẩn đoán X-quang"
        subtitle="Upload và phân tích ca AI độc lập ngoài encounter"
        rightSlot={
          <Button asChild variant="outline">
            <Link to="/doctor/screenings">Xem toàn bộ screening</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Chọn bệnh nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Tìm bệnh nhân theo tên/số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2">
            <Label>Danh sách bệnh nhân</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Chọn bệnh nhân --</option>
              {patientOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.fullName || p.profileCode || p.id}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload và phân tích AI</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatientId ? (
            <AIXraySection patientId={selectedPatientId} />
          ) : (
            <p className="text-sm text-gray-500">
              Vui lòng chọn bệnh nhân trước khi upload ảnh X-ray.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ca screening gần đây (tôi tải lên)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(uploaded?.items || []).map((s) => (
            <div key={s.id} className="rounded-md border p-3 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {s.screeningNumber} · {screeningTypeLabel[s.screeningType]}
                </p>
                <p className="text-xs text-gray-500">
                  Tạo lúc {new Date(s.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor[s.status]}>{s.status}</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/doctor/screenings/${s.id}`}>Chi tiết</Link>
                </Button>
              </div>
            </div>
          ))}
          {(uploaded?.items || []).length === 0 && (
            <p className="text-sm text-gray-500">Chưa có ca screening nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiXrayPage;
