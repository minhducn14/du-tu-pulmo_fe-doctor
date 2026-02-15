import { useState } from 'react';
import { useMedicines } from '@/hooks/use-medicines';
import { PageHeader } from '@/components/layout/PageHeader';
import { MedicineDialog } from '@/components/medicine/MedicineDialog';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import type { Medicine, CreateMedicineDto } from '@/types/medical';

export default function MedicinePage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Debounce search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Simple debounce
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const {
        medicines,
        meta,
        isLoading,
        createMedicine,
        updateMedicine,
        deleteMedicine,
    } = useMedicines({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
    });

    const handleCreate = () => {
        setEditingMedicine(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (medicine: Medicine) => {
        setEditingMedicine(medicine);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await deleteMedicine(deleteId);
            setDeleteId(null);
        }
    };

    const handleSubmit = async (data: CreateMedicineDto) => {
        if (editingMedicine) {
            await updateMedicine({ id: editingMedicine.id, dto: data });
        } else {
            await createMedicine(data);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <PageHeader
                title="Quản lý thuốc & Vật tư"
                subtitle="Danh mục thuốc, thực phẩm chức năng và vật tư y tế."
                rightSlot={
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mới
                    </Button>
                }
            />

            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-md border w-full max-w-md">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm thuốc theo tên, hoạt chất..."
                        value={search}
                        onChange={handleSearchChange}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>

                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên thuốc / Hoạt chất</TableHead>
                                <TableHead>Phân loại</TableHead>
                                <TableHead>Đơn vị</TableHead>
                                <TableHead>Quy cách</TableHead>
                                <TableHead>Đăng ký</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7} className="h-12 animate-pulse bg-slate-50" />
                                    </TableRow>
                                ))
                            ) : medicines.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Không tìm thấy thuốc nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                medicines.map((medicine) => (
                                    <TableRow key={medicine.id}>
                                        <TableCell>
                                            <div className="font-medium">{medicine.name}</div>
                                            {(medicine as any).activeIngredient && (
                                                <div className="text-xs text-muted-foreground">
                                                    {(medicine as any).activeIngredient}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {(medicine as any).goodsType === 'VATTU' ? 'Vật tư' :
                                                    (medicine as any).goodsType === 'TPCN' ? 'TPCN' : 'Thuốc'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{medicine.unit}</TableCell>
                                        <TableCell>{medicine.packing || '-'}</TableCell>
                                        <TableCell>
                                            {(medicine as any).registrationNumber || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={medicine.isActive ? 'default' : 'secondary'}>
                                                {medicine.isActive ? 'Đang dùng' : 'Ngưng dùng'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(medicine)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDeleteClick(medicine.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {meta && (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!meta.hasPreviousPage}
                        >
                            Trước
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Trang {meta.currentPage} / {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!meta.hasNextPage}
                        >
                            Sau
                        </Button>
                    </div>
                )}
            </div>

            <MedicineDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                medicine={editingMedicine}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ hủy kích hoạt thuốc này khỏi hệ thống. Dữ liệu lịch sử sẽ không bị mất.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
