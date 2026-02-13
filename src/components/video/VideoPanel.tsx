import { useRef, useEffect } from 'react';
import { useVideoCall } from '@/hooks/use-video-call';
import { Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VideoPanelProps {
    appointmentId: string;
    onJoined?: () => void;
    onApiReady?: () => void;
}

export function VideoPanel({ appointmentId, onJoined, onApiReady }: VideoPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);
    const { status, error, joinCall } = useVideoCall({ onJoined, onApiReady });

    useEffect(() => {
        if (
            appointmentId &&
            containerRef.current &&
            !startedRef.current
        ) {
            startedRef.current = true;
            joinCall(appointmentId, containerRef.current);
        }
    }, [appointmentId, joinCall]);

    return (
        <Card className="h-full flex flex-col bg-slate-900 border-0 rounded-none overflow-hidden">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Video className="h-4 w-4 text-green-500" />
                    <span>Video Call</span>
                </div>
                <div className="text-xs text-slate-400">
                    {status === 'joining' && 'Đang kết nối...'}
                    {status === 'joined' && 'Đang gọi'}
                    {status === 'error' && 'Lỗi kết nối'}
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-black min-h-0">
                {/* The actual container for Daily Iframe */}
                <div ref={containerRef} className="absolute inset-0 z-10" />

                {/* Error State Overlay */}
                {status === 'error' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                        <VideoOff className="h-8 w-8 text-red-500 mb-2" />
                        <p className="text-sm font-medium mb-1">Không thể kết nối video</p>
                        <p className="text-xs text-slate-400 mb-3">{error}</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                startedRef.current = false;
                                if (containerRef.current) {
                                    joinCall(appointmentId, containerRef.current);
                                }
                            }}
                        >
                            Thử lại
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}

