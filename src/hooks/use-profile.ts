import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '@/services/user.service';
import doctorService from '@/services/doctor.service';
import type {
  UpdateDoctorProfileDto,
  UpdateUserProfileDto,
} from '@/types/profile';
import { useAppStore } from '@/store/useAppStore';

export const PROFILE_KEYS = {
  me: ['profile', 'me'] as const,
  doctor: (doctorId: string) => ['profile', 'doctor', doctorId] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: PROFILE_KEYS.me,
    queryFn: () => userService.getMe(),
  });
}

export function useDoctorProfile(doctorId?: string) {
  return useQuery({
    queryKey: PROFILE_KEYS.doctor(doctorId || ''),
    queryFn: () => doctorService.getById(doctorId!),
    enabled: !!doctorId,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { setUser, user: currentUser } = useAppStore();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserProfileDto }) =>
      userService.update(id, dto),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me });
      setUser({
        ...(currentUser || { id: user.id }),
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      });
    },
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  const { setUser, user: currentUser } = useAppStore();

  return useMutation({
    mutationFn: ({ doctorId, dto }: { doctorId: string; dto: UpdateDoctorProfileDto }) =>
      doctorService.update(doctorId, dto),
    onSuccess: (doctor, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROFILE_KEYS.doctor(doctor.id),
      });
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me });
      
      if (variables.dto.fullName && currentUser) {
        setUser({
          ...currentUser,
          fullName: variables.dto.fullName,
        });
      }
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { setUser, user: currentUser } = useAppStore();

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me });

      if (currentUser) {
        setUser({
          ...currentUser,
          avatarUrl: variables.avatarUrl
        });
      }
    },
  });
}
