import api from './api';
import type {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  FilterMedicineDto,
  PaginatedMedicines,
} from '@/types/medical';

/**
 * Medicine Service
 * Handles medicine catalog CRUD operations
 * @roles ADMIN, DOCTOR
 */
export const medicineService = {
  /**
   * Search and list medicines with pagination
   */
  search: async (query?: FilterMedicineDto): Promise<PaginatedMedicines> => {
    const response = await api.get<PaginatedMedicines>('/medicines', { params: query });
    return response.data;
  },

  /**
   * Get medicine by ID
   */
  getById: async (id: string): Promise<Medicine> => {
    const response = await api.get<Medicine>(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Create new medicine
   * @roles ADMIN
   */
  create: async (dto: CreateMedicineDto): Promise<Medicine> => {
    const response = await api.post<Medicine>('/medicines', dto);
    return response.data;
  },

  /**
   * Update medicine
   * @roles ADMIN
   */
  update: async (id: string, dto: UpdateMedicineDto): Promise<Medicine> => {
    const response = await api.patch<Medicine>(`/medicines/${id}`, dto);
    return response.data;
  },

  /**
   * Soft delete (deactivate) medicine
   * @roles ADMIN
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await api.delete<boolean>(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Quick search for autocomplete (name only)
   */
  quickSearch: async (searchTerm: string, limit = 10): Promise<Medicine[]> => {
    const result = await medicineService.search({
      search: searchTerm,
      limit,
      isActive: true,
    });
    return result.items;
  },
};

export default medicineService;
