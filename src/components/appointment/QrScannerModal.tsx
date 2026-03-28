import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QrCode, AlertCircle, Camera, RefreshCw } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
}

interface CameraDevice {
  id: string;
  label: string;
}

export const QrScannerModal = ({
  isOpen,
  onClose,
  onResult,
}: QrScannerModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Initialize device list
  useEffect(() => {
    if (isOpen) {
      Html5Qrcode.getCameras()
        .then((cameraDevices) => {
          if (cameraDevices && cameraDevices.length > 0) {
            setDevices(cameraDevices);
            // Auto-select DroidCam if found, otherwise the first one
            const droidCam = cameraDevices.find(d => 
              d.label.toLowerCase().includes("droidcam")
            );
            setSelectedDeviceId(droidCam ? droidCam.id : cameraDevices[0].id);
            setError(null);
          } else {
            setError("Không tìm thấy camera nào trên thiết bị.");
          }
        })
        .catch((err) => {
          console.error("Error fetching cameras:", err);
          setError("Không thể truy cập danh sách camera. Vui lòng cấp quyền.");
        });
    } else {
      stopScanning();
      setDevices([]);
      setSelectedDeviceId(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle scanning lifecycle
  useEffect(() => {
    if (isOpen && selectedDeviceId) {
      startScanning(selectedDeviceId);
    }
    return () => {
      stopScanning();
    };
  }, [isOpen, selectedDeviceId]);

  const startScanning = async (deviceId: string) => {
    try {
      if (html5QrCodeRef.current) {
        await stopScanning();
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        deviceId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        } as any,
        (decodedText) => {
          onResult(decodedText);
          handleClose();
        },
        () => {
          // Normal scan trial fails (expected)
        }
      );
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Failed to start scanning:", err);
      setIsScanning(false);
      setError("Không thể khởi động camera đã chọn. Thử camera khác?");
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              Quét mã QR Check-in
            </DialogTitle>
            <DialogDescription>
              Đưa mã QR từ ứng dụng bệnh nhân vào khung hình để tự động Check-in.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Camera className="h-3 w-3" /> Chọn Camera
            </label>
            <Select 
              value={selectedDeviceId || ""} 
              onValueChange={setSelectedDeviceId}
              disabled={devices.length === 0}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder={devices.length > 0 ? "Chưa chọn camera" : "Không có camera"} />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.label || `Camera ${device.id.slice(0, 5)}...`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full aspect-square border-2 border-dashed border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <div id="qr-reader" className="w-full h-full" />
            
            {error && (
              <div className="flex flex-col items-center gap-3 p-8 text-center text-red-500 z-10 bg-white inset-0 absolute items-center justify-center">
                <AlertCircle className="h-10 w-10" />
                <p className="text-sm font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tải lại trang
                </Button>
              </div>
            )}
            
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50/80">
                <p className="text-xs animate-pulse">Đang chuẩn bị camera...</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
