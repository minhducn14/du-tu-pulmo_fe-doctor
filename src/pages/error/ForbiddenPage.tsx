import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ShieldAlert, Lock } from 'lucide-react';

export const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-red-100/50">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-100 opacity-20 duration-3000"></div>
                <ShieldAlert className="h-16 w-16 text-red-600" />
            </div>

            <div className="mb-2 flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium uppercase tracking-widest text-gray-500">Access Denied</span>
            </div>

            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                403
            </h1>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
                Không có quyền truy cập
            </h2>

            <p className="mb-8 max-w-md text-base text-gray-600 sm:text-lg">
                Bạn không có đủ quyền hạn để xem trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="group border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                    Quay lại
                </Button>

                <Button
                    size="lg"
                    onClick={() => navigate('/')}
                    className="bg-red-600 shadow-lg shadow-red-600/20 transition-all hover:scale-105 hover:bg-red-700 hover:shadow-red-600/30"
                >
                    <Home className="mr-2 h-4 w-4" />
                    Về Trang chủ
                </Button>
            </div>

            <div className="mt-12 text-sm text-gray-400">
                Error Code: 403_FORBIDDEN
            </div>
        </div>
    );
};

export default ForbiddenPage;
