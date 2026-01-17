import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const images = [
     "https://sf-static.upanhlaylink.com/img/image_20260117774a589384e6dba5fd9bb7c0f80f8e80.jpg",
     "https://sf-static.upanhlaylink.com/img/image_2026011774980657ad474d8317e5167b90a97303.jpg"
];

const PromoCarousel = () => {
     const [currentIndex, setCurrentIndex] = useState(0);

     // Auto-slide effect
     useEffect(() => {
          const timer = setInterval(() => {
               nextSlide();
          }, 5000); // 5 seconds
          return () => clearInterval(timer);
     }, [currentIndex]);

     const prevSlide = () => {
          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
     };

     const nextSlide = () => {
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
     };

     const handleDragEnd = (event, info) => {
          if (info.offset.x > 50) {
               prevSlide();
          } else if (info.offset.x < -50) {
               nextSlide();
          }
     };

     return (
          <div className="relative w-full aspect-[2/1] md:aspect-[3/1] bg-secondary/30 rounded-2xl overflow-hidden mb-8 border border-border group touch-pan-y shadow-sm">
               <AnimatePresence initial={false} mode="popLayout">
                    <motion.img
                         key={currentIndex}
                         src={images[currentIndex]}
                         alt={`Slide ${currentIndex + 1}`}
                         className="absolute inset-0 w-full h-full object-fill"
                         initial={{ x: 300, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         exit={{ x: -300, opacity: 0 }}
                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
                         drag="x"
                         dragConstraints={{ left: 0, right: 0 }}
                         dragElastic={0.2}
                         onDragEnd={handleDragEnd}
                    />
               </AnimatePresence>

               {/* Navigation Arrows */}
               <button
                    onClick={prevSlide}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 active:scale-95"
               >
                    <ChevronLeft size={20} />
               </button>

               <button
                    onClick={nextSlide}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 active:scale-95"
               >
                    <ChevronRight size={20} />
               </button>

               {/* Dots Indicator */}
               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-1.5 bg-black/20 backdrop-blur-sm rounded-full">
                    {images.map((_, index) => (
                         <button
                              key={index}
                              onClick={() => setCurrentIndex(index)}
                              className={cn(
                                   "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                                   currentIndex === index ? "bg-white w-5" : "bg-white/50 hover:bg-white/80"
                              )}
                         />
                    ))}
               </div>
          </div>
     );
};

export default PromoCarousel;
