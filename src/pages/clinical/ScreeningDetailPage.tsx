import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useScreeningDetail,
  useScreeningImages,
  useScreeningAnalyses,
  useScreeningConclusions,
  useCreateScreeningConclusion,
} from '@/hooks/use-screenings';
import AiAnalysisResult from '@/components/screening/AiAnalysisResult';
import type { DecisionSource } from '@/types/screening';
import { 
  ChevronLeft, 
  BrainCircuit, 
  User, 
  Stethoscope, 
  ImageIcon,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScreeningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: screening, isLoading: loadingDetail } = useScreeningDetail(id);
  const { data: images } = useScreeningImages(id);
  const { data: analyses } = useScreeningAnalyses(id);
  const { data: conclusions } = useScreeningConclusions(id);
  const createConclusion = useCreateScreeningConclusion(id!);

  const [agreesWithAi, setAgreesWithAi] = useState<string>('true');
  const [decisionSource, setDecisionSource] = useState<DecisionSource>('DOCTOR_REVIEWED_AI');
  const [doctorOverrideReason, setDoctorOverrideReason] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [conclusion, setConclusion] = useState('');

  // Enforcement logic: Rejecting AI implies doctor must review or diagnose independently
  useEffect(() => {
    if (agreesWithAi === 'false' && decisionSource === 'AI_ONLY') {
      setDecisionSource('DOCTOR_REVIEWED_AI');
      toast.info('Nguồn quyết định được chuyển sang "Bác sĩ xem xét kết quả AI" vì bạn không đồng ý với AI');
    }
  }, [agreesWithAi, decisionSource]);


  const handleCreateConclusion = async () => {
    if (agreesWithAi === 'false' && !doctorOverrideReason.trim()) {
      toast.error('Cần nhập lý do khi không đồng ý với kết quả AI');
      return;
    }

    try {
      await createConclusion.mutateAsync({
        agreesWithAi: decisionSource === 'DOCTOR_ONLY' ? undefined : agreesWithAi === 'true',
        decisionSource,
        doctorOverrideReason: agreesWithAi === 'false' ? doctorOverrideReason : undefined,
        doctorNotes: doctorNotes || undefined,
        conclusion: conclusion || undefined,
      });
      toast.success('Ghi nhận kết luận chẩn đoán thành công');
      setDoctorOverrideReason('');
      setDoctorNotes('');
      setConclusion('');

    } catch {
      toast.error('Không thể ghi nhận kết luận');
    }
  };

  if (loadingDetail) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const latestAnalysis = analyses?.[0];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 -mb-4">
        <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
          <Link to="/doctor/screenings" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
      </div>

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Chi tiết Screening · {screening?.screeningNumber}</span>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {screening?.screeningType}
            </Badge>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1 text-slate-500">
              <User className="h-3.5 w-3.5" />
              <span>Bệnh nhân: <span className="font-bold text-slate-700">{screening?.patient?.user?.fullName}</span></span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual Content */}
          <Card className="border-none shadow-md bg-slate-900 overflow-hidden">
             <CardHeader className="bg-slate-800/50 border-b border-slate-700/50 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-200">
                        <ImageIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-bold uppercase tracking-widest">Phát hiện từ hình ảnh</span>
                    </div>
                    {latestAnalysis && (
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30">
                            AI Confidence: {(latestAnalysis.primaryDiagnosis?.probability || 0) * 100}%
                        </Badge>
                    )}
                </div>
             </CardHeader>
            <CardContent className="p-0 bg-black min-h-[400px] flex items-center justify-center relative group">
              {latestAnalysis?.evaluatedImageUrl ? (
                <img
                  src={latestAnalysis.evaluatedImageUrl}
                  alt="evaluated"
                  className="max-h-[600px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : images?.[0]?.fileUrl ? (
                <img
                  src={images[0].fileUrl}
                  alt="original"
                  className="max-h-[600px] w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 py-20">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                    <p>Không có hình ảnh chẩn đoán</p>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <Button size="sm" variant="secondary" className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700 backdrop-blur-sm">
                    <Search className="h-4 w-4 mr-1.5" /> Phóng to
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed AI Report */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-figtree">Báo cáo Phân tích AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {latestAnalysis ? (
                <AiAnalysisResult analysis={latestAnalysis} />
              ) : (
                <div className="text-center py-10 space-y-3">
                    <AlertCircle className="h-10 w-10 text-slate-200 mx-auto" />
                    <p className="text-sm text-slate-400">Chưa có kết quả phân tích AI cho ca này.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Doctor Conclusion Terminal */}
          <Card className="border-none shadow-lg bg-white overflow-hidden sticky top-8">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-figtree">Kết luận chẩn đoán</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {decisionSource !== 'DOCTOR_ONLY' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Đồng ý kết quả AI?</Label>
                    <Select 
                      value={agreesWithAi} 
                      onValueChange={setAgreesWithAi}
                      disabled={decisionSource === 'AI_ONLY'}
                    >
                      <SelectTrigger className={cn(
                        "w-full h-11 bg-slate-50 border-slate-200",
                        agreesWithAi === 'true' ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true" className="text-emerald-600 font-medium focus:text-emerald-600">
                          <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Đồng ý
                          </div>
                        </SelectItem>
                        <SelectItem value="false" className="text-red-600 font-medium focus:text-red-600">
                          <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4" /> Bác sĩ bác bỏ/điều chỉnh
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Nguồn quyết định</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px] text-xs">
                          Xác định vai trò của AI và Bác sĩ trong kết luận cuối cùng này.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    value={decisionSource} 
                    onValueChange={(val) => {
                      setDecisionSource(val as DecisionSource);
                      if (val === 'AI_ONLY') setAgreesWithAi('true');
                    }}
                  >
                    <SelectTrigger className="w-full h-auto min-h-[44px] py-2 bg-slate-50 border-slate-200 [&>span]:line-clamp-none text-left">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="DOCTOR_REVIEWED_AI">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Bác sĩ xem xét kết quả AI</span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5">AI hỗ trợ phát hiện, bác sĩ quyết định cuối</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DOCTOR_ONLY">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Bác sĩ chẩn đoán độc lập</span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5">Chẩn đoán không dựa trên gợi ý của AI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="AI_ONLY" disabled={agreesWithAi === 'false'}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Dùng hoàn toàn kết quả AI</span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 text-red-400/80">Chỉ khả dụng khi đồng ý với kết quả AI</span>
                        </div>
                      </SelectItem>
                    </SelectContent>

                  </Select>
                </div>


                {agreesWithAi === 'false' && decisionSource !== 'DOCTOR_ONLY' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase">
                        Lý do bác bỏ/điều chỉnh <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-[10px] text-red-500 font-medium italic">(Bắt buộc)</span>
                    </div>
                    <Textarea
                      placeholder="Nhập lý do chuyên môn cụ thể..."
                      value={doctorOverrideReason}
                      onChange={(e) => setDoctorOverrideReason(e.target.value)}
                      className="min-h-[100px] border-red-200 focus-visible:ring-red-200 bg-red-50/10"
                    />
                  </div>
                )}


                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Kết luận chẩn đoán cuối cùng</Label>
                  <Textarea
                    placeholder="Nhập kết luận chuyên môn cuối cùng cho ca này..."
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    className="min-h-[100px] bg-blue-50/30 border-blue-100 focus-visible:ring-blue-200 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Ghi chú thêm</Label>
                  <Textarea
                    placeholder="Ghi chú nội bộ hoặc lưu ý khác..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="min-h-[60px] bg-slate-50 border-slate-200"
                  />
                </div>

                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 group transition-all"
                  onClick={handleCreateConclusion}
                  disabled={createConclusion.isPending}
                >
                  {createConclusion.isPending ? 'Đang lưu...' : 'Xác nhận kết luận & hoàn tất'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

              </div>

              {/* Conclusion History */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lịch sử kết luận</h4>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                  {conclusions?.map((c) => (
                    <div key={c.id} className="relative pl-4 border-l-2 border-blue-100 py-1">
                      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-900">
                            {c?.doctor?.fullName}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                           {c.decisionSource === 'DOCTOR_ONLY' 
                            ? 'Chẩn đoán độc lập' 
                            : c.agreesWithAi ? 'Đồng ý với AI' : 'Điều chỉnh kết quả AI'}
                        </p>
                        {c.doctorOverrideReason && (
                          <p className="text-[10px] text-slate-400 italic bg-slate-50 p-1.5 rounded mt-1 border border-slate-100">
                            <strong>Lý do:</strong> "{c.doctorOverrideReason}"
                          </p>
                        )}
                        {c.conclusion && (
                          <p className="text-[11px] font-bold text-blue-700 bg-blue-50 p-2 rounded mt-2 border border-blue-100">
                            <strong>Kết luận:</strong> {c.conclusion}
                          </p>
                        )}
                        {c.doctorNotes && (
                          <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded mt-1 border border-slate-100">
                            <strong>Ghi chú:</strong> {c.doctorNotes}
                          </p>
                        )}

                      </div>
                    </div>
                  ))}
                  {conclusions?.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">Chưa có kết luận nào</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}