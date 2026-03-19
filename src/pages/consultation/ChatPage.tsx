import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Send, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/use-chat';
import { patientService } from '@/services/patient.service';
import type { ChatRoom } from '@/types/chat';
import type { PatientResponse } from '@/types/patient';

function getDisplayInitial(fullName?: string): string {
  if (!fullName?.trim()) return '?';
  return fullName.trim().charAt(0).toUpperCase();
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getOtherParticipant(room: ChatRoom, currentUserId: string) {
  return room.user1.id === currentUserId ? room.user2 : room.user1;
}

export const ChatPage = () => {
  const {
    currentUserId,
    rooms,
    activeRoom,
    selectedRoomId,
    setSelectedRoomId,
    messages,
    onlineUserIds,
    typingUsersForActiveRoom,
    isSocketConnected,
    isLoadingRooms,
    isLoadingMessages,
    isCreatingRoom,
    sendMessage,
    emitTyping,
    createRoomWithParticipant,
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [patientKeyword, setPatientKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const lastTypingEmitAtRef = useRef(0);
  const messageBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(patientKeyword.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [patientKeyword]);

  const patientSearchQuery = useQuery({
    queryKey: ['chat', 'patients-search', debouncedKeyword],
    queryFn: async () => {
      const result = await patientService.getAll({
        page: 1,
        limit: 8,
        search: debouncedKeyword,
      });
      return result.items;
    },
    enabled: debouncedKeyword.length >= 2,
    staleTime: 10000,
  });

  const availablePatients = useMemo(() => {
    const items = patientSearchQuery.data ?? [];
    return items.filter((patient) => patient.user?.id && patient.user.id !== currentUserId);
  }, [currentUserId, patientSearchQuery.data]);

  useEffect(() => {
    messageBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedRoomId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitTyping(false);
        isTypingRef.current = false;
      }
    };
  }, [emitTyping]);

  const activeParticipant = useMemo(() => {
    if (!activeRoom || !currentUserId) return null;
    return getOtherParticipant(activeRoom, currentUserId);
  }, [activeRoom, currentUserId]);

  const handleCreateOrOpenRoom = async (patient: PatientResponse) => {
    if (!patient.user?.id) return;

    try {
      await createRoomWithParticipant(patient.user.id);
      setPatientKeyword('');
      setDebouncedKeyword('');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể tạo cuộc trò chuyện mới.';
      toast.error(errorMessage);
    }
  };

  const handleEmitTyping = (isTyping: boolean, force = false) => {
    if (!selectedRoomId) return;
    if (!force && isTypingRef.current === isTyping) return;

    const now = Date.now();
    if (!force && isTyping && now - lastTypingEmitAtRef.current < 300) return;

    lastTypingEmitAtRef.current = now;
    isTypingRef.current = isTyping;
    emitTyping(isTyping);
  };

  const handleMessageChange = (value: string) => {
    setMessageInput(value);
    handleEmitTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleEmitTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!selectedRoomId || !trimmed) return;
    if (trimmed.length > 5000) {
      toast.error('Nội dung tin nhắn tối đa 5000 ký tự.');
      return;
    }

    sendMessage(trimmed);
    setMessageInput('');
    handleEmitTyping(false, true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tin nhắn trao đổi"
        subtitle="Trao đổi trực tiếp với bệnh nhân qua chat"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-[calc(100vh-220px)] min-h-[560px]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-base">Cuộc trò chuyện</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={patientKeyword}
                onChange={(event) => setPatientKeyword(event.target.value)}
                className="pl-9"
                placeholder="Tìm bệnh nhân để chat"
              />
            </div>
            {debouncedKeyword.length >= 2 && (
              <div className="rounded-md border border-dashed p-2">
                <p className="mb-2 text-xs font-medium text-gray-500">Ket qua tim benh nhan</p>
                <div className="space-y-1">
                  {patientSearchQuery.isLoading &&
                    Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-full" />
                    ))}
                  {!patientSearchQuery.isLoading && availablePatients.length === 0 && (
                    <p className="text-xs text-gray-500">Không có bệnh nhân phù hợp.</p>
                  )}
                  {!patientSearchQuery.isLoading &&
                    availablePatients.map((patient) => (
                      <Button
                        key={patient.id}
                        variant="ghost"
                        className="h-auto w-full justify-start px-2 py-1.5 text-left"
                        disabled={isCreatingRoom}
                        onClick={() => void handleCreateOrOpenRoom(patient)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {patient.user?.fullName ?? 'Không rõ tên'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {patient.user?.phone || patient.profileCode || 'Không có thông tin phụ'}
                          </span>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="h-[calc(100%-170px)] pt-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                {isLoadingRooms &&
                  Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full rounded-md" />
                  ))}

                {!isLoadingRooms && rooms.length === 0 && (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                    Chưa có cuộc trò chuyện nào.
                  </div>
                )}

                {!isLoadingRooms &&
                  rooms.map((room) => {
                    const participant = getOtherParticipant(room, currentUserId);
                    const isActive = room.id === selectedRoomId;
                    const isOnline = onlineUserIds.has(participant.id);

                    return (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                          isActive
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getDisplayInitial(participant.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {participant.fullName || 'Không rõ tên'}
                          </p>
                          <p className="truncate text-xs text-gray-500">{participant.email || ' '}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-220px)] min-h-[560px]">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {activeParticipant?.fullName || 'Chọn cuộc trò chuyện'}
                </CardTitle>
                <p className="truncate text-sm text-gray-500">
                  {activeParticipant?.email || ' '}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  isSocketConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                )}
              >
                {isSocketConnected ? 'Đang hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex h-[calc(100%-86px)] flex-col gap-3 p-4">
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3">
                {!selectedRoomId && (
                  <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                    <MessageSquareText className="mb-2 h-8 w-8" />
                    <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
                  </div>
                )}

                {selectedRoomId && isLoadingMessages && (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                  </div>
                )}

                {selectedRoomId &&
                  !isLoadingMessages &&
                  messages.map((message) => {
                    const isMine = message.sender.id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-xl px-3 py-2 text-sm shadow-sm',
                            isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900',
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <div
                            className={cn(
                              'mt-1 flex items-center gap-2 text-[11px]',
                              isMine ? 'text-blue-100' : 'text-gray-500',
                            )}
                          >
                            <span>{formatDateTime(message.createdAt)}</span>
                            {isMine && message.status === 'sending' && <span>Đang gửi...</span>}
                            {isMine && message.status === 'failed' && (
                              <span className="font-medium text-red-200">Gửi lỗi</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {typingUsersForActiveRoom.length > 0 && (
                  <p className="px-1 text-xs text-gray-500">
                    {typingUsersForActiveRoom.map((item) => item.fullName).join(', ')} đang nhập...
                  </p>
                )}

                <div ref={messageBottomRef} />
              </div>
            </ScrollArea>

            <div className="space-y-2 border-t pt-3">
              <Textarea
                value={messageInput}
                onChange={(event) => handleMessageChange(event.target.value)}
                onBlur={() => handleEmitTyping(false, true)}
                onKeyDown={handleMessageKeyDown}
                rows={3}
                maxLength={5000}
                placeholder={
                  selectedRoomId
                    ? 'Nhập nội dung tin nhắn...'
                    : 'Chọn cuộc trò chuyện trước khi gửi tin nhắn.'
                }
                disabled={!selectedRoomId}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{messageInput.length}/5000 ky tu</p>
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!selectedRoomId || !messageInput.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Gui
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
