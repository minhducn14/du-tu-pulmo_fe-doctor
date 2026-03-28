import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Button,
} from '@/components/ui/button';
import {
    Input,
} from '@/components/ui/input';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { 
    Search, 
    User, 
    Eye, 
    Printer,
    Filter,
    Plus,
    Clock,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { medicalService } from '@/services/medical.service';
import { PrescriptionStatusEnum } from '@/types/medical';
import { printPdfFromUrl } from '@/lib/print-utils';

export default function PrescriptionPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [printingId, setPrintingId] = useState<string | null>(null);

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['my-prescriptions'],
        queryFn: () => medicalService.getMyPrescriptions(),
    });

    const handlePrint = async (prescriptionId: string, existingPdfUrl?: string) => {
        try {
            setPrintingId(prescriptionId);
            let url = existingPdfUrl;
            
            if (!url) {
                const res = await medicalService.generatePrescriptionPdf(prescriptionId);
                url = res.pdfUrl;
            }
            
            if (url) {
                await printPdfFromUrl(url);
            } else {
                toast.error('Không tìm thấy đường dẫn file PDF');
            }
        } catch (error) {
            console.error('Print error:', error);
            toast.error('Lỗi khi chuẩn bị bản in');
        } finally {
            setPrintingId(null);
        }
    };

    const filteredPrescriptions = prescriptions?.filter(p => 
        p.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.patient?.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách Đơn thuốc</h1>
                    <p className="text-slate-500 mt-1">Quản lý các đơn thuốc đã kê cho bệnh nhân</p>
                </div>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                    onClick={() => {
                        toast.info('Để kê đơn thuốc mới, vui lòng bắt đầu phiên khám từ Hàng đợi khám');
                        navigate('/doctor/queue-manager');
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Kê đơn mới
                </Button>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm theo mã đơn, tên bệnh nhân..."
                                className="pl-9 bg-white border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-slate-600 border-slate-200">
                            <Filter className="h-4 w-4 mr-2" />
                            Bộ lọc
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="w-[150px] font-semibold text-slate-700">Mã đơn thuốc</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Bệnh nhân</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Ngày kê</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                            <TableRow key={i} className="border-slate-50">
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                ) : filteredPrescriptions?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                                            Không tìm thấy đơn thuốc nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPrescriptions?.map((prescription) => (
                                        <TableRow 
                                            key={prescription.id} 
                                            className="hover:bg-blue-50/30 transition-colors border-slate-50 cursor-pointer group"
                                            onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                                        >
                                            <TableCell className="font-medium text-blue-600">
                                                {prescription.prescriptionNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="font-medium text-slate-700">
                                                        {prescription.patient?.user?.fullName || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {format(new Date(prescription.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    prescription.status === PrescriptionStatusEnum.ACTIVE
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {prescription.status === PrescriptionStatusEnum.ACTIVE ? 'Đang hiệu lực' : 'Đã hủy'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/doctor/prescriptions/${prescription.id}`);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        disabled={printingId === prescription.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrint(prescription.id, prescription.pdfUrl);
                                                        }}
                                                    >
                                                        {printingId === prescription.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Printer className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
