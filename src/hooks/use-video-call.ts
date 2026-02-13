import { useState, useCallback, useEffect, useRef } from 'react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'sonner';

export type VideoCallStatus = 'idle' | 'joining' | 'joined' | 'left' | 'error';

interface UseVideoCallOptions {
    onJoined?: () => void;
    onApiReady?: () => void;
}

interface UseVideoCallReturn {
    callObject: DailyCall | null;
    status: VideoCallStatus;
    error: string | null;
    joinCall: (appointmentId: string, containerRef: HTMLElement) => Promise<void>;
    leaveCall: (appointmentId?: string) => Promise<void>;
}

export function useVideoCall(options?: UseVideoCallOptions): UseVideoCallReturn {
    const [status, setStatus] = useState<VideoCallStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const callObjectRef = useRef<DailyCall | null>(null);
    const joiningRef = useRef(false);
    const appointmentIdRef = useRef<string | null>(null);
    const onJoinedRef = useRef(options?.onJoined);
    const onApiReadyRef = useRef(options?.onApiReady);

    useEffect(() => {
        onJoinedRef.current = options?.onJoined;
        onApiReadyRef.current = options?.onApiReady;
    }, [options?.onJoined, options?.onApiReady]);

    useEffect(() => {
        return () => {
            if (callObjectRef.current) {
                callObjectRef.current.destroy();
            }
            joiningRef.current = false;
        };
    }, []);

    const joinCall = useCallback(async (appointmentId: string, containerRef: HTMLElement) => {
        if (!appointmentId || !containerRef) return;
        if (joiningRef.current) return;

        joiningRef.current = true;
        appointmentIdRef.current = appointmentId;

        try {
            setStatus('joining');
            setError(null);

            const data = await appointmentService.joinVideo(appointmentId);

            if (!data?.url || !data?.token) {
                throw new Error('Không nhận được thông tin phòng họp từ hệ thống.');
            }

            onApiReadyRef.current?.();

            if (callObjectRef.current) {
                await callObjectRef.current.destroy();
                callObjectRef.current = null;
            }

            const callFrame = DailyIframe.createFrame(containerRef, {
                iframeStyle: {
                    width: '100%',
                    height: '100%',
                    border: '0',
                    borderRadius: '12px',
                },
                showLeaveButton: true,
                showFullscreenButton: true,
            });

            callObjectRef.current = callFrame;

            let hasJoined = false;
            let joinTimeout: ReturnType<typeof setTimeout> | null = null;

            const cleanup = () => {
                joiningRef.current = false;
                if (joinTimeout) {
                    clearTimeout(joinTimeout);
                    joinTimeout = null;
                }
            };

            callFrame.on('joined-meeting', () => {
                hasJoined = true;
                setStatus('joined');
                cleanup();
                onJoinedRef.current?.();
            });

            callFrame.on('left-meeting', () => {
                if (!hasJoined) {
                    setError('Kết nối bị ngắt trước khi tham gia');
                    setStatus('error');
                } else {
                    setStatus('left');
                    if (appointmentIdRef.current) {
                        appointmentService.leaveVideo(appointmentIdRef.current).catch(console.error);
                    }
                }
                cleanup();
            });

            callFrame.on('error', (e) => {
                console.error('Daily error:', e);
                const errorMsg = e?.errorMsg || e?.error?.msg || JSON.stringify(e);
                setError(errorMsg);
                setStatus('error');
                cleanup();
            });

            joinTimeout = setTimeout(() => {
                if (!hasJoined && joiningRef.current) {
                    setError('Hết thời gian kết nối. Vui lòng kiểm tra camera/mic và thử lại.');
                    setStatus('error');
                    cleanup();
                    if (callObjectRef.current) {
                        callObjectRef.current.destroy();
                        callObjectRef.current = null;
                    }
                }
            }, 30000);

            callFrame.join({
                url: data.url,
                token: data.token,
            }).catch((err) => {
                if (!hasJoined) {
                    setError(err?.message || 'Không thể join');
                    setStatus('error');
                    cleanup();
                    toast.error(err?.message || 'Join failed');
                }
            });

        } catch (err: any) {
            const msg = err?.response?.data?.message || err.message || 'Không thể thiết lập cuộc gọi.';
            setError(msg);
            setStatus('error');
            toast.error(msg);

            if (callObjectRef.current) {
                callObjectRef.current.destroy();
                callObjectRef.current = null;
            }
            joiningRef.current = false;
        }
    }, []);

    const leaveCall = useCallback(async (appointmentId?: string) => {
        const id = appointmentId || appointmentIdRef.current;

        if (callObjectRef.current) {
            await callObjectRef.current.destroy();
            callObjectRef.current = null;
        }

        if (id) {
            appointmentService.leaveVideo(id).catch(console.error);
        }

        setStatus('idle');
        joiningRef.current = false;
    }, []);

    return {
        callObject: callObjectRef.current,
        status,
        error,
        joinCall,
        leaveCall
    };
}