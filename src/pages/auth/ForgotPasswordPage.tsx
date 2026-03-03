import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPasswordOtp, useResetPasswordOtp } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const sendOtp = useForgotPasswordOtp();
  const resetOtp = useResetPasswordOtp();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendOtp.mutateAsync(email);
      toast.success('OTP đã được gửi nếu email tồn tại');
      setStep('reset');
    } catch {
      toast.error('Không thể gửi OTP');
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetOtp.mutateAsync({ email, otp, newPassword });
      toast.success('Đổi mật khẩu thành công');
      navigate('/login');
    } catch {
      toast.error('Không thể đặt lại mật khẩu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu (OTP)</CardTitle>
          <CardDescription>
            {step === 'request'
              ? 'Nhập email để nhận OTP'
              : 'Nhập OTP và mật khẩu mới'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'request' ? (
            <form onSubmit={onRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
                {sendOtp.isPending ? 'Đang gửi...' : 'Gửi OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetOtp.isPending}>
                {resetOtp.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          )}
          <div className="mt-4 text-sm text-center">
            <Link to="/login" className="text-emerald-600 hover:text-emerald-500">
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
