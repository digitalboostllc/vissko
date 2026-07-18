import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StickyCTAProps {
  onBuyClick: (qty: number) => void
}

export const StickyCTA = ({ onBuyClick }: StickyCTAProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar after scrolling past the hero section (roughly 800px)
      if (window.scrollY > 800) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-auto max-w-md bg-white/95 backdrop-blur-xl border border-black/10 rounded-full z-50 p-2 pl-6 flex items-center justify-between gap-6"
        >
          <div className="flex flex-col">
            <span className="text-xs text-black/60 font-bold uppercase tracking-wider mb-1">
              Offre Flash
            </span>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-black leading-none">
                89€
              </span>
              <span className="text-sm font-semibold text-black/40 line-through leading-none mb-[2px]">
                129€
              </span>
            </div>
          </div>
          <Button
            onClick={() => onBuyClick(1)}
            className="rounded-full bg-black hover:bg-black/90 text-white font-bold text-base px-6 py-5 transition-transform hover:scale-105"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Acheter
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
