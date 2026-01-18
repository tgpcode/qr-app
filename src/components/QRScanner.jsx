import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Wallet, CreditCard, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleScanSuccess = (codeData) => {
    // 1. Check for standard Deep Links / Protocols
    const deepLinkRegex = /^(http|https|ftp|mailto|tel|sms|momo|zalopay|vnpay|viettelmoney|bankplus|shopeepay|intent|itmss):/i;
    const urlLikeRegex = /^([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;

    let finalData = codeData;
    let isLink = false;
    let linkType = 'text';

    if (deepLinkRegex.test(codeData)) {
      isLink = true;
      linkType = 'app';
    } else if (urlLikeRegex.test(codeData)) {
      finalData = `https://${codeData}`;
      isLink = true;
      linkType = 'web';
    } else if (codeData.startsWith('000201')) {
      // VietQR detection
      toast.info('Mã thanh toán VietQR', { description: 'Có thể mở bằng App Ngân hàng.' });
    }

    setScanResult({
      data: finalData,
      type: 'success',
      isLink,
      linkType
    });

    stopCamera();
    toast.success('Đã tìm thấy mã!', { description: isLink ? 'Bấm nút để mở ứng dụng/liên kết.' : 'Quét thành công.' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleScanSuccess(code.data);
        } else {
          setScanResult({
            data: "Không tìm thấy mã QR trong ảnh này",
            type: 'error'
          });
          toast.error('Không tìm thấy QR', {
            description: 'Vui lòng thử lại với hình ảnh rõ nét hơn.'
          });
        }
        setIsScanning(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Camera Logic
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Trình duyệt không hỗ trợ", { description: "Vui lòng thử trình duyệt khác (Chrome/Safari)." });
        return;
      }

      // Try enabling rear camera with HD resolution preference
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true); // Critical for iOS
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      // Fallback: Try opening ANY camera if specific constraints fail
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          await videoRef.current.play();
          setCameraActive(true);
          requestAnimationFrame(tick);
        }
      } catch (fallbackErr) {
        toast.error("Không thể mở camera", { description: "Vui lòng cho phép quyền truy cập camera trong cài đặt trình duyệt." });
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        handleScanSuccess(code.data);
      } else {
        if (cameraActive) requestAnimationFrame(tick); // Continue scanning if strict active check passes, though standard logic is below
      }
    }
    // Keep loop running if camera is still conceptually active
    if (!scanResult) requestAnimationFrame(tick);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Update resetScan to restart camera? Or just reset state.
  // We'll leave resetScan simple, user can click "Start" again.

  return (
    <div className="flex flex-col gap-6 md:gap-8 mg:max-w-md md:mx-auto">
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Quét mã QR</h2>
        <p className="text-muted-foreground w-full max-w-xs mx-auto md:mx-0">Quét trực tiếp hoặc tải ảnh từ thư viện</p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8 md:max-w-md md:mx-auto">
        {/* Scanner Area - Mobile Only - LIVE CAMERA */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center group ring-1 ring-white/10 md:hidden">

          {/* Video Element */}
          <video
            ref={videoRef}
            className={cn("absolute inset-0 w-full h-full object-cover", !cameraActive && "opacity-0")}
            muted
            playsInline
          />

          {/* Start Camera Button Overlay */}
          {!cameraActive && !scanResult && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <button
                onClick={startCamera}
                className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse"
              >
                <Scan size={32} className="text-white" />
              </button>
              <p className="text-white font-medium mt-4">Chạm để quét</p>
            </div>
          )}

          {/* Result Overlay */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-2 z-30 bg-card/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-2xl border border-border"
              >
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                  scanResult.type === 'success' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {scanResult.type === 'success' ? <Scan size={32} /> : <X size={32} />}
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {scanResult.type === 'success' ? 'Quét thành công' : 'Không tìm thấy QR'}
                </h3>

                <p className="text-sm text-foreground/80 break-words w-full bg-secondary/50 p-3 rounded-xl border border-border mb-6 max-h-32 overflow-y-auto font-mono">
                  {scanResult.data}
                </p>

                <div className="flex flex-col gap-3 w-full">
                  {scanResult.isLink && (
                    <button
                      onClick={() => window.location.href = scanResult.data}
                      className="w-full px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
                    >
                      {scanResult.linkType === 'app' ? 'MỞ ỨNG DỤNG' : 'MỞ LIÊN KẾT'}
                    </button>
                  )}

                  <button
                    onClick={() => { resetScan(); stopCamera(); }}
                    className={cn(
                      "w-full px-6 py-2.5 font-semibold rounded-xl transition-all active:scale-95",
                      scanResult.isLink
                        ? "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    )}
                  >
                    Quét tiếp
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner UI Overlay (Lines) */}
          {cameraActive && !scanResult && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-primary/50 m-4 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-primary/50 m-4 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-primary/50 m-4 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-primary/50 m-4 rounded-br-2xl"></div>
              <motion.div
                className="absolute left-4 right-4 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                animate={{ top: ['15%', '85%', '15%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}
        </div>

        {/* Upload Button & Features */}
        <div className="flex flex-col gap-5">
          {/* Action Buttons */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={triggerCamera}
                disabled={isScanning}
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Scan size={20} />
                </div>
                <span className="font-bold text-sm">Chụp ảnh</span>
              </button>

              <button
                onClick={triggerFileUpload}
                disabled={isScanning}
                className="bg-secondary/40 hover:bg-secondary/70 text-foreground py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] border border-border/50"
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground shadow-sm border border-border">
                  <ImageIcon size={20} />
                </div>
                <span className="font-bold text-sm">Thư viện</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
              capture="environment"
            />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG</p>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Dịch vụ hỗ trợ</h3>

          <div className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card hover:bg-secondary/40 transition-colors shadow-sm cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
              <Wallet size={24} />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Ví Trả Sau</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">Điện, Nước, Internet & Hóa đơn</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card hover:bg-secondary/40 transition-colors shadow-sm cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Thẻ Tín Dụng</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">Visa, MasterCard, JCB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
