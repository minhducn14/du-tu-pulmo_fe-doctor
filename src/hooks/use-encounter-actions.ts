import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type StartExamParams = { id: string; type?: string };

export function useEncounterActions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const checkInMutation = useMutation({
    mutationFn: (id: string) => appointmentService.checkIn(id),
    onSuccess: () => {
      toast.success('Check-in thành công');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi check-in');
    }
  });

  const startExamMutation = useMutation({
    mutationFn: (params: StartExamParams) => appointmentService.startExamination(params.id),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', params.id] });

      const route = params.type === 'VIDEO'
        ? `/doctor/encounters/${params.id}/video`
        : `/doctor/encounters/${params.id}/in-clinic`;
      navigate(route);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi bắt đầu khám');
    }
  });

  return {
    checkIn: checkInMutation.mutate,
    checkInAsync: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    
    startExam: startExamMutation.mutate,
    startExamAsync: startExamMutation.mutateAsync,
    isStartingExam: startExamMutation.isPending,
  };
}
