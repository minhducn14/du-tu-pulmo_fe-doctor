import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMyRecords } from '@/hooks/use-medical';
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
import { Search, FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function MedicalRecordPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: records, isLoading } = useMyRecords();

    const filteredRecords = records?.filter((record) => {
        const searchLower = search.toLowerCase();
        const patientName = record.patient?.user?.fullName || (record.patient as any)?.fullName || '';
        return (
            patientName.toLowerCase().includes(searchLower) ||
            record.recordNumber?.toLowerCase().includes(searchLower) ||
            record.primaryDiagnosis?.toLowerCase().includes(searchLower)
        );
    }) || [];



    return (
        <div className="flex flex-col h-full space-y-4">
            <PageHeader
                title="Hồ sơ bệnh án"
                subtitle="Các hồ sơ bệnh án gần đây do bạn khám."
            />

            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-md border w-full max-w-md">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên bệnh nhân, mã hồ sơ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>

                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Danh sách hồ sơ gần đây</CardTitle>
                        <CardDescription>Hiển thị 50 hồ sơ gần nhất.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã hồ sơ</TableHead>
                                    <TableHead>Ngày khám</TableHead>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Chẩn đoán chính</TableHead>
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
                                ) : filteredRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Không tìm thấy hồ sơ nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => navigate(`/doctor/medical-records/${record.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    <span>{record.recordNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', {
                                                            locale: vi,
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">
                                                        {record.patient?.user?.fullName || (record.patient as any)?.fullName || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="line-clamp-1" title={record.primaryDiagnosis || record.initialDiagnosis || ''}>
                                                    {record.primaryDiagnosis || record.initialDiagnosis || 'Chưa chẩn đoán'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                    {record.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
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
