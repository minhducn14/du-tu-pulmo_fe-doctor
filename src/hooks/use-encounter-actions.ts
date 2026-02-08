import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
    mutationFn: (id: string) => appointmentService.startExamination(id),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['encounter', variables] });
      
      // Navigate to exam page
      navigate(`/doctor/encounters/${variables}/in-clinic`);
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
