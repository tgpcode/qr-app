import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react'; // Switched to Canvas for download support
import { ArrowLeft, Lightbulb, Droplets, Receipt, CheckCircle, Copy, WalletCards, ChevronDown, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateVietQR, cn } from '../lib/utils';

const BNPLGenerator = () => {
     const [step, setStep] = useState('form');
     const [formData, setFormData] = useState({
          type: 'electric',
          amount: '',
          provider: 'EVN',
          selectedWallet: ''
     });

     const qrRef = useRef(null);

     const handleSubmit = (e) => {
          e.preventDefault();
          if (formData.amount) {
               setStep('qr');
               toast.success('Đã tạo mã QR thành công!', {
                    description: `Mã thanh toán đã sẵn sàng.`,
               });
          }
     };

     const downloadQR = () => {
          const canvas = qrRef.current.querySelector('canvas');
          if (canvas) {
               const url = canvas.toDataURL("image/png");
               const link = document.createElement('a');
               link.download = `QR-PayFlow-${formData.provider}.png`;
               link.href = url;
               link.click();
          }
     };

     const services = [
          { id: 'electric', name: 'Điện', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/30', activeBg: 'bg-amber-50 dark:bg-amber-900/20' },
          { id: 'water', name: 'Nước', icon: Droplets, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/30', activeBg: 'bg-blue-50 dark:bg-blue-900/20' },
          { id: 'bill', name: 'Hóa đơn', icon: Receipt, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/30', activeBg: 'bg-purple-50 dark:bg-purple-900/20' },
     ];

     const wallets = [
          "MoMo", "ZaloPay", "Kredivo", "Fundiin",
          "Lio", "FE Credit", "HD Saison", "Home PayLater", "TNEX",
          "Cake", "HDBank", "SPayLater", "TPBank",
          "Muadee", "Viettel Money", "BVBank"
     ];

     // Generate robust QR Content
     const getQRValue = () => {
          const content = `Thanh toan ${formData.type} ${formData.provider}`;
          const amount = formData.amount || "0";

          if (formData.selectedWallet === 'MoMo') {
               // MoMo Transfer Deep Link Pattern
               return `momo://?action=transfer&to=0354424361&amount=${amount}&comment=${encodeURIComponent(content)}`;
          }

          // Default: Generate Standard VietQR (Compatible with all Banking Apps)
          return generateVietQR({
               bankBin: "970422", // MBBank
               bankNumber: "0354424361", // Demo Account
               amount: amount,
               content: content
          });
     };

     const qrValue = getQRValue();

     return (
          <div className="flex flex-col gap-8">
               <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Tạo QR Ví Trả Sau</h2>
                    <p className="text-muted-foreground">Thanh toán hóa đơn tiện lợi & nhanh chóng</p>
               </div>

               {step === 'form' ? (
                    <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="grid md:grid-cols-3 gap-8 items-start"
                    >
                         {/* Left Column: Services & Info */}
                         <div className="md:col-span-1 flex flex-col gap-6">
                              <div className="grid grid-cols-3 gap-3 md:flex md:flex-col">
                                   {services.map((s) => (
                                        <button
                                             key={s.id}
                                             type="button"
                                             className={cn(
                                                  "flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 p-3 md:p-4 rounded-2xl transition-all duration-300 outline-none h-full",
                                                  formData.type === s.id
                                                       ? "bg-card shadow-lg shadow-blue-500/10 scale-[1.02]"
                                                       : "bg-secondary/30 hover:bg-secondary/60"
                                             )}
                                             onClick={() => setFormData({ ...formData, type: s.id })}
                                        >
                                             <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                  formData.type === s.id ? s.bg : "bg-secondary")}>
                                                  <s.icon size={24} className={cn(formData.type === s.id ? s.color : "text-muted-foreground")} />
                                             </div>
                                             <div className="text-center md:text-left">
                                                  <span className={cn("block text-sm font-bold", formData.type === s.id ? "text-foreground" : "text-muted-foreground")}>
                                                       {s.name}
                                                  </span>
                                             </div>
                                        </button>
                                   ))}
                              </div>

                              <div className="hidden md:block p-5 bg-secondary/30 rounded-2xl border border-border">
                                   <div className="flex items-center gap-2.5 mb-4 text-muted-foreground">
                                        <WalletCards size={18} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Hỗ trợ thanh toán</span>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                        {wallets.slice(0, 10).map(w => (
                                             <span key={w} className="px-2.5 py-1 bg-background border border-border rounded-md text-[11px] font-semibold text-foreground shadow-sm cursor-default">
                                                  {w}
                                             </span>
                                        ))}
                                        <span className="px-2 py-1 text-[11px] text-muted-foreground">+6 khác</span>
                                   </div>
                              </div>
                         </div>

                         {/* Right Column: Form */}
                         <form onSubmit={handleSubmit} className="md:col-span-2 flex flex-col gap-6 bg-card rounded-2xl md:p-1">

                              <div className="space-y-3">
                                   <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Chọn Ví / Nguồn Tiền</span>
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded">Tùy chọn</span>
                                   </label>

                                   {/* Responsive Grid for Wallets */}
                                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                        {wallets.map((w) => (
                                             <button
                                                  key={w}
                                                  type="button"
                                                  onClick={() => setFormData({ ...formData, selectedWallet: w })}
                                                  className={cn(
                                                       "px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all truncate text-left relative overflow-hidden active:scale-95",
                                                       formData.selectedWallet === w
                                                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                            : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                                  )}
                                             >
                                                  {w}
                                                  {formData.selectedWallet === w && (
                                                       <motion.div layoutId="wallet-active" className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
                                                  )}
                                             </button>
                                        ))}
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">Nhà Cung Cấp</label>
                                        <div className="relative">
                                             <select
                                                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground appearance-none font-medium text-sm transition-all shadow-sm"
                                                  value={formData.provider}
                                                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                             >
                                                  <option value="EVN">EVN (Điện lực)</option>
                                                  <option value="VIETTEL">Viettel Post</option>
                                                  <option value="NUOC">Cty Nước sạch</option>
                                                  <option value="FPT">FPT Telecom</option>
                                                  <option value="VNPT">VNPT - Vinaphone</option>
                                             </select>
                                             <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>
                                   </div>


                              </div>

                              <div className="space-y-2">
                                   <label className="text-sm font-semibold text-foreground">Số Tiền (VNĐ)</label>
                                   <input
                                        type="number"
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-bold text-lg transition-all shadow-sm"
                                        placeholder="Nhập số tiền..."
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                   />
                              </div>

                              <button
                                   type="submit"
                                   className="mt-2 w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all text-base"
                              >
                                   Tạo Mã QR Thanh Toán
                              </button>
                         </form>
                    </motion.div>
               ) : (
                    <motion.div
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center gap-6 max-w-sm mx-auto w-full"
                    >
                         <div className="w-full bg-card rounded-3xl border border-border p-8 pb-10 flex flex-col items-center text-center shadow-xl relative overflow-hidden">

                              {/* Decorative bg blobs */}
                              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/80 rounded-full blur-3xl pointer-events-none"></div>

                              <button
                                   onClick={() => setStep('form')}
                                   className="absolute left-6 top-6 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all z-20"
                              >
                                   <ArrowLeft size={20} />
                              </button>

                              <div className="w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-500/5 dark:ring-green-500/10">
                                   <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
                              </div>

                              <h3 className="text-xl font-bold text-foreground mb-1">Mã QR Thanh Toán</h3>
                              <p className="text-muted-foreground text-sm mb-8 font-medium">
                                   Sẵn sàng quét
                              </p>

                              {/* QR Wrapper */}
                              <div ref={qrRef} className="p-6 bg-white rounded-3xl mb-8 shadow-sm relative group border border-slate-100">
                                   {/* Wallet Label on QR */}
                                   {formData.selectedWallet && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full border-4 border-white shadow-sm whitespace-nowrap z-10 tracking-wide uppercase">
                                             {formData.selectedWallet}
                                        </div>
                                   )}

                                   <QRCodeCanvas
                                        value={qrValue}
                                        size={220}
                                        level="H"
                                        includeMargin={true}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        className="w-full h-auto rounded-lg"
                                   />
                              </div>

                              <div className="w-full bg-secondary/50 rounded-xl p-4 space-y-3.5 border border-border/50 mb-6">
                                   <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Dịch vụ</span>
                                        <span className="font-bold text-foreground">{services.find(s => s.id === formData.type)?.name}</span>
                                   </div>

                                   {formData.selectedWallet && (
                                        <>
                                             <div className="w-full h-px bg-border/60"></div>
                                             <div className="flex justify-between items-center text-sm">
                                                  <span className="text-muted-foreground font-medium">Ví thanh toán</span>
                                                  <span className="font-bold text-primary">{formData.selectedWallet}</span>
                                             </div>
                                        </>
                                   )}

                                   <div className="w-full h-px bg-border/60"></div>



                                   <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Số tiền</span>
                                        <span className="font-extrabold text-lg text-primary">
                                             {parseInt(formData.amount).toLocaleString('vi-VN')} đ
                                        </span>
                                   </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 w-full gap-3">
                                   <button
                                        onClick={downloadQR}
                                        className="flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl transition-all active:scale-95 border border-border"
                                   >
                                        <Download size={18} />
                                        <span>Lưu ảnh</span>
                                   </button>
                                   <button
                                        onClick={() => {
                                             toast.success('Đã sao chép liên kết!', {
                                                  description: 'Đường dẫn chia sẻ đã được lưu vào clipboard.'
                                             });
                                        }}
                                        className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-primary/20"
                                   >
                                        <Share2 size={18} />
                                        <span>Chia sẻ</span>
                                   </button>
                              </div>
                         </div>

                         <button
                              onClick={() => setStep('form')}
                              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
                         >
                              Tạo mã thanh toán khác
                         </button>
                    </motion.div>
               )}
          </div>
     );
};

export default BNPLGenerator;
