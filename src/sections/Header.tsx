import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

interface HeaderProps {
  onBuyClick?: () => void;
}

export const Header = ({ onBuyClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white text-xs md:text-sm font-medium py-2 px-4 text-center">
        <span className="opacity-90">Livraison suivie offerte en France (10-15 jours ouvrés).</span>
      </div>
      
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-zinc-950/95 backdrop-blur-md py-3 border-white/10 shadow-lg' 
            : 'bg-transparent py-5 border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <Logo className={`h-6 w-auto transition-colors ${isScrolled ? 'text-white' : 'text-zinc-900 dark:text-white'}`} />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>Caractéristiques</a>
            <a href="#gallery" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>Galerie</a>
            <a href="#reviews" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>Avis</a>
            <a href="#faq" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>FAQ</a>
            <a href="#track" onClick={(e) => { e.preventDefault(); if (typeof (window as any).openTracking === 'function') (window as any).openTracking(); }} className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-white hover:text-zinc-300' : 'text-zinc-900 hover:text-zinc-700 dark:text-white'}`}>Suivre ma commande</a>
          </nav>

          {/* CTA & Trust */}
          <div className="hidden md:flex items-center gap-4">
            <div className={`hidden lg:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${isScrolled ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'}`}>
              <ShieldCheck className="w-4 h-4" />
              Paiement Sécurisé
            </div>
            <Button 
              onClick={onBuyClick} 
              className={`rounded-full font-semibold px-6 transition-all hover:scale-105 ${
                isScrolled 
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200' 
                  : 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Acheter Maintenant
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden transition-colors ${isScrolled ? 'text-white' : 'text-zinc-900 dark:text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-32 px-6 md:hidden flex flex-col gap-6"
          >
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold">Caractéristiques</a>
            <a href="#gallery" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold">Galerie</a>
            <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold">Avis</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold">FAQ</a>
            
            <div className="mt-8">
              <Button onClick={onBuyClick} className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-6 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Commander (Offre du jour)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
