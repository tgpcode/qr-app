import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { ScanLine, CreditCard, QrCode, Moon, Sun } from 'lucide-react';
import QRScanner from './components/QRScanner';
import BNPLGenerator from './components/BNPLGenerator';
import CreditCardForm from './components/CreditCardForm';
import LoadingSpinner from './components/LoadingSpinner';
import PromoCarousel from './components/PromoCarousel';
import { cn } from './lib/utils';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border transition-colors duration-300 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('scan')}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <ScanLine size={20} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Pay<span className="text-primary">Flow</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1.5 rounded-xl border border-border/50">
            {[
              { id: 'scan', icon: ScanLine, label: 'Quét QR' },
              { id: 'bnpl', icon: QrCode, label: 'Ví Trả Sau' },
              { id: 'card', icon: CreditCard, label: 'Thẻ Tín Dụng' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  activeTab === item.id
                    ? "bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
              {theme === 'light' ? <Moon size={22} strokeWidth={1.5} /> : <Sun size={22} strokeWidth={1.5} />}
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-background ring-2 ring-border shadow-sm">
              <img
                src="https://dichvuright.com/assets/images/anhdaidien.svg"
                alt="User"
                className="w-full h-full object-cover bg-secondary"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-28 md:pt-28 md:pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          <PromoCarousel />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="bg-card rounded-3xl border border-border/60 p-4 md:p-10 shadow-sm transition-colors duration-300">
                {activeTab === 'scan' && <QRScanner />}
                {activeTab === 'bnpl' && <BNPLGenerator />}
                {activeTab === 'card' && <CreditCardForm />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-center text-sm font-medium border-t border-slate-800">
        <p>
          &copy; 2025 Bản quyền thuộc về Gia Huy Co, Ltd. Việt Nam
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-50">
        <div className="bg-background/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-1.5 shadow-xl shadow-black/5 flex justify-around items-center ring-1 ring-black/5">
          {[
            { id: 'scan', icon: ScanLine, label: 'Scan' },
            { id: 'bnpl', icon: QrCode, label: 'Ví Trả Sau' },
            { id: 'card', icon: CreditCard, label: 'Thẻ' }
          ].map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-300 relative overflow-hidden",
                activeTab === item.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon
                size={22}
                strokeWidth={activeTab === item.id ? 2.5 : 1.5}
                className={cn("transition-transform duration-300", activeTab === item.id && "scale-110")}
              />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
