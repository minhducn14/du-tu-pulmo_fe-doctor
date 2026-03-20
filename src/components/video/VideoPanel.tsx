import { useRef, useEffect } from "react";
import { useVideoCall } from "@/hooks/use-video-call";
import { Card } from "@/components/ui/card";
import { Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPanelProps {
  appointmentId: string;
  onJoined?: () => void;
  onApiReady?: () => void;
}

export function VideoPanel({
  appointmentId,
  onJoined,
  onApiReady,
}: VideoPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const { status, error, joinCall } = useVideoCall({ onJoined, onApiReady });

  useEffect(() => {
    if (appointmentId && containerRef.current && !startedRef.current) {
      startedRef.current = true;
      joinCall(appointmentId, containerRef.current);
    }
  }, [appointmentId, joinCall]);

  return (
    <Card className="h-full flex flex-col bg-white border-b-2 border-white rounded-xl overflow-hidden shadow-sm relative">
      {/* Video Container */}
      <div className="flex-1 relative min-h-0 bg-white">
        {/* The actual container for Daily Iframe */}
        <div ref={containerRef} className="absolute inset-0 z-10" />

        {/* Loading Overlay */}
        {(status === "loading" || status === "idle") && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-600 animate-spin" />
              <Video className="absolute inset-0 m-auto h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-600">
              Đang kết nối video...
            </p>
          </div>
        )}

        {/* Error Overlay */}
        {status === "error" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-white">
            <VideoOff className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-bold text-slate-900 mb-1">Lỗi kết nối</p>
            <p className="text-[10px] text-slate-500 mb-4 max-w-[200px]">
              {error || "Đã xảy ra lỗi không xác định."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
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

