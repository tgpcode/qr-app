import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Wallet, CreditCard, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

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
          setScanResult({
            data: code.data,
            type: 'success'
          });
          toast.success('Quét ảnh thành công!', {
            description: 'Đã tìm thấy mã QR trong ảnh của bạn.'
          });
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

  const resetScan = () => {
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Quét mã QR</h2>
        <p className="text-muted-foreground w-full max-w-xs mx-auto md:mx-0">Quét trực tiếp hoặc tải ảnh từ thư viện</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Scanner Area */}
        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center group ring-1 ring-white/10">

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

                <button
                  onClick={resetScan}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  Quét tiếp
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background / Mock Feed */}
          <div className="absolute inset-0 bg-black/40 z-0">
            <div className="w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          </div>

          {/* Scanner UI Elements */}
          {!scanResult && (
            <div className="relative w-56 h-56 md:w-64 md:h-64 z-10">
              <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-primary rounded-tl-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-primary rounded-tr-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-primary rounded-bl-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-primary rounded-br-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

              <motion.div
                className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-md ring-1 ring-white/20">
                  <Scan className="text-white w-8 h-8 opacity-80" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-4 px-6">
            <p className="text-sm font-medium text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              Di chuyển camera đến mã QR
            </p>
          </div>
        </div>

        {/* Upload Button & Features */}
        <div className="flex flex-col gap-5">
          {/* File Upload Button */}
          {/* File Upload Button */}
          <div>
            <button
              onClick={triggerFileUpload}
              disabled={isScanning}
              className="w-full bg-secondary/40 hover:bg-secondary/70 text-foreground py-4 px-6 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] border border-border/50"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              {isScanning ? (
                <Loader2 className="animate-spin text-primary" size={24} />
              ) : (
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm border border-border/50 shrink-0">
                  <ImageIcon size={22} />
                </div>
              )}
              <div className="text-left">
                <p className="font-bold text-base">Chọn ảnh từ thư viện</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hỗ trợ JPG, PNG</p>
              </div>
            </button>
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
