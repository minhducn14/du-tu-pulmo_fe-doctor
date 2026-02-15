
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Cài đặt"
                subtitle="Quản lý cấu hình và tùy chọn cá nhân"
            />

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cài đặt chung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="language">Ngôn ngữ</Label>
                            <Input id="language" defaultValue="Tiếng Việt" disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Múi giờ</Label>
                            <Input id="timezone" defaultValue="(GMT+07:00) Bangkok, Hanoi, Jakarta" disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bảo mật tài khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Đổi mật khẩu</Label>
                                <p className="text-sm text-muted-foreground">
                                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
                                </p>
                            </div>
                            <Button variant="outline">Đổi mật khẩu</Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Xác thực 2 lớp</Label>
                                <p className="text-sm text-muted-foreground">
                                    Tăng cường bảo mật với xác thực qua SMS/Email
                                </p>
                            </div>
                            <Button variant="outline" disabled>Sắp ra mắt</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
