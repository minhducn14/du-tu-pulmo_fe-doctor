import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appointmentService } from "@/services/appointment.service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  appointmentNumber: string;
  onSuccess?: () => void;
}

export const CancelAppointmentModal = ({
  isOpen,
  onClose,
  appointmentId,
  appointmentNumber,
  onSuccess,
}: CancelAppointmentModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy lịch");
      return;
    }

    setIsSubmitting(true);
    try {
      await appointmentService.cancel(appointmentId, { reason: reason.trim() });
      toast.success(`Đã hủy lịch hẹn #${appointmentNumber} thành công`);
      onSuccess?.();
      onClose();
      setReason("");
    } catch (error: any) {
      console.error("Cancel appointment error:", error);
      const message = error.response?.data?.message || "Có lỗi xảy ra khi hủy lịch hẹn";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Xác nhận hủy lịch hẹn
          </DialogTitle>
          <DialogDescription>
            Bạn đang thực hiện hủy lịch hẹn <strong>#{appointmentNumber}</strong>. 
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do hủy lịch (ví dụ: Bác sĩ bận đột xuất, Lịch trùng...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
