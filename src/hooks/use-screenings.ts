import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import screeningService from '@/services/screening.service';
import type { CreateConclusionDto, GetScreeningsQuery } from '@/types/screening';

export const SCREENING_KEYS = {
  all: ['screenings'] as const,
  list: (params?: GetScreeningsQuery) => ['screenings', 'list', params] as const,
  uploaded: (params?: GetScreeningsQuery) =>
    ['screenings', 'uploaded', params] as const,
  detail: (id: string) => ['screenings', 'detail', id] as const,
  images: (id: string) => ['screenings', 'images', id] as const,
  analyses: (id: string) => ['screenings', 'analyses', id] as const,
  conclusions: (id: string) => ['screenings', 'conclusions', id] as const,
};

export function useUploadedScreenings(params?: GetScreeningsQuery) {
  return useQuery({
    queryKey: SCREENING_KEYS.uploaded(params),
    queryFn: () => screeningService.getUploaded(params),
  });
}

export function useScreeningDetail(id?: string) {
  return useQuery({
    queryKey: SCREENING_KEYS.detail(id || ''),
    queryFn: () => screeningService.getById(id!),
    enabled: !!id,
  });
}

export function useScreeningImages(id?: string) {
  return useQuery({
    queryKey: SCREENING_KEYS.images(id || ''),
    queryFn: () => screeningService.getImages(id!),
    enabled: !!id,
  });
}

export function useScreeningAnalyses(id?: string) {
  return useQuery({
    queryKey: SCREENING_KEYS.analyses(id || ''),
    queryFn: () => screeningService.getAnalyses(id!),
    enabled: !!id,
  });
}

export function useScreeningConclusions(id?: string) {
  return useQuery({
    queryKey: SCREENING_KEYS.conclusions(id || ''),
    queryFn: () => screeningService.getConclusions(id!),
    enabled: !!id,
  });
}

export function useUploadAndAnalyze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: screeningService.uploadAndAnalyze,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCREENING_KEYS.all });
    },
  });
}

export function useCreateScreeningConclusion(screeningId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateConclusionDto) =>
      screeningService.createConclusion(screeningId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCREENING_KEYS.conclusions(screeningId),
      });
      queryClient.invalidateQueries({
        queryKey: SCREENING_KEYS.detail(screeningId),
      });
    },
  });
}
