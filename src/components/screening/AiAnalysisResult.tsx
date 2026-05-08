import type { AiRiskLevel } from '@/types/screening';
import type { AiAnalysisResponse } from '@/types/screening';

interface Props {
    analysis: AiAnalysisResponse;
}

export default function AiAnalysisResult({ analysis }: Props) {
    const primary = analysis.primaryDiagnosis;
    const findings = analysis.findings || [];
    const grayZones = analysis.grayZoneNotes || [];

    const riskColorMap: Record<AiRiskLevel, string> = {
        Critical: 'bg-red-100 border-red-400 text-red-700',
        High: 'bg-orange-100 border-orange-400 text-orange-700',
        Warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        Benign: 'bg-green-100 border-green-400 text-green-700',
        Normal: 'bg-blue-100 border-blue-400 text-blue-700',
    };

    const riskColor = primary?.risk_level
        ? riskColorMap[primary.risk_level]
        : 'bg-blue-100 border-blue-400 text-blue-700';

    if (analysis.diagnosisStatus === 'ERROR') {
        return (
            <div className="border rounded-lg p-5 shadow-sm space-y-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-800">Lỗi phân tích AI</h3>
                        <p className="text-sm text-red-600 mt-1">
                            {analysis.errorMessage || 'Đã xảy ra lỗi trong quá trình phân tích hình ảnh.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-5 shadow-sm space-y-4">

            {/* PRIMARY */}
            {primary && (
                <div className={`rounded-lg border p-4 ${riskColor}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                            {primary.name_vn} ({primary.label})
                        </h3>
                        <span className="text-xs px-2 py-1 rounded bg-white/70 font-medium">
                            {primary.risk_level}
                        </span>
                    </div>

                    <p className="text-sm mt-1">
                        Xác suất: {primary.probability}
                    </p>

                    {primary.recommendation && (
                        <p className="text-sm italic mt-1">
                            {primary.recommendation}
                        </p>
                    )}
                </div>
            )}

            {/* FINDINGS */}
            {findings.length > 0 && (
                <div>
                    <p className="text-sm font-semibold mb-2">
                        Tổn thương phát hiện
                    </p>

                    <div className="space-y-3">
                        {findings.map((f: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{f.name_vn || f.label}</span>
                                    <span className="font-medium">
                                        {(f.probability * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded">
                                    <div
                                        className="h-2 rounded bg-red-400"
                                        style={{ width: `${f.probability * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GRAY ZONE */}
            {grayZones.length > 0 && (
                <div>
                    <p className="text-sm font-semibold mb-2 text-orange-600">
                        Vùng nghi ngờ (cần theo dõi)
                    </p>

                    <div className="space-y-3">
                        {grayZones.map((g: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{g.name_vn || g.label}</span>
                                    <span className="font-medium text-orange-600">
                                        {(g.probability * 100).toFixed(0)}% /
                                        {(g.required_threshold * 100).toFixed(0)}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-orange-100 rounded">
                                    <div
                                        className="h-2 rounded bg-orange-400"
                                        style={{ width: `${g.probability * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* IMAGE */}
            <div className="rounded-md border p-2 bg-black/90">
                <img src={analysis.evaluatedImageUrl} alt="xray" className="max-h-[360px] mx-auto object-contain" />
            </div>

            {/* FOOTER */}
            <div className="text-xs text-gray-500 pt-3 border-t">
                Tổng findings: {analysis.totalFindings}
            </div>
        </div>
    );
}