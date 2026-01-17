import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, User, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CreditCardForm = () => {
     const [cardData, setCardData] = useState({
          name: '',
          number: '',
          expiry: '',
          cvv: ''
     });

     const [isFlipped, setIsFlipped] = useState(false);

     const formatCardNumber = (value) => {
          const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
          const matches = v.match(/\d{4,16}/g);
          const match = matches && matches[0] || '';
          const parts = [];

          for (let i = 0, len = match.length; i < len; i += 4) {
               parts.push(match.substring(i, i + 4));
          }

          if (parts.length) {
               return parts.join(' ');
          } else {
               return value;
          }
     };

     const handleNumberChange = (e) => {
          const val = e.target.value;
          if (val.length <= 19) {
               setCardData({ ...cardData, number: formatCardNumber(val) });
          }
     };

     const handleExpiryChange = (e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val.length > 2) {
               val = val.substring(0, 2) + '/' + val.substring(2, 4);
          }
          if (val.length <= 5) {
               setCardData({ ...cardData, expiry: val });
          }
     };

     return (
          <div className="flex flex-col gap-8">
               <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Thanh Toán Thẻ</h2>
                    <p className="text-muted-foreground">Visa, MasterCard, JCB</p>
               </div>

               <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Card Visual */}
                    <div className="order-1 flex justify-center perspective-1000 py-4 lg:py-0">
                         <div className="w-full max-w-[340px] aspect-[1.586] relative cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                              <motion.div
                                   className="w-full h-full relative preserve-3d transition-all duration-700"
                                   initial={false}
                                   animate={{ rotateY: isFlipped ? 180 : 0 }}
                                   transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                              >
                                   {/* FRONT */}
                                   <div className="absolute w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between bg-[#1a1a1a] text-white shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/50">
                                        {/* Noise texture */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
                                        {/* Gradients */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl mix-blend-screen"></div>
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl mix-blend-screen"></div>

                                        <div className="flex justify-between items-start z-10">
                                             <div className="w-12 h-8 bg-gradient-to-tr from-yellow-200 to-yellow-600 rounded-md shadow-sm"></div>
                                             <div className="text-2xl font-black italic tracking-widest opacity-90 font-sans">VISA</div>
                                        </div>

                                        <div className="font-mono text-xl md:text-2xl tracking-widest z-10 w-full text-center py-2 text-white/90 drop-shadow-md">
                                             {cardData.number || '•••• •••• •••• ••••'}
                                        </div>

                                        <div className="flex justify-between items-end z-10">
                                             <div>
                                                  <span className="text-[9px] uppercase opacity-70 tracking-widest block mb-1 font-bold">Card Holder</span>
                                                  <span className="font-medium tracking-wider uppercase truncate max-w-[150px] block text-sm shadow-sm">
                                                       {cardData.name || 'YOUR NAME'}
                                                  </span>
                                             </div>
                                             <div className="text-right">
                                                  <span className="text-[9px] uppercase opacity-70 tracking-widest block mb-1 font-bold">Expires</span>
                                                  <span className="font-mono text-sm tracking-wide">{cardData.expiry || 'MM/YY'}</span>
                                             </div>
                                        </div>
                                   </div>

                                   {/* BACK */}
                                   <div className="absolute w-full h-full backface-hidden rounded-2xl flex flex-col justify-between bg-[#1a1a1a] text-white shadow-2xl rotate-y-180 overflow-hidden border border-white/10 ring-1 ring-black/50">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
                                        <div className="h-12 bg-black/90 mt-6 w-full relative z-10"></div>

                                        <div className="px-8 pb-8 relative z-10">
                                             <span className="text-[10px] uppercase opacity-70 tracking-widest block mb-1.5 text-right pr-1 font-bold">CVV</span>
                                             <div className="bg-white text-zinc-900 h-10 w-full rounded flex items-center justify-end px-3 font-mono tracking-widest font-bold text-lg shadow-inner">
                                                  {cardData.cvv || '•••'}
                                             </div>
                                             <div className="mt-5 flex justify-center opacity-40">
                                                  <CreditCard size={28} />
                                             </div>
                                        </div>
                                   </div>
                              </motion.div>
                         </div>
                    </div>

                    {/* Form Inputs */}
                    <form
                         className="order-2 flex flex-col gap-5 bg-card rounded-2xl md:p-1"
                         onSubmit={(e) => {
                              e.preventDefault();
                              if (cardData.name && cardData.number && cardData.expiry && cardData.cvv) {
                                   toast.success('Thanh toán thành công!', {
                                        description: 'Giao dịch của bạn đã được xử lý.',
                                        icon: <CheckCircle2 className="text-green-500" />
                                   });
                              } else {
                                   toast.error('Lỗi thanh toán', {
                                        description: 'Vui lòng điền đầy đủ thông tin thẻ.'
                                   });
                              }
                         }}
                    >
                         <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground">Chủ Thẻ</label>
                              <div className="relative">
                                   <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                   <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-semibold text-sm uppercase transition-all shadow-sm"
                                        placeholder="NGUYEN VAN A"
                                        value={cardData.name}
                                        onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                        onFocus={() => setIsFlipped(false)}
                                   />
                              </div>
                         </div>

                         <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground">Số Thẻ</label>
                              <div className="relative">
                                   <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                   <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-semibold font-mono text-sm transition-all shadow-sm"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardData.number}
                                        onChange={handleNumberChange}
                                        onFocus={() => setIsFlipped(false)}
                                   />
                              </div>
                         </div>

                         <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                   <label className="text-sm font-semibold text-foreground">Hết Hạn</label>
                                   <div className="relative">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                             type="text"
                                             className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-semibold text-center text-sm transition-all shadow-sm"
                                             placeholder="MM/YY"
                                             value={cardData.expiry}
                                             onChange={handleExpiryChange}
                                             onFocus={() => setIsFlipped(false)}
                                        />
                                   </div>
                              </div>

                              <div className="flex-1 space-y-2">
                                   <label className="text-sm font-semibold text-foreground">CVV</label>
                                   <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                             type="text"
                                             pattern="\d*"
                                             maxLength="3"
                                             className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-semibold text-center tracking-widest text-sm transition-all shadow-sm"
                                             placeholder="123"
                                             value={cardData.cvv}
                                             onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                             onFocus={() => setIsFlipped(true)}
                                        />
                                   </div>
                              </div>
                         </div>

                         <button className="mt-4 w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                              <ShieldCheck size={20} />
                              Xác Nhận Thanh Toán
                         </button>
                    </form>
               </div>
          </div>
     );
};

export default CreditCardForm;
