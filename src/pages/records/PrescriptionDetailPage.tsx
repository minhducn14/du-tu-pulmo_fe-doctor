import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer } from 'lucide-react';
import { medicalService } from '@/services/medical.service';

export const PrescriptionDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: prescription, isLoading } = useQuery({
        queryKey: ['prescription', id],
        queryFn: () => medicalService.getPrescriptionDetail(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <p className="text-gray-500 mb-4">Không tìm thấy toa thuốc</p>
                <Button onClick={() => navigate('/doctor/prescriptions')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/prescriptions')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span>Toa thuốc #{prescription.prescriptionNumber}</span>
                    </div>
                }
                subtitle={`Ngày kê: ${new Date(prescription.createdAt).toLocaleDateString('vi-VN')}`}
                rightSlot={
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> In toa thuốc
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            Thông tin hành chính
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500 block">Bệnh nhân</span>
                                <span className="font-medium text-base">{prescription.patient?.user?.fullName || '---'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Bác sĩ kê đơn</span>
                                <span className="font-medium">{prescription.doctor?.fullName || '---'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Chẩn đoán</span>
                                <span className="font-medium">{prescription.medicalRecord?.diagnosis || '---'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Meds */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Chi tiết đơn thuốc</h3>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">STT</th>
                                        <th className="px-4 py-2">Tên thuốc / Hoạt chất</th>
                                        <th className="px-4 py-2">Số lượng</th>
                                        <th className="px-4 py-2">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {prescription.items?.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{item.medicineName}</div>
                                                <div className="text-xs text-gray-500">{item.dosage}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-blue-600">
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700">{item.frequency}</div>
                                                {item.instructions && (
                                                    <div className="text-xs text-gray-500 italic mt-1">{item.instructions}</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List */}
                        <div className="md:hidden space-y-4">
                            {prescription.items?.map((item, idx) => (
                                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium">
                                            <span className="text-gray-400 mr-2">#{idx + 1}</span>
                                            {item.medicineName}
                                        </div>
                                        <span className="font-bold text-blue-600 shrink-0 ml-2">{item.quantity} {item.unit}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 pl-6 space-y-1">
                                        <p>{item.dosage} | {item.frequency}</p>
                                        {item.instructions && <p className="italic text-gray-500">"{item.instructions}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {prescription.notes && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                            <span className="font-bold mr-2">Lời dặn:</span>
                            {prescription.notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionDetailPage;
