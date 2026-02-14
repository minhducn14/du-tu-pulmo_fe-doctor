import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Medicine, CreateMedicineDto } from '@/types/medical';

const formSchema = z.object({
    name: z.string().min(2, 'Tên thuốc phải có ít nhất 2 ký tự'),
    goodsType: z.string().min(1, 'Loại vật tư là bắt buộc'), // e.g., THUOC, VATTU
    unit: z.string().min(1, 'Đơn vị tính là bắt buộc'),
    activeIngredient: z.string().optional(),
    content: z.string().optional(), // Hàm lượng
    packing: z.string().optional(), // Quy cách đóng gói
    manufacturer: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    description: z.string().optional(),
    guide: z.string().optional(),
    registrationNumber: z.string().optional(),
    group: z.string().optional(),
    route: z.string().optional(), // Đường dùng
    active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicine?: Medicine | null; // If present, it's edit mode
    onSubmit: (data: CreateMedicineDto) => Promise<void>;
}

export function MedicineDialog({
    open,
    onOpenChange,
    medicine,
    onSubmit,
}: MedicineDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            goodsType: 'THUOC',
            unit: '',
            activeIngredient: '',
            content: '',
            packing: '',
            manufacturer: '',
            countryOfOrigin: '',
            description: '',
            guide: '',
            registrationNumber: '',
            group: '',
            route: '',
            active: true,
        },
    });

    // Reset form when opening or changing medicine
    useEffect(() => {
        if (open) {
            if (medicine) {
                form.reset({
                    name: medicine.name,
                    goodsType: (medicine as any).goodsType || 'THUOC', // Use 'as any' if type missing in interface but present in data
                    unit: medicine.unit || '',
                    activeIngredient: (medicine as any).activeIngredient || '',
                    content: (medicine as any).content || '', // Strength/content
                    packing: medicine.packing || '',
                    manufacturer: medicine.manufacturer || '',
                    countryOfOrigin: (medicine as any).countryOfOrigin || '',
                    description: medicine.description || '',
                    guide: (medicine as any).guide || '',
                    registrationNumber: (medicine as any).registrationNumber || '',
                    group: (medicine as any).group || '',
                    route: (medicine as any).route || '',
                    active: medicine.isActive,
                });
            } else {
                form.reset({
                    name: '',
                    goodsType: 'THUOC',
                    unit: '',
                    activeIngredient: '',
                    content: '',
                    packing: '',
                    manufacturer: '',
                    countryOfOrigin: '',
                    description: '',
                    guide: '',
                    registrationNumber: '',
                    group: '',
                    route: '',
                    active: true,
                });
            }
        }
    }, [open, medicine, form]);

    const handleSubmit = async (values: FormValues) => {
        try {
            // Map form values to DTO
            const dto: CreateMedicineDto = {
                name: values.name,
                goodsType: values.goodsType,
                unit: values.unit,
                activeIngredient: values.activeIngredient,
                content: values.content,
                packing: values.packing,
                manufacturer: values.manufacturer,
                countryOfOrigin: values.countryOfOrigin,
                description: values.description,
                guide: values.guide,
                registrationNumber: values.registrationNumber,
                group: values.group,
                route: values.route,
                status: values.active,
            };
            await onSubmit(dto);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            // errors handled by parent usually, but hook toast handles it too
        }
    };

    const isEdit = !!medicine;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Cập nhật thuốc' : 'Thêm mơi thuốc'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Cập nhật thông tin thuốc trong danh mục.'
                            : 'Thêm thuốc mới vào danh mục hệ thống.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Tên thuốc <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: Panadol Extra" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activeIngredient"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hoạt chất</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Paracetamol" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hàm lượng</FormLabel>
                                        <FormControl>
                                            <Input placeholder="500mg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Đơn vị tính <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Viên / Vỉ / Hộp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="goodsType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="THUOC">Thuốc</SelectItem>
                                                <SelectItem value="VATTU">Vật tư y tế</SelectItem>
                                                <SelectItem value="TPCN">Thực phẩm chức năng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="route"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Đường dùng</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Uống / Tiêm / Bôi" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="packing"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quy cách đóng gói</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Hộp 10 vỉ x 10 viên" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="manufacturer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nhà sản xuất</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sanofi..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="countryOfOrigin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nước sản xuất</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Việt Nam..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="registrationNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số đăng ký</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD-..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Mô tả / Công dụng</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Mô tả thêm..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="guide"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Hướng dẫn sử dụng</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Cách dùng, liều dùng..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 col-span-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Kích hoạt
                                            </FormLabel>
                                            <DialogDescription>
                                                Thuốc này sẽ hiển thị trong danh sách kê đơn khi kích hoạt.
                                            </DialogDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {isEdit ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
