import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  useCreateScreeningConclusion,
  useScreeningAnalyses,
  useScreeningConclusions,
  useScreeningDetail,
  useScreeningImages,
} from '@/hooks/use-screenings';
import type { DecisionSource } from '@/types/screening';
import { toast } from 'sonner';
import AiAnalysisResult from '@/components/screening/AiAnalysisResult';

const decisionSources: DecisionSource[] = [
  'AI_ONLY',
  'DOCTOR_ONLY',
  'DOCTOR_REVIEWED_AI',
];

export default function ScreeningDetailPage() {
  const { id } = useParams();
  const { data: detail } = useScreeningDetail(id);
  const { data: images } = useScreeningImages(id);
  const { data: analyses } = useScreeningAnalyses(id);
  const { data: conclusions } = useScreeningConclusions(id);
  const createConclusion = useCreateScreeningConclusion(id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [agreesWithAi, setAgreesWithAi] = useState(true);
  const [decisionSource, setDecisionSource] =
    useState<DecisionSource>('DOCTOR_REVIEWED_AI');
  const [doctorOverrideReason, setDoctorOverrideReason] = useState('');

  // Sync latest override reason when conclusions load
  useEffect(() => {
    if (conclusions && conclusions.length > 0) {
      const latest = conclusions[conclusions.length - 1];
      setDoctorOverrideReason(latest.doctorOverrideReason || '');
      setAgreesWithAi(latest.agreesWithAi ?? true);
      setDecisionSource(latest.decisionSource ?? 'DOCTOR_REVIEWED_AI');
    }
  }, [conclusions]);

  const onSubmitConclusion = async () => {
    if (!id) return;

    // Domain validation
    if (agreesWithAi && decisionSource === 'DOCTOR_ONLY') {
      toast.error('Không thể chọn DOCTOR_ONLY khi đồng ý AI');
      return;
    }

    try {
      await createConclusion.mutateAsync({
        agreesWithAi,
        decisionSource,
        doctorOverrideReason: doctorOverrideReason || undefined,
      });

      // Reset form & close edit
      setDoctorOverrideReason('');
      setAgreesWithAi(true);
      setDecisionSource('DOCTOR_REVIEWED_AI');
      setIsEditing(false);

      toast.success('Đã lưu kết luận');
    } catch {
      toast.error('Không thể lưu kết luận');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chi tiết screening ${detail?.screeningNumber || ''}`}
        subtitle={detail?.status || ''}
      />

      {/* ================= ẢNH ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Ảnh</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(images || []).map((img) => (
            <div key={img.id} className="border rounded p-2">
              <img
                src={img.fileUrl}
                alt={img.fileName}
                className="w-full h-56 object-contain bg-black/90"
              />
              <p className="text-xs text-gray-500 mt-2">{img.fileName}</p>
            </div>
          ))}
          {(images || []).length === 0 && (
            <p className="text-sm text-gray-500">Chưa có ảnh.</p>
          )}
        </CardContent>
      </Card>

      {/* ================= AI ANALYSIS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Kết quả AI</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {(analyses || []).map((a) => (
            <AiAnalysisResult key={a.id} analysis={a} />
          ))}

          {(analyses || []).length === 0 && (
            <p className="text-sm text-gray-500">Chưa có phân tích AI.</p>
          )}
        </CardContent>
      </Card>


      {/* ================= DOCTOR CONCLUSIONS ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kết luận bác sĩ</CardTitle>

          {!isEditing && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Sửa kết luận
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ===== Timeline Conclusions ===== */}
          <div className="space-y-2">
            {(conclusions || [])
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((c, index, arr) => {
                const isLatest = index === arr.length - 1;

                return (
                  <div
                    key={c.id}
                    className={`rounded border p-3 text-sm space-y-1 ${isLatest ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {c.decisionSource}
                        {isLatest && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded">
                            Latest
                          </span>
                        )}
                      </span>
                      <span>
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="font-medium">
                      {c.agreesWithAi
                        ? 'Đồng ý AI'
                        : 'Không đồng ý AI'}
                    </div>

                    {c.doctorOverrideReason && (
                      <div className="text-xs text-orange-600">
                        Override: {c.doctorOverrideReason}
                      </div>
                    )}
                  </div>
                );
              })}

            {(conclusions || []).length === 0 && (
              <p className="text-sm text-gray-500">Chưa có kết luận.</p>
            )}
          </div>

          {/* ===== EDIT FORM ===== */}
          {isEditing && (
            <div className="border-t pt-4 space-y-3">
              <div className="space-y-2">
                <Label>Decision source</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={decisionSource}
                  onChange={(e) =>
                    setDecisionSource(e.target.value as DecisionSource)
                  }
                >
                  {decisionSources.map((s) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Đồng ý với AI</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={agreesWithAi ? 'yes' : 'no'}
                  onChange={(e) => setAgreesWithAi(e.target.value === 'yes')}
                >
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Lý do override (nếu có)</Label>
                <Input
                  disabled={agreesWithAi}
                  placeholder="Nhập lý do khi KHÔNG đồng ý AI"
                  value={doctorOverrideReason}
                  onChange={(e) =>
                    setDoctorOverrideReason(e.target.value)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onSubmitConclusion}
                  disabled={createConclusion.isPending}
                >
                  Lưu kết luận
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}