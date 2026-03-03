import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUploadedScreenings } from '@/hooks/use-screenings';
import type { ScreeningType } from '@/types/screening';

const screeningTypeLabel: Record<ScreeningType, string> = {
  XRAY: 'X-ray',
  CT: 'CT',
  MRI: 'MRI',
  ULTRASOUND: 'Sieu am',
  OTHER: 'Khac',
};

export default function ScreeningListPage() {
  const [page, setPage] = useState(1);
  const [patientId, setPatientId] = useState('');
  const { data, isLoading } = useUploadedScreenings({
    page,
    limit: 15,
    patientId: patientId || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách screening"
        subtitle='Mặc định hiển thị "Tôi tải lên"'
      />
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Lọc theo patientId (tùy chọn)"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-sm text-gray-500">Đang tải...</p>
          ) : (
            <div className="divide-y">
              {(data?.items || []).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{item.screeningNumber}</p>
                    <p className="text-xs text-gray-500">
                      {screeningTypeLabel[item.screeningType]} · {item.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.priority}</Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/doctor/screenings/${item.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(data?.items || []).length === 0 && (
                <p className="p-4 text-sm text-gray-500">Không có dữ liệu.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={(data?.meta?.currentPage || 1) <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={(data?.meta?.currentPage || 1) >= (data?.meta?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
