import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { medicalService } from '@/services/medical.service';
import type { UploadAnalyzeResponse } from '@/types/screening';
import AiAnalysisResult from '../screening/AiAnalysisResult';

interface AIXraySectionProps {
  patientId: string;
  screeningId?: string;
  medicalRecordId?: string;
  disabled?: boolean;
  onAnalysisComplete?: (result: UploadAnalyzeResponse) => void;
}

const isSupportedFile = (file: File) => {
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  const isDicomExt = name.endsWith('.dcm') || name.endsWith('.dicom');
  const isDicomMime = mime === 'application/dicom' || mime === 'image/dicom';
  return mime.startsWith('image/') || isDicomMime || isDicomExt;
};

export function AIXraySection({
  patientId,
  screeningId,
  medicalRecordId,
  disabled,
  onAnalysisComplete,
}: AIXraySectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<UploadAnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      if (!isSupportedFile(selected)) {
        toast.error('File không hợp lệ. Hỗ trợ image hoặc DICOM (.dcm)');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File quá lớn. Giới hạn 10MB');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
    },
    [],
  );

  const handleAnalyze = useCallback(async () => {
    if (!file || !patientId) return;
    setIsAnalyzing(true);
    try {
      const analyzed = await medicalService.analyzeXray(
        patientId,
        file,
        screeningId,
        undefined,
        medicalRecordId,
      );
      setResult(analyzed);
      onAnalysisComplete?.(analyzed);
      toast.success('Phân tích AI thành công');
    } catch {
      toast.error('Không thể phân tích AI');
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, patientId, screeningId, medicalRecordId, onAnalysisComplete]);

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!file && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".dcm,image/*,application/dicom,image/dicom"
            className="hidden"
            onChange={handleSelectFile}
          />
          <Upload className="h-10 w-10 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">Tải ảnh X-ray hoặc DICOM</p>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">{file.name}</div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl && (
            <div className="rounded-md border p-2 bg-black/90">
              <img src={previewUrl} alt="xray" className="max-h-[360px] mx-auto object-contain" />
            </div>
          )}

          {!result && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing || disabled}>
              {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isAnalyzing ? 'Đang phân tích...' : 'Phân tích AI'}
            </Button>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Kết quả AI · {result.analysis.totalFindings || 0} phát hiện
                </CardTitle>
              </CardHeader>

              <CardContent>
                <AiAnalysisResult analysis={result.analysis} />
              </CardContent>

              <CardContent>
                <div className="rounded-md border p-2 bg-black/90">
                  <img src={result.analysis.evaluatedImageUrl} alt="xray" className="max-h-[360px] mx-auto object-contain" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default AIXraySection;
