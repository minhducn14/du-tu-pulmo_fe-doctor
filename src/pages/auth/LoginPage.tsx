import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/use-auth';
import { setRefreshToken, setToken } from '@/lib/auth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAppStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Use useLogin hook
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        loginMutation.mutate(formData, {
            onSuccess: (response) => {
                if (response.accessToken && response.refreshToken) {
                    setToken(response.accessToken);
                    setRefreshToken(response.refreshToken);

                    // Update Store (which also updates localStorage for User)
                    const userWithRoles = {
                        ...response.account.user,
                        roles: response.account.roles as any
                    };
                    setUser(userWithRoles);

                    toast.success('Đăng nhập thành công!');
                    navigate('/doctor');
                }
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
                toast.error(errorMessage);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Đăng Nhập Bác Sĩ</CardTitle>
                    <CardDescription className="text-center">
                        Nhập thông tin đăng nhập để tiếp tục
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
