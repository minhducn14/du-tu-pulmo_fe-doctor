import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import medicineService from '@/services/medicine.service';
import type { CreateMedicineDto, UpdateMedicineDto, FilterMedicineDto } from '@/types/medical';
import { toast } from 'sonner';

export const useMedicines = (filters?: FilterMedicineDto) => {
  const queryClient = useQueryClient();

  // Query: Get Medicines (Paginated)
  const medicinesQuery = useQuery({
    queryKey: ['medicines', filters],
    queryFn: () => medicineService.search(filters),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });

  // Mutation: Create Medicine
  const createMedicineMutation = useMutation({
    mutationFn: (dto: CreateMedicineDto) => medicineService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Thêm thuốc thành công');
    },
    onError: (error: any) => {
      toast.error('Lỗi thêm thuốc: ' + (error.response?.data?.message || error.message));
    },
  });

  // Mutation: Update Medicine
  const updateMedicineMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMedicineDto }) =>
      medicineService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Cập nhật thuốc thành công');
    },
    onError: (error: any) => {
      toast.error('Lỗi cập nhật thuốc: ' + (error.response?.data?.message || error.message));
    },
  });

  // Mutation: Delete Medicine
  const deleteMedicineMutation = useMutation({
    mutationFn: (id: string) => medicineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Xóa thuốc thành công');
    },
    onError: (error: any) => {
      toast.error('Lỗi xóa thuốc: ' + (error.response?.data?.message || error.message));
    },
  });

  return {
    medicines: medicinesQuery.data?.items || [],
    meta: medicinesQuery.data?.meta,
    isLoading: medicinesQuery.isLoading,
    isError: medicinesQuery.isError,
    error: medicinesQuery.error,
    createMedicine: createMedicineMutation.mutateAsync,
    updateMedicine: updateMedicineMutation.mutateAsync,
    deleteMedicine: deleteMedicineMutation.mutateAsync,
    isCreating: createMedicineMutation.isPending,
    isUpdating: updateMedicineMutation.isPending,
    isDeleting: deleteMedicineMutation.isPending,
  };
};

export const useMedicine = (id: string) => {
  return useQuery({
    queryKey: ['medicine', id],
    queryFn: () => medicineService.getById(id),
    enabled: !!id,
  });
};
