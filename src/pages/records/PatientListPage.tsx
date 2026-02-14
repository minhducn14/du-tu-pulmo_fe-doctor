import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    Eye,
} from 'lucide-react';
import { usePatients } from '@/hooks/use-patients';

function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getGenderLabel(g?: string) {
    if (g === 'MALE') return 'Nam';
    if (g === 'FEMALE') return 'Nữ';
    return g ?? '—';
}

export const PatientListPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = usePatients({ page, limit: 15, search: search || undefined });
    const totalPages = data?.meta?.totalPages ?? 1;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title="Danh sách bệnh nhân"
                subtitle="Quản lý thông tin và hồ sơ bệnh nhân"
            />

            {/* Search */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm theo tên, SĐT, mã bệnh nhân..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Mã BN</TableHead>
                                <TableHead>Họ tên</TableHead>
                                <TableHead>Giới tính</TableHead>
                                <TableHead>Ngày sinh</TableHead>
                                <TableHead>SĐT</TableHead>
                                <TableHead>Nhóm máu</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : !data?.items?.length ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                        <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                        <p>Không tìm thấy bệnh nhân nào</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((patient) => (
                                    <TableRow
                                        key={patient.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                                    >
                                        <TableCell className="font-mono text-sm text-blue-600">
                                            {patient.profileCode ?? '—'}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {patient.user?.fullName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={
                                                patient.user?.gender === 'MALE'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : patient.user?.gender === 'FEMALE'
                                                        ? 'bg-pink-50 text-pink-600'
                                                        : 'bg-gray-50 text-gray-600'
                                            }>
                                                {getGenderLabel(patient.user?.gender)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(patient.user?.dateOfBirth)}</TableCell>
                                        <TableCell className="text-gray-500">
                                            {patient.user?.phone ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {patient.bloodType ? (
                                                <Badge variant="outline" className="text-red-600 border-red-200">
                                                    {patient.bloodType}
                                                </Badge>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Trang {page}/{totalPages} · {data?.meta?.totalItems ?? 0} bệnh nhân
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientListPage;
