import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  useUploadAvatar,
} from '@/hooks/use-profile';
import { useTestPushNotification } from '@/hooks/use-notifications';
import type { ProfileFormValues } from '@/types/profile';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user } = useAppStore();
  const doctorId = user?.doctorId;
  const { data: doctor } = useDoctorProfile(doctorId);
  const updateDoctor = useUpdateDoctorProfile();
  const uploadAvatar = useUploadAvatar();
  const testPush = useTestPushNotification();

  const initialForm = useMemo<ProfileFormValues>(
    () => ({
      fullName: doctor?.fullName || '',
      email: doctor?.email || '',
      phone: doctor?.phone || '',
    }),
    [doctor],
  );
  console.log(initialForm);
  const [form, setForm] = useState<ProfileFormValues>(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (doctorId) {
        await updateDoctor.mutateAsync({
          doctorId,
          dto: {
            fullName: form.fullName || undefined,
            phone: form.phone || undefined
          },
        });
      }
      toast.success('Đã cập nhật hồ sơ');
    } catch {
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success('Đã cập nhật ảnh đại diện');
    } catch {
      toast.error('Không thể cập nhật ảnh đại diện');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ bác sĩ"
        subtitle="Quản lý thông tin cá nhân và tài khoản"
      />

      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor?.avatarUrl || user?.avatarUrl} />
            <AvatarFallback>{(doctor?.fullName || user?.fullName || 'D').charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <span className="text-sm text-blue-600">Tải ảnh mới</span>
            </Label>
            <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hồ sơ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Họ tên</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Chuyên khoa</Label>
              <Input
                value={doctor?.specialty}
                onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Học vị/chức danh</Label>
              <Input
                value={doctor?.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Chức vụ</Label>
              <Input
                value={doctor?.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                readOnly
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Chữ ký bác sĩ</Label>
              <Input value="Sắp hỗ trợ đồng bộ chữ ký" disabled />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={updateDoctor.isPending}
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo thử nghiệm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">Gửi một thông báo đẩy để kiểm tra tính năng thông báo thời gian thực.</p>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await testPush.mutateAsync({
                    title: '👨‍⚕️ Bác sĩ ơi!',
                    content: 'Đây là thông báo thử nghiệm từ hệ thống Doctor Portal.'
                  });
                  toast.success('Đã gửi thông báo thử nghiệm');
                } catch {
                  toast.error('Không thể gửi thông báo thử nghiệm');
                }
              }}
              disabled={testPush.isPending}
            >
              Gửi thông báo thử nghiệm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
