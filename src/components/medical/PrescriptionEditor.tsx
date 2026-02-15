import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { medicineService } from '@/services/medicine.service';
import type { Medicine, CreatePrescriptionDto, CreatePrescriptionItemDto, Prescription } from '@/types/medical';
import { Trash2, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';

interface PrescriptionEditorProps {
    appointmentId: string;
    onSave: (prescription: CreatePrescriptionDto) => void;
    loading?: boolean;
    initialData?: Prescription;
    onCancel?: () => void;
    initialDiagnosis?: string;
    disabled?: boolean;
}
export interface PrescriptionEditorHandle {
    hasUnsavedChanges: () => boolean;
    hasAnyItem: () => boolean;
    buildDto: () => CreatePrescriptionDto | null;
    resetDirty: () => void;
    reset: () => void;
}


interface PrescriptionItemState {
    medicineId?: string;
    medicineName: string;
    activeIngredient?: string;
    unit: string;
    durationDays: number;
    morning: number;
    noon: number;
    afternoon: number;
    evening: number;

    instructions?: string;
    notes?: string;

    quantity: number;
    dosageAmount: string;
}
function parseFrequency(freq: string) {
    const result = { morning: 0, noon: 0, afternoon: 0, evening: 0 };
    if (!freq) return result;

    const parts = freq.split(',').map(p => p.trim());
    parts.forEach(part => {
        const lower = part.toLowerCase();
        const num = parseInt(part.match(/\d+/)?.[0] || '0');
        if (lower.includes('sáng')) result.morning = num;
        else if (lower.includes('trưa')) result.noon = num;
        else if (lower.includes('chiều')) result.afternoon = num;
        else if (lower.includes('tối')) result.evening = num;
    });
    return result;
}

function parseDurationDays(duration?: string) {
    if (!duration) return 0;
    const match = duration.match(/\d+/);
    return match ? Number(match[0]) : 0;
}

function convertItemToDto(item: PrescriptionItemState): CreatePrescriptionItemDto {
    const freqParts = [];
    if (item.morning > 0) freqParts.push(`Sáng ${item.morning}`);
    if (item.noon > 0) freqParts.push(`Trưa ${item.noon}`);
    if (item.afternoon > 0) freqParts.push(`Chiều ${item.afternoon}`);
    if (item.evening > 0) freqParts.push(`Tối ${item.evening}`);

    const frequency = freqParts.length > 0 ? freqParts.join(', ') : 'Theo chỉ định';

    return {
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        dosage: item.dosageAmount || 'Theo chỉ định',
        frequency: frequency,
        duration: `${item.durationDays} ngày`,
        unit: item.unit || 'Viên',
        quantity: item.quantity > 0 ? item.quantity : 1,
        instructions: item.instructions,
    };
}

export const PrescriptionEditor = React.forwardRef<PrescriptionEditorHandle, PrescriptionEditorProps>(function PrescriptionEditor({

    onSave,
    loading = false,
    initialDiagnosis = '',
    disabled = false,
    initialData,
    onCancel
}: PrescriptionEditorProps, _ref) {
    const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<PrescriptionItemState[]>([]);

    const initialSnapshotRef = useRef<string>('');
    const [_isDirty, setIsDirty] = useState(false);

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [searching, setSearching] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial load sync
    useEffect(() => {
        if (initialData) {
            let rawNotes = initialData.notes || '';
            const loadedItems: PrescriptionItemState[] = (initialData.items || []).map(item => {
                const freq = parseFrequency(item.frequency);
                const duration = parseDurationDays(item.duration);
                return {
                    medicineId: item.medicineId || '',
                    medicineName: item.medicineName || '',
                    activeIngredient: '',
                    unit: item.unit || 'Vi?n',
                    dosageAmount: item.dosage,
                    durationDays: duration,
                    morning: freq.morning,
                    noon: freq.noon,
                    afternoon: freq.afternoon,
                    evening: freq.evening,
                    quantity: item.quantity || 0,
                    instructions: item.instructions,

                };
            });

            const nextDiagnosis = initialData.diagnosis || initialDiagnosis || '';
            const nextNotes = rawNotes;

            setNotes(nextNotes);
            setItems(loadedItems);
            setDiagnosis(nextDiagnosis);

            initialSnapshotRef.current = buildSnapshotFrom(nextDiagnosis, nextNotes, loadedItems);
            setIsDirty(false);

        } else {
            if (initialDiagnosis) setDiagnosis(initialDiagnosis);
            if (!initialSnapshotRef.current) {
                initialSnapshotRef.current = buildSnapshot();
                setIsDirty(false);
            }
        }
    }, [initialDiagnosis, initialData]);

    useEffect(() => {
        const search = async () => {
            setSearching(true);
            try {
                const results = await medicineService.quickSearch(searchQuery || '');
                setSearchResults(results);
            } catch (error) {
                console.error('Failed to search medicines:', error);
            } finally {
                setSearching(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const addMedicine = (medicine: Medicine) => {
        if (items.some((item) => item.medicineId === medicine.id)) {
            toast.info('Thuốc này đã được thêm vào đơn');
            setSearchOpen(false);
            return;
        }
        const newItem: PrescriptionItemState = {
            medicineId: medicine.id,
            medicineName: medicine.name,
            activeIngredient: medicine.genericName,
            unit: medicine.unit || 'Viên',
            dosageAmount: medicine.strength || '',
            durationDays: 5,
            morning: 0,
            noon: 0,
            afternoon: 0,
            evening: 0,
            quantity: 0,
            instructions: '',
            notes: '',
        };

        setItems([...items, newItem]);
        setSearchOpen(false);
        setSearchQuery('');
    };

    const updateItem = (index: number, field: keyof PrescriptionItemState, value: any) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;

            const newItem = { ...item, [field]: value };

            // Auto-calculate quantity if dosage fields change
            if (['durationDays', 'morning', 'noon', 'afternoon', 'evening'].includes(field as string)) {
                // If it's a number update
                const morning = field === 'morning' ? (value as number) : item.morning;
                const noon = field === 'noon' ? (value as number) : item.noon;
                const afternoon = field === 'afternoon' ? (value as number) : item.afternoon;
                const evening = field === 'evening' ? (value as number) : item.evening;
                const days = field === 'durationDays' ? (value as number) : item.durationDays;

                const totalDaily = (morning || 0) + (noon || 0) + (afternoon || 0) + (evening || 0);
                newItem.quantity = totalDaily * (days || 0);
            }

            return newItem;
        }));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const buildSnapshotFrom = (snapshotDiagnosis: string, snapshotNotes: string, snapshotItems: PrescriptionItemState[]) => {
        return JSON.stringify({
            diagnosis: snapshotDiagnosis,
            notes: snapshotNotes,
            items: snapshotItems.map((item) => ({
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                unit: item.unit,
                durationDays: item.durationDays,
                morning: item.morning,
                noon: item.noon,
                afternoon: item.afternoon,
                evening: item.evening,
                quantity: item.quantity,
                dosageAmount: item.dosageAmount,
                instructions: item.instructions,
            })),
        });
    };

    const buildSnapshot = () => buildSnapshotFrom(diagnosis, notes, items);

    React.useImperativeHandle(_ref, () => ({
        hasUnsavedChanges: () => {
            const currentSnapshot = buildSnapshot();
            return currentSnapshot !== initialSnapshotRef.current;
        },
        hasAnyItem: () => items.length > 0,
        buildDto: () => {
            if (items.length === 0) return null;
            const invalidItem = items.find((item) => {
                const totalDaily = (item.morning || 0) + (item.noon || 0) + (item.afternoon || 0) + (item.evening || 0);
                return totalDaily <= 0;
            });
            if (invalidItem) return null;

            return {
                diagnosis,
                notes,
                items: items.map(convertItemToDto),
            };
        },
        resetDirty: () => {
            initialSnapshotRef.current = buildSnapshot();
            setIsDirty(false);
        },
        reset: () => {
            setDiagnosis('');
            setNotes('');
            setItems([]);
            setSearchQuery('');
            setSearchResults([]);
            initialSnapshotRef.current = buildSnapshotFrom('', '', []);
            setIsDirty(false);
        }
    }));
    const handleSave = () => {
        if (!diagnosis.trim() && !initialData) {
            // toast.error('Vui lòng nhập chẩn đoán');
        }
        if (items.length === 0) {
            toast.error('Vui lòng thêm ít nhất một loại thuốc');
            return;
        }
        const invalidItem = items.find((item) => {
            const totalDaily = (item.morning || 0) + (item.noon || 0) + (item.afternoon || 0) + (item.evening || 0);
            return totalDaily <= 0;
        });
        if (invalidItem) {
            toast.error('Vui lòng nhập ít nhất 1 trong các lần dùng (sáng/trưa/chiều/tối).');
            return;
        }

        const prescription: CreatePrescriptionDto = {
            diagnosis,
            notes,
            items: items.map(convertItemToDto),
        };
        onSave(prescription);
    };

    return (
        <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center gap-2 mb-2 justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-600">
                        {initialData ? `CẬP NHẬT TOA THUỐC #${initialData.prescriptionNumber}` : 'KÊ TOA MỚI'}
                    </h3>
                </div>
                {initialData && (
                    <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        Hủy bỏ
                    </Button>
                )}
            </div>

            {/* Search Input - Full Width */}
            <div className="relative w-full" ref={searchContainerRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Tìm theo mã, tên hàng hóa, hoạt chất..."
                    className="pl-9 w-full bg-white"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!searchOpen) setSearchOpen(true);
                    }}
                    disabled={disabled}
                    onFocus={() => setSearchOpen(true)}
                />
                {searchOpen && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border rounded-md shadow-lg">
                        <Command>
                            <CommandList>
                                {searching && <CommandEmpty>Đang tìm kiếm...</CommandEmpty>}
                                {!searching && searchResults.length === 0 && <CommandEmpty>Không tìm thấy thuốc</CommandEmpty>}
                                <CommandGroup heading="Kết quả tìm kiếm">
                                    {searchResults.map((medicine) => (
                                        <CommandItem
                                            key={medicine.id}
                                            onSelect={() => addMedicine(medicine)}
                                            className="cursor-pointer py-3"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900">{medicine.name}</span>
                                                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                                                        {medicine.packing || 'Chưa có trong kho'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Hoạt chất: {medicine.genericName || '---'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    NSX: {medicine.manufacturer || '---'}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                )}
            </div>

            {/* Medicines Table */}
            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="w-[40px] text-center">::</TableHead>
                            <TableHead className="w-[40px] text-center"></TableHead>
                            <TableHead className="min-w-[200px]">Tên thuốc</TableHead>
                            <TableHead className="w-[80px] text-center">Số ngày</TableHead>
                            <TableHead className="w-[100px] text-center">Liều dùng</TableHead>

                            {/* Morning/Noon/Afternoon/Evening Grid */}
                            <TableHead className="w-[50px] text-center text-xs">Sáng</TableHead>
                            <TableHead className="w-[50px] text-center text-xs">Trưa</TableHead>
                            <TableHead className="w-[50px] text-center text-xs">Chiều</TableHead>
                            <TableHead className="w-[50px] text-center text-xs">Tối</TableHead>

                            <TableHead className="w-[140px] text-center">Tổng bán</TableHead>
                            <TableHead className="min-w-[150px]">Cách dùng thuốc</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="h-24 text-center text-gray-400 text-sm">
                                    Chưa có thuốc nào trong đơn
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => {
                                return (
                                    <TableRow key={index} className="hover:bg-gray-50 group">
                                        <TableCell className="px-1 text-center cursor-move text-gray-300">
                                            ⋮⋮
                                        </TableCell>
                                        <TableCell className="px-1 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-500 hover:bg-red-50"
                                                onClick={() => removeItem(index)}
                                                disabled={disabled}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">{item.medicineName}</span>
                                                {item.activeIngredient && (
                                                    <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                        {item.activeIngredient}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-1">
                                            <Input
                                                type="number"
                                                min={1}
                                                className="h-8 text-center bg-transparent focus:bg-white"
                                                value={item.durationDays}
                                                onChange={(e) => updateItem(index, 'durationDays', Number(e.target.value))}
                                                disabled={disabled}
                                            />
                                        </TableCell>
                                        <TableCell className="p-1">
                                            <Select
                                                value={item.unit}
                                                onValueChange={(val) => updateItem(index, 'unit', val)}
                                                disabled={disabled}
                                            >
                                                <SelectTrigger className="h-8 border-none bg-transparent shadow-none hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-blue-500 px-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={item.unit}>{item.unit}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>

                                        {/* Frequency Inputs */}
                                        <TableCell className="p-1"><Input type="number" min={0} className="h-8 text-center px-0 bg-transparent focus:bg-white" value={item.morning || ''} placeholder="0" onChange={(e) => updateItem(index, 'morning', Number(e.target.value))} disabled={disabled} /></TableCell>
                                        <TableCell className="p-1"><Input type="number" min={0} className="h-8 text-center px-0 bg-transparent focus:bg-white" value={item.noon || ''} placeholder="0" onChange={(e) => updateItem(index, 'noon', Number(e.target.value))} disabled={disabled} /></TableCell>
                                        <TableCell className="p-1"><Input type="number" min={0} className="h-8 text-center px-0 bg-transparent focus:bg-white" value={item.afternoon || ''} placeholder="0" onChange={(e) => updateItem(index, 'afternoon', Number(e.target.value))} disabled={disabled} /></TableCell>
                                        <TableCell className="p-1"><Input type="number" min={0} className="h-8 text-center px-0 bg-transparent focus:bg-white" value={item.evening || ''} placeholder="0" onChange={(e) => updateItem(index, 'evening', Number(e.target.value))} disabled={disabled} /></TableCell>

                                        <TableCell className="p-1">
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    className="h-8 w-14 text-center font-bold text-slate-700 px-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                    value={item.quantity}
                                                    readOnly
                                                    disabled={true}
                                                />
                                                <span className="text-sm text-slate-600 font-medium">{item.unit}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-1">
                                            <Input
                                                className="h-8 bg-transparent border-transparent hover:border-input focus:bg-white focus:border-input transition-all placeholder:text-slate-300"
                                                placeholder="Nhập cách dùng..."
                                                value={item.instructions}
                                                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                                disabled={disabled}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Notes */}
            <div className="mt-4">
                <Textarea
                    placeholder="Lời dặn của bác sĩ..."
                    className="min-h-[80px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={disabled}
                />
            </div>

            <div className="flex justify-end pt-2 gap-2">
                {initialData && (
                    <Button variant="outline" onClick={onCancel} disabled={loading}>
                        Hủy
                    </Button>
                )}
                <Button
                    onClick={handleSave}
                    disabled={disabled || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Lưu toa thuốc')}
                </Button>
            </div>
        </div>
    );
});

export default PrescriptionEditor;
