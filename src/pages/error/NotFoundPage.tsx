import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100/50">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-20 duration-3000"></div>
                <FileQuestion className="h-16 w-16 text-blue-600" />
            </div>

            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                404
            </h1>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
                Không tìm thấy trang
            </h2>

            <p className="mb-8 max-w-md text-base text-gray-600 sm:text-lg">
                Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến địa chỉ mới.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="group border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Quay lại
                </Button>

                <Button
                    size="lg"
                    onClick={() => navigate('/')}
                    className="bg-blue-600 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                    <Home className="mr-2 h-4 w-4" />
                    Trang chủ
                </Button>
            </div>

            <div className="mt-12 text-sm text-gray-400">
                Error Code: 404_NOT_FOUND
            </div>
        </div>
    );
};

export default NotFoundPage;
