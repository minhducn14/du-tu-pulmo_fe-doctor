import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUploadedScreenings } from '@/hooks/use-screenings';
import AIXraySection from '@/components/medical/AIXraySection';
import { PatientCombobox } from '@/components/medical/PatientCombobox';
import type { ScreeningType, ScreeningStatus } from '@/types/screening';
import { 
  FileSearch, 
  History, 
  Search, 
  ArrowRight, 
  UserCheck
} from 'lucide-react';

const statusColor: Record<ScreeningStatus, string> = {
  UPLOADED: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING_AI: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  AI_PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200 px-3 animate-pulse',
  AI_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  AI_FAILED: 'bg-red-50 text-red-700 border-red-200',
  PENDING_DOCTOR: 'bg-orange-50 text-orange-700 border-orange-200',
  DOCTOR_REVIEWING: 'bg-purple-50 text-purple-700 border-purple-200',
  DOCTOR_COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const screeningTypeLabel: Record<ScreeningType, string> = {
  XRAY: 'X-ray Phổi',
  CT: 'Cắt lớp vi tính (CT)',
  MRI: 'Cộng hưởng từ (MRI)',
  ULTRASOUND: 'Siêu âm',
  OTHER: 'Khác',
};

export const AiXrayPage = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const { data: uploaded } = useUploadedScreenings({ page: 1, limit: 10 });

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>AI Chẩn đoán Hình ảnh</span>
          </div>
        }
        subtitle="Phân tích X-quang phổi bằng trí tuệ nhân tạo (du-tu-pulmo AI)"
        rightSlot={
          <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Link to="/doctor/screenings" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Lịch sử screening
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Patient Selection & Upload Section */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-figtree">Bệnh nhân & Tải lên</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-700">1. Chọn bệnh nhân để thực hiện phân tích</p>
                <PatientCombobox 
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-5 w-5 text-blue-500" />
                  <p className="text-sm font-medium text-slate-700">2. Upload file chẩn đoán (X-ray/DICOM)</p>
                </div>
                
                {selectedPatientId ? (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <AIXraySection patientId={selectedPatientId} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                      <UserCheck className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500 text-center max-w-[280px]">
                      Vui lòng chọn hoặc tìm kiếm bệnh nhân trước để bắt đầu quá trình phân tích AI.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Recent History Sidebar */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-figtree">Mới tải lên</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-mono">
                  {uploaded?.items?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-3">
              <div className="space-y-3">
                {(uploaded?.items || []).map((s) => (
                  <div 
                    key={s.id} 
                    className="group relative rounded-xl border border-slate-100 p-4 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/doctor/screenings/${s.id}`)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {s.screeningNumber}
                          </p>
                          <p className="font-semibold text-slate-900 text-sm">
                            {screeningTypeLabel[s.screeningType]}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${statusColor[s.status]} text-[10px] py-0 border-current font-medium`}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <Button 
                          asChild 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Link to={`/doctor/screenings/${s.id}`} className="flex items-center gap-1 text-[11px] font-bold">
                            Chi tiết <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(uploaded?.items || []).length === 0 && (
                  <div className="py-10 text-center space-y-2">
                    <History className="h-8 w-8 text-slate-200 mx-auto" />
                    <p className="text-xs text-slate-400">Chưa có dữ liệu gần đây.</p>
                  </div>
                )}
              </div>
              
              {(uploaded?.items || []).length > 0 && (
                <Button 
                  asChild 
                  variant="ghost" 
                  className="w-full mt-4 text-slate-500 hover:text-blue-600 text-xs font-medium"
                >
                  <Link to="/doctor/screenings">Xem tất cả</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AiXrayPage;
