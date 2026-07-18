import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

const mockSales = [
  { name: 'Marc', city: 'Paris', time: 'il y a 2 minutes' },
  { name: 'Sophie', city: 'Lyon', time: 'il y a 14 minutes' },
  { name: 'Jean', city: 'Marseille', time: 'il y a 31 minutes' },
  { name: 'Claire', city: 'Bordeaux', time: 'il y a 1 heure' },
  { name: 'Thomas', city: 'Lille', time: 'il y a 45 minutes' },
  { name: 'Marie', city: 'Nantes', time: 'il y a 8 minutes' },
];

export const LiveSalesPopup = () => {
  const [currentSale, setCurrentSale] = useState(mockSales[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before first popup
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, 15000); // Wait 15 seconds before first popup

    // Then loop randomly
    const interval = setInterval(() => {
      // Pick random sale
      const randomSale = mockSales[Math.floor(Math.random() * mockSales.length)];
      setCurrentSale(randomSale);
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, 45000); // Every 45 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 z-40 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-4 max-w-[300px] flex items-center gap-4 cursor-pointer hover:bg-zinc-50 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-bold text-emerald-600">Achat Vérifié</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-900 leading-tight">
              <strong>{currentSale.name}</strong> de {currentSale.city} vient d'acheter un Vissko Fan.
            </p>
            <span className="text-xs text-zinc-500 mt-1">{currentSale.time}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
