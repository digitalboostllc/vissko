import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { Button } from './ui/button';

interface ExitIntentModalProps {
  onClose: () => void;
  onBuyClick: () => void;
}

export const ExitIntentModal = ({ onClose, onBuyClick }: ExitIntentModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsVisible(false)}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border border-amber-200">
              <Gift className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-center mb-4 leading-tight">
            Attendez ! Ne partez pas les mains vides.
          </h2>
          <p className="text-zinc-600 text-center mb-8 text-lg">
            Finalisez votre commande aujourd'hui et profitez de <strong className="text-black">-10% supplémentaires</strong> sur votre Vissko Fan.
          </p>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center mb-6">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Votre Code Promo</p>
            <div className="text-3xl font-black tracking-widest text-zinc-900 border-2 border-dashed border-zinc-300 rounded-xl py-3 bg-white">
              SAVE10
            </div>
            <p className="text-xs text-zinc-500 mt-3">Sera appliqué automatiquement au moment du paiement.</p>
          </div>

          <Button 
            className="w-full bg-black text-white hover:bg-zinc-800 text-lg font-bold py-6 rounded-full"
            onClick={() => {
              localStorage.setItem('vissko_coupon', 'SAVE10');
              onClose();
              onBuyClick();
            }}
          >
            Je profite de mes 10%
          </Button>
          
          <button 
            onClick={onClose}
            className="w-full text-center mt-4 text-sm text-zinc-500 hover:text-zinc-900 font-medium"
          >
            Non merci, je paierai le prix fort plus tard.
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
