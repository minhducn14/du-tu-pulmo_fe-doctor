import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer } from 'lucide-react';
import { medicalService } from '@/services/medical.service';

export const MedicalRecordDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: record, isLoading } = useQuery({
        queryKey: ['medical-record', id],
        queryFn: () => medicalService.getDetail(id!),
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

    if (!record) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <p className="text-gray-500 mb-4">Không tìm thấy hồ sơ bệnh án</p>
                <Button onClick={() => navigate('/doctor/medical-records')}>
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
                        <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/medical-records')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span>Hồ sơ bệnh án #{record.recordNumber}</span>
                    </div>
                }
                subtitle={`Ngày khám: ${new Date(record.createdAt).toLocaleDateString('vi-VN')}`}
                rightSlot={
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> In hồ sơ
                    </Button>
                }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Patient & Vitals */}
                <div className="space-y-6">
                    {/* Patient Info */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            Thông tin bệnh nhân
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Họ tên:</span>
                                <span className="font-medium">{record.patient.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Giới tính:</span>
                                <span>{record.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ngày sinh:</span>
                                <span>{new Date(record.patient.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="pt-2 border-t mt-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Bác sĩ:</span>
                                    <span className="font-medium">{record.doctor.fullName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                            Chỉ số sinh hiệu
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                                <span className="text-xs text-gray-500 block">Huyết áp</span>
                                <span className="font-bold text-lg text-gray-800">{record.vitalSigns.bloodPressure || '--/--'}</span>
                                <span className="text-xs text-gray-400 block">mmHg</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                                <span className="text-xs text-gray-500 block">Mạch</span>
                                <span className="font-bold text-lg text-gray-800">{record.vitalSigns.heartRate || '--'}</span>
                                <span className="text-xs text-gray-400 block">lần/phút</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                                <span className="text-xs text-gray-500 block">Nhiệt độ</span>
                                <span className="font-bold text-lg text-gray-800">{record.vitalSigns.temperature || '--'}</span>
                                <span className="text-xs text-gray-400 block">°C</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                                <span className="text-xs text-gray-500 block">SpO2</span>
                                <span className="font-bold text-lg text-gray-800">{record.vitalSigns.spo2 || '--'}</span>
                                <span className="text-xs text-gray-400 block">%</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center col-span-2">
                                <span className="text-xs text-gray-500 block">Cân nặng / Chiều cao</span>
                                <span className="font-bold text-gray-800">
                                    {record.vitalSigns.weight || '--'} kg / {record.vitalSigns.height || '--'} cm
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Clinical Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Diagnosis */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Chẩn đoán & Bệnh sử</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Lý do khám</h4>
                                <p className="text-gray-900 mt-1">{record.chiefComplaint || 'Không ghi nhận'}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase">Bệnh sử</h4>
                                    <p className="text-gray-900 mt-1">{record.presentIllness || 'Không ghi nhận'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 uppercase">Tiền sử bệnh</h4>
                                    <p className="text-gray-900 mt-1">{record.medicalHistory || 'Không ghi nhận'}</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-700 uppercase mb-2">Chẩn đoán</h4>
                                <p className="text-blue-900 font-medium text-lg">{record.diagnosis || record.initialDiagnosis || 'Chưa có chẩn đoán'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Lời dặn bác sĩ</h4>
                                <p className="text-gray-900 mt-1 bg-yellow-50 p-3 rounded border border-yellow-100 italic">
                                    {record.followUpInstructions || 'Không có lời dặn dò đặc biệt.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Prescriptions */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex justify-between items-center border-b pb-2">
                                <span>Đơn thuốc</span>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/doctor/prescriptions/${record.prescriptions[0].id}`)}>
                                    Xem chi tiết
                                </Button>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">Tên thuốc</th>
                                            <th className="px-4 py-2 text-center">Sáng</th>
                                            <th className="px-4 py-2 text-center">Trưa</th>
                                            <th className="px-4 py-2 text-center">Chiều</th>
                                            <th className="px-4 py-2 text-center">Tối</th>
                                            <th className="px-4 py-2 text-center">Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {record.prescriptions[0].items.map((item, idx) => {
                                            // Simple parser for frequency string like "Sáng 1, Tối 1"
                                            const getQty = (period: string) => {
                                                const match = item.frequency.match(new RegExp(`${period}\\s*(\\d+)`, 'i'));
                                                return match ? match[1] : '-';
                                            };
                                            return (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {item.medicineName}
                                                        <span className="block text-xs text-gray-500 font-normal">{item.dosage} - {item.unit}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{getQty('Sáng')}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{getQty('Trưa')}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{getQty('Chiều')}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{getQty('Tối')}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-blue-600">{item.quantity}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordDetailPage;
