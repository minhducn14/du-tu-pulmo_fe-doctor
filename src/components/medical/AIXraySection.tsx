import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, AlertTriangle, Loader2, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { medicalService } from '@/services/medical.service';
import type { UploadAnalyzeResponse, AiRiskLevel, AiFinding } from '@/types/screening';

interface AIXraySectionProps {
    patientId: string;
    screeningId?: string;
    medicalRecordId?: string;
    disabled?: boolean;
    onAnalysisComplete?: (result: UploadAnalyzeResponse) => void;
}

// Risk level styling
const RISK_COLORS: Record<AiRiskLevel, { bg: string; text: string; border: string; label: string }> = {
    Critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', label: 'NGUY HIEM' },
    High: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400', label: 'CAO' },
    Warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400', label: 'CANH BAO' },
    Benign: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400', label: 'LANH TINH' },
    Normal: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400', label: 'BINH THUONG' },
};

const RISK_PRIORITY: Record<AiRiskLevel, number> = {
    Critical: 4,
    High: 3,
    Warning: 2,
    Benign: 1,
    Normal: 0,
};

const getHighestRisk = (findings: AiFinding[] = [], primaryRisk?: AiRiskLevel): AiRiskLevel => {
    const all = primaryRisk ? [primaryRisk, ...findings.map(f => f.risk_level)] : findings.map(f => f.risk_level);
    const valid = all.filter(Boolean) as AiRiskLevel[];
    if (valid.length === 0) return 'Normal';
    return valid.reduce((max, cur) => (RISK_PRIORITY[cur] > RISK_PRIORITY[max] ? cur : max), valid[0]);
};

export function AIXraySection({ patientId, screeningId, medicalRecordId, disabled, onAnalysisComplete }: AIXraySectionProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<UploadAnalyzeResponse | null>(null);
    const [showBboxes, setShowBboxes] = useState(true);
    const [selectedImage, setSelectedImage] = useState<'original' | 'annotated' | 'evaluated'>('annotated');
    const [imageScale, setImageScale] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File quá lớn. Kích thước tối đa 10MB');
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setResult(null);
    }, []);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleRemoveFile = useCallback(() => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleAnalyze = useCallback(async () => {
        if (!file || !patientId) return;

        setAnalyzing(true);
        try {
            const resultRaw = await medicalService.analyzeXray(patientId, file, screeningId, undefined, medicalRecordId);
            setResult(resultRaw);
            onAnalysisComplete?.(resultRaw);

            const riskLevel = getHighestRisk(
                resultRaw.analysis.findings || [],
                resultRaw.analysis.primaryDiagnosis?.risk_level
            );

            if (riskLevel === 'Critical') {
                toast.error('CANH BAO: Phat hien bat thuong nguy hiem!', {
                    duration: 10000,
                });
            } else {
                toast.success('Phan tich hoan tat');
            }
        } catch (error: any) {
            console.error('AI Analysis error:', error);
            // Handle 403 Forbidden specifically if needed
            if (error?.response?.status === 403) {
                toast.error('Ban khong co quyen thuc hien phan tich nay');
            } else {
                toast.error(error.message || 'Loi khi phan tich X-ray');
            }
        } finally {
            setAnalyzing(false);
        }
    }, [file, patientId, screeningId, medicalRecordId, onAnalysisComplete]);


    const getCurrentImageUrl = useCallback(() => {
        if (!result) return previewUrl;
        const analysis = result.analysis;
        switch (selectedImage) {
            case 'annotated':
                return analysis.annotatedImageUrl || analysis.originalImageUrl || result.image.fileUrl;
            case 'evaluated':
                return analysis.evaluatedImageUrl || analysis.originalImageUrl || result.image.fileUrl;
            default:
                return analysis.originalImageUrl || result.image.fileUrl;
        }
    }, [result, selectedImage, previewUrl]);


    const riskLevel = result ? getHighestRisk(result.analysis.findings || [], result.analysis.primaryDiagnosis?.risk_level) : null;
    const riskStyle = riskLevel ? RISK_COLORS[riskLevel] : null;

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!file && (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-blue-400 cursor-pointer'
                        }`}
                    onClick={!disabled ? handleUploadClick : undefined}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={disabled}
                    />
                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <div className="text-sm text-slate-600 font-medium">
                        Nhấp để tải ảnh X-ray
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        Hỗ trợ: JPG, PNG, DICOM (tối đa 10MB)
                    </div>
                </div>
            )}

            {/* Image Preview + Actions */}
            {file && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-400">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {result && (
                                <>
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button
                                            className={`px-3 py-1.5 text-xs font-medium ${selectedImage === 'original' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                                            onClick={() => setSelectedImage('original')}
                                        >
                                            Gốc
                                        </button>
                                        <button
                                            className={`px-3 py-1.5 text-xs font-medium border-l ${selectedImage === 'annotated' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                                            onClick={() => setSelectedImage('annotated')}
                                        >
                                            Đánh dấu
                                        </button>
                                        <button
                                            className={`px-3 py-1.5 text-xs font-medium border-l ${selectedImage === 'evaluated' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                                            onClick={() => setSelectedImage('evaluated')}
                                        >
                                            Phân loại
                                        </button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBboxes(!showBboxes)}
                                    >
                                        {showBboxes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setImageScale(Math.max(0.5, imageScale - 0.25))}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-slate-500">{Math.round(imageScale * 100)}%</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setImageScale(Math.min(2, imageScale + 0.25))}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Risk Alert Banner */}
                    {riskLevel === 'Critical' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            <div>
                                <div className="font-medium text-red-800">⚠️ PHÁT HIỆN BẤT THƯỜNG NGUY HIỂM</div>
                                <div className="text-sm text-red-700">
                                    {result?.analysis.primaryDiagnosis?.label || 'Bat thuong'}
                                    - Cần xử lý cấp cứu
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Display */}
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                        <div className="flex items-center justify-center p-4" style={{ transform: `scale(${imageScale})`, transformOrigin: 'center' }}>
                            <img
                                src={getCurrentImageUrl() || previewUrl || ''}
                                alt="X-ray"
                                className="max-w-full max-h-[500px] object-contain"
                            />
                            {/* Overlay Bounding Boxes - only if showing original and showBboxes enabled */}
                            {result && showBboxes && selectedImage === 'original' && (
                                <svg
                                    className="absolute inset-0 pointer-events-none"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    {(result.analysis.findings || [])
                                        .filter((finding) =>
                                            finding.bbox &&
                                            [finding.bbox.x1, finding.bbox.y1, finding.bbox.x2, finding.bbox.y2].every(
                                                (v) => v >= 0 && v <= 100
                                            )
                                        )
                                        .map((finding, i) => {
                                            const color = RISK_COLORS[finding.risk_level || 'Warning'].border.replace('border-', '');
                                            return (
                                                <rect
                                                    key={i}
                                                    x={`${finding.bbox!.x1}%`}
                                                    y={`${finding.bbox!.y1}%`}
                                                    width={`${finding.bbox!.x2 - finding.bbox!.x1}%`}
                                                    height={`${finding.bbox!.y2 - finding.bbox!.y1}%`}
                                                    fill="none"
                                                    stroke={color}
                                                    strokeWidth="0.5"
                                                    className="animate-pulse"
                                                />
                                            );
                                        })}
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Analyze Button */}
                    {!result && (
                        <div className="flex justify-center">
                            <Button
                                onClick={handleAnalyze}
                                disabled={analyzing || disabled}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang phân tích...
                                    </>
                                ) : (
                                    '🔬 Phân tích AI'
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <Card className={`${riskStyle?.bg} ${riskStyle?.border} border`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className={`text-lg font-bold ${riskStyle?.text}`}>
                                                {result.analysis.diagnosisStatus === 'DETECTED' ? 'BAT THUONG' :
                                                    result.analysis.diagnosisStatus === 'UNCERTAIN' ? 'KHONG XAC DINH' :
                                                        result.analysis.diagnosisStatus === 'ERROR' ? 'LOI PHAN TICH' :
                                                            'DANG XU LY'}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                Mức độ rủi ro: <span className={`font-medium ${riskStyle?.text}`}>{riskStyle?.label}</span>
                                            </div>
                                        </div>
                                        <Badge className={`${riskStyle?.bg} ${riskStyle?.text} border ${riskStyle?.border}`}>
                                            {(result.analysis.findings || []).length} phat hien
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Findings List */}
                            {(result.analysis.findings || []).length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-slate-700">Kết quả phát hiện:</div>
                                    <div className="grid gap-2">
                                        {(result.analysis.findings || []).map((finding, i) => {
                                            const findingRisk = RISK_COLORS[finding.risk_level || 'Warning'];
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between p-3 rounded-lg border ${findingRisk.bg} ${findingRisk.border}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-lg ${findingRisk.text}`}>
                                                            {finding.risk_level === 'Critical' ? 'CRIT' :
                                                                finding.risk_level === 'High' ? 'HIGH' :
                                                                    finding.risk_level === 'Warning' ? 'WARN' : 'OK'}
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${findingRisk.text}`}>{finding.label}</div>
                                                            <div className="text-xs text-slate-500">{finding.name_vn}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm font-mono ${findingRisk.text}`}>
                                                        {(finding.probability * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {(result.analysis.findings || []).some(f => f.recommendation) && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-slate-700">Khuyến nghị:</div>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 bg-blue-50 rounded-lg p-4">
                                        {(result.analysis.findings || []).map((f) => f.recommendation).filter(Boolean).map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Performance Info */}
                            {typeof result.analysis.processingTimeMs === 'number' && (
                                <div className="text-xs text-slate-400 text-right">
                                    Thời gian xử lý: {result.analysis.processingTimeMs}ms
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AIXraySection;
