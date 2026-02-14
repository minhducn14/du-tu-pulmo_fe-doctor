import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyPrescriptions } from '@/hooks/use-medical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Pill, User, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PrescriptionPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: prescriptions, isLoading } = useMyPrescriptions();

    const filteredPrescriptions = prescriptions?.filter((prescription) => {
        const searchLower = search.toLowerCase();
        const patientName = (prescription as any).patient?.user?.fullName || (prescription as any).patient?.fullName || '';

        return (
            (patientName && patientName.toLowerCase().includes(searchLower)) ||
            prescription.prescriptionNumber?.toLowerCase().includes(searchLower) ||
            prescription.diagnosis?.toLowerCase().includes(searchLower)
        );
    }) || [];



    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Đơn thuốc</h1>
                    <p className="text-sm text-muted-foreground">
                        Quản lý và theo dõi các đơn thuốc đã kê.
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-md border w-full max-w-md">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên bệnh nhân, mã đơn..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>

                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Danh sách đơn thuốc gần đây</CardTitle>
                        <CardDescription>Hiển thị 50 đơn thuốc gần nhất.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã đơn thuốc</TableHead>
                                    <TableHead>Ngày kê</TableHead>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Chẩn đoán</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-12 animate-pulse bg-slate-50" />
                                        </TableRow>
                                    ))
                                ) : filteredPrescriptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Không tìm thấy đơn thuốc nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPrescriptions.map((prescription) => (
                                        <TableRow
                                            key={prescription.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Pill className="w-4 h-4 text-emerald-500" />
                                                    <span>{prescription.prescriptionNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {format(new Date(prescription.createdAt), 'dd/MM/yyyy HH:mm', {
                                                            locale: vi,
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">
                                                        {/* Accessing nested patient data if available, or just patientId if not */}
                                                        {(prescription as any).patient?.user?.fullName || (prescription as any).patient?.fullName || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="line-clamp-1" title={prescription.diagnosis || ''}>
                                                    {prescription.diagnosis || 'Chưa chẩn đoán'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {(prescription.status === 'FILLED' ? 'Đã cấp' :
                                                        prescription.status === 'CANCELLED' ? 'Đã hủy' : 'Hoạt động')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon">
                                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
