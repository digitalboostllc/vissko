import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeroProps {
  onBuyClick?: (quantity: number) => void;
}

export const Hero = ({ onBuyClick }: HeroProps) => {
  const [stock, setStock] = useState(14)

  useEffect(() => {
    // Fetch live stock from backend
    const fetchStock = async () => {
      try {
        const res = await fetch(`/api/stock`)
        if (res.ok) {
          const data = await res.json()
          if (data.stock) {
            setStock(data.stock)
          }
        }
      } catch (err) {
        console.error('Failed to fetch stock', err)
      }
    }
    
    fetchStock()
  }, [])

  return (
    <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-background">
      {/* Background ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/5 dark:bg-white/5 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-secondary text-foreground hover:bg-secondary/80 border-border border rounded-full px-4 py-1 font-semibold text-sm">
                Nouveau Modèle 2026
              </Badge>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span>(4.9/5) basé sur 1,204 avis</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              L'air frais. <br />
              <span className="text-foreground">
                Où que vous soyez.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-[500px] leading-relaxed">
              Vissko redéfinit le confort. Batterie haute capacité de 1800mAh, 5 vitesses silencieuses, et écran LED intelligent. Portez-le autour du cou ou tenez-le en main.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              {/* Option 1 */}
              <button 
                onClick={() => onBuyClick?.(1)} 
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-all bg-white relative group"
              >
                <span className="text-sm font-bold text-zinc-500 mb-1">1 Ventilateur</span>
                <span className="text-2xl font-black text-black">89€</span>
                <span className="text-xs text-zinc-400 line-through mt-1">129€</span>
              </button>
              
              {/* Option 2 */}
              <button 
                onClick={() => onBuyClick?.(2)} 
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 transition-all relative group shadow-sm"
              >
                <div className="absolute -top-3 bg-amber-400 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                  Le plus populaire
                </div>
                <span className="text-sm font-bold text-amber-900 mb-1 mt-1">2 Ventilateurs</span>
                <span className="text-2xl font-black text-amber-600">142€</span>
                <span className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-widest">-20% (71€/unité)</span>
              </button>

              {/* Option 3 */}
              <button 
                onClick={() => onBuyClick?.(3)} 
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-all bg-white relative group"
              >
                <span className="text-sm font-bold text-zinc-500 mb-1">3 Ventilateurs</span>
                <span className="text-2xl font-black text-black">186€</span>
                <span className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">-30% (62€/unité)</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 bg-secondary/50 rounded-2xl p-4 w-full sm:w-auto border border-border/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </div>
                Attention : Plus que {stock} articles en stock !
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Livraison Suivie (10-15 jours)</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Garantie 30 jours satisfait ou remboursé</span>
              </div>
            </div>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Decorative background element */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl -z-10" />
            
            {/* The Image - to be replaced with the actual product photo */}
            <div className="relative w-full max-w-[400px] aspect-[3/4] bg-secondary rounded-[2rem] overflow-hidden border border-white/20">
              <img 
                src="/assets/vissko-fan-hero.png" 
                alt="Ventilateur portable Vissko"
                className="w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal"
                fetchPriority="high"
                decoding="sync"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 533"><rect fill="%23f3f4f6" width="400" height="533"/><text fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">Image du produit Vissko</text></svg>'
                }}
              />
              
              {/* Floating Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Batterie</span>
                  <span className="text-base sm:text-lg font-bold text-black dark:text-white">1800mAh</span>
                </div>
                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Vitesses</span>
                  <span className="text-base sm:text-lg font-bold text-black dark:text-white">5 Niveaux</span>
                </div>
                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Écran</span>
                  <span className="text-base sm:text-lg font-bold text-black dark:text-white">LED</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
