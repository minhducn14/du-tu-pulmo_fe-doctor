import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadedScreenings } from '@/hooks/use-screenings';
import { PatientCombobox } from '@/components/medical/PatientCombobox';
import type { ScreeningType, ScreeningStatus, ScreeningPriority } from '@/types/screening';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  Activity,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const screeningTypeLabel: Record<ScreeningType, string> = {
  XRAY: 'X-ray Phổi',
  CT: 'Cắt lớp vi tính (CT)',
  MRI: 'Cộng hưởng từ (MRI)',
  ULTRASOUND: 'Siêu âm',
  OTHER: 'Khác',
};

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

const priorityColor: Record<ScreeningPriority, string> = {
  LOW: 'text-slate-500 bg-slate-50',
  NORMAL: 'text-blue-500 bg-blue-50',
  HIGH: 'text-orange-500 bg-orange-50',
  URGENT: 'text-red-500 bg-red-50 font-bold',
};

export default function ScreeningListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [patientId, setPatientId] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  const { data, isLoading } = useUploadedScreenings({
    page,
    limit: 10,
    patientId: patientId || undefined,
    status: status !== 'all' ? (status as ScreeningStatus) : undefined,
    screeningType: type !== 'all' ? (type as ScreeningType) : undefined,
  });

  console.log(data);

  const resetFilters = () => {
    setPatientId('');
    setStatus('all');
    setType('all');
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Lịch sử Screening</span>
          </div>
        }
        subtitle="Danh sách các ca chẩn đoán hình ảnh đã thực hiện"
        rightSlot={
          <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Link to="/doctor/ai-xray">Tải lên ca mới</Link>
          </Button>
        }
      />

      {/* Filters Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-figtree">Bộ lọc dữ liệu</CardTitle>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-slate-500 hover:text-blue-600 font-medium h-8"
            >
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <User className="h-3 w-3" /> Bệnh nhân
            </label>
            <PatientCombobox 
              value={patientId}
              onValueChange={(val) => {
                setPatientId(val);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <Activity className="h-3 w-3" /> Trạng thái
            </label>
            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="UPLOADED">Đã tải lên</SelectItem>
                <SelectItem value="AI_PROCESSING">AI đang xử lý</SelectItem>
                <SelectItem value="AI_COMPLETED">AI hoàn tất</SelectItem>
                <SelectItem value="PENDING_DOCTOR">Chờ bác sĩ kết luận</SelectItem>
                <SelectItem value="DOCTOR_COMPLETED">Bác sĩ hoàn tất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <Search className="h-3 w-3" /> Loại chẩn đoán
            </label>
            <Select value={type} onValueChange={(val) => { setType(val); setPage(1); }}>
              <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="XRAY">X-ray Phổi</SelectItem>
                <SelectItem value="CT">CT Scan</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="ULTRASOUND">Siêu âm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="w-[180px] font-bold text-slate-600 uppercase text-[10px] tracking-widest pl-6">Mã Screening</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Bệnh nhân</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Phân loại</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest text-center">Độ ưu tiên</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Trạng thái</TableHead>
                <TableHead className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Ngày tạo</TableHead>
                <TableHead className="w-[80px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (data?.items || []).map((item) => (
                <TableRow 
                  key={item.id} 
                  className="group border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/doctor/screenings/${item.id}`)}
                >
                  <TableCell className="pl-6 font-mono text-[13px] font-bold text-blue-600 italic">
                    {item.screeningNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 leading-none">
                        {item.patient?.user?.fullName || 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 font-mono">
                        {item.patient?.profileCode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-[13px] font-medium">
                    {screeningTypeLabel[item.screeningType]}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] border-none font-bold uppercase tracking-tighter ${priorityColor[item.priority]}`}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusColor[item.status]} border-current font-medium text-[10px] py-0 px-2.5`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-[12px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-300" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 group-hover:scale-110 transition-transform">
                      <Link to={`/doctor/screenings/${item.id}`}>
                        <Eye className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {!isLoading && (data?.items || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-slate-50 rounded-full">
                            <AlertCircle className="h-10 w-10 text-slate-200" />
                        </div>
                      <p className="text-slate-500 font-medium">Không tìm thấy dữ liệu phù hợp.</p>
                      <Button variant="outline" size="sm" onClick={resetFilters} className="text-blue-600 border-blue-200">
                        Xóa tất cả bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Container */}
      {(data?.meta?.totalPages || 0) > 1 && (
        <div className="flex items-center justify-between px-2">
            <p className="text-sm text-slate-500 font-medium font-figtree">
                Trang <span className="text-blue-600 font-bold">{data?.meta.currentPage}</span> / {data?.meta.totalPages}
                <span className="mx-2 text-slate-200">|</span>
                Tổng cộng <span className="text-slate-900 font-bold">{data?.meta.totalItems}</span> bản ghi
            </p>
            <div className="flex items-center gap-3">
                <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-xs"
                disabled={(data?.meta?.currentPage || 1) <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                </Button>
                
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(3, data?.meta.totalPages || 0) }).map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = (data?.meta.currentPage || 1) === pageNum;
                        return (
                            <Button 
                                key={pageNum}
                                variant={isCurrent ? "default" : "ghost"}
                                size="sm"
                                className={`h-8 w-8 p-0 rounded-md text-xs font-bold transition-all ${isCurrent ? 'bg-blue-600 shadow-md shadow-blue-100 hover:bg-blue-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                                onClick={() => { if (!isCurrent) setPage(pageNum); window.scrollTo(0, 0); }}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}
                    {(data?.meta.totalPages || 0) > 3 && <span className="text-slate-300 px-1">...</span>}
                </div>

                <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-xs"
                disabled={(data?.meta?.currentPage || 1) >= (data?.meta?.totalPages || 1)}
                onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
                >
                Sau <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
