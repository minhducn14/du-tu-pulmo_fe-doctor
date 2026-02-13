/**
 * QueueCard Component
 * Display individual appointment card with proper CTA guards based on BE status
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AppointmentStatus,
    AppointmentType,
    CAN_START_EXAM_STATUSES,
    CAN_JOIN_VIDEO_STATUSES,
    CAN_MANAGE_EXAM_STATUSES,
    IS_COMPLETED_STATUS,
} from '@/lib/constants';
import { Clock, Video, Building2, MoreHorizontal, FileText, CheckCircle2, Play } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appointment } from '@/types/appointment';

interface QueueCardProps {
    item: Appointment;
    onStartExam?: (id: string) => void;
    onJoinVideo?: (id: string) => void;
    onComplete?: (id: string, type?: string) => void;
    onViewDetails?: (id: string) => void;
    onOpenRecord?: (id: string, type?: string) => void;
}

export function QueueCard({
    item,
    onStartExam,
    onJoinVideo,
    onComplete,
    onViewDetails,
    onOpenRecord,
}: QueueCardProps) {
    const getInitials = (name: string) => {
        if (!name) return 'BN';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isVideoAppointment = item.appointmentType === AppointmentType.VIDEO;
    const isInClinic = item.appointmentType === AppointmentType.IN_CLINIC;

    // Guard logic for CTA buttons
    const canStartExam = isInClinic && CAN_START_EXAM_STATUSES.includes(item.status);
    const canJoinVideo = isVideoAppointment && CAN_JOIN_VIDEO_STATUSES.includes(item.status);
    const canManageExam = CAN_MANAGE_EXAM_STATUSES.includes(item.status);
    const isCompleted = IS_COMPLETED_STATUS.includes(item.status);
    const isWaitingCheckIn = item.status === AppointmentStatus.CONFIRMED;

    const getStatusBadge = () => {
        switch (item.status) {
            case AppointmentStatus.CONFIRMED:
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ check-in
                    </Badge>
                );
            case AppointmentStatus.CHECKED_IN:
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Đã check-in
                    </Badge>
                );
            case AppointmentStatus.IN_PROGRESS:
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <span className="animate-pulse mr-1">◉</span> Đang khám
                    </Badge>
                );
            case AppointmentStatus.COMPLETED:
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        ✓ Hoàn thành
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">{item.status}</Badge>
                );
        }
    };

    const getTypeBadge = () => {
        return (
            <Badge
                variant="outline"
                className={
                    isVideoAppointment
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }
            >
                {isVideoAppointment ? (
                    <>
                        <Video className="w-3 h-3 mr-1" />
                        Video
                    </>
                ) : (
                    <>
                        <Building2 className="w-3 h-3 mr-1" />
                        Tại phòng
                    </>
                )}
            </Badge>
        );
    };

    // Get card border color based on status
    const getCardBorderColor = () => {
        if (canManageExam) return 'border-l-green-500';
        if (isCompleted) return 'border-l-gray-400';
        if (isWaitingCheckIn) return 'border-l-yellow-400';
        return 'border-l-blue-500';
    };

    const renderActionButtons = () => {
        // IN_PROGRESS: Show "Mở bệnh án" and "Hoàn tất khám"
        if (canManageExam) {
            return (
                <div className="flex gap-2">
                    <Button
                        onClick={() => onOpenRecord?.(item.id, item.appointmentType)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                    >
                        <FileText className="w-4 h-4 mr-1" />
                        MỞ BỆNH ÁN
                    </Button>
                    <Button
                        onClick={() => onComplete?.(item.id, item.appointmentType)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        HOÀN TẤT
                    </Button>
                </div>
            );
        }

        // CHECKED_IN + IN_CLINIC: Show "BẮT ĐẦU KHÁM"
        if (canStartExam) {
            return (
                <Button
                    onClick={() => onStartExam?.(item.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Play className="w-4 h-4 mr-2" />
                    BẮT ĐẦU KHÁM
                </Button>
            );
        }

        // CHECKED_IN + VIDEO: Show "VÀO VIDEO"
        if (canJoinVideo) {
            return (
                <Button
                    onClick={() => onJoinVideo?.(item.id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Video className="w-4 h-4 mr-2" />
                    VÀO VIDEO
                </Button>
            );
        }

        // COMPLETED: No action buttons
        if (isCompleted) {
            return null;
        }

        // CONFIRMED: Show "Chờ check-in" (disabled)
        if (isWaitingCheckIn) {
            return (
                <Button variant="outline" className="w-full opacity-60" disabled>
                    Chờ bệnh nhân check-in
                </Button>
            );
        }

        return null;
    };

    const patientName = item.patient?.user?.fullName || 'Bệnh nhân';
    const patientAvatar = item.patient?.user?.avatarUrl || '';

    return (
        <Card className={`mb-3 border-l-4 ${getCardBorderColor()} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
                {/* Header: Queue number, Type badge, Time */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">
                            STT {item.queueNumber?.toString().padStart(2, '0') || item.id.slice(-2)}
                        </span>
                        {getTypeBadge()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatTime(item.scheduledAt)}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onViewDetails?.(item.id)}>
                                    Xem chi tiết
                                </DropdownMenuItem>
                                {canManageExam && (
                                    <DropdownMenuItem onClick={() => onOpenRecord?.(item.id, item.appointmentType)}>
                                        Mở bệnh án
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={patientAvatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(patientName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                            {patientName}
                        </p>
                        {item.chiefComplaint && (
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[1.25rem]" title={item.chiefComplaint}>
                                <span className="font-medium">Lý do:</span> {item.chiefComplaint}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3 flex items-center gap-2">
                    {getStatusBadge()}

                    <span className="text-xs text-gray-400">
                        {item.timeSlot ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}` : ''}
                    </span>
                </div>

                {/* Action Buttons */}
                {renderActionButtons()}
            </CardContent>
        </Card>
    );
}
