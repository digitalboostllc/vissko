import { Button } from '@/components/ui/button'
import { ShoppingCart, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface FinalCTAProps {
  onBuyClick?: () => void;
}

export const FinalCTA = ({ onBuyClick }: FinalCTAProps) => {
  return (
    <section className="relative py-24 bg-zinc-950 overflow-hidden text-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
            N'attendez pas la prochaine canicule.
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 10 000 Français qui ont déjà fait le choix du confort Vissko cet été.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="text-3xl font-bold mb-2">Offre de lancement</div>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-white/70 line-through">79.99€</span>
                  <span className="text-5xl font-black text-white">89.00€</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button onClick={onBuyClick} size="lg" className="w-full md:w-auto rounded-full bg-white hover:bg-white/90 text-black font-bold text-xl px-12 py-8 transition-transform hover:scale-105">
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Je commande maintenant
                </Button>
                <div className="flex flex-col items-center mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                    <ShieldCheck className="w-4 h-4" /> Paiement 100% sécurisé (SSL 256-bit)
                  </div>
                  <div className="flex gap-4 items-center bg-white/10 px-4 py-2 rounded-xl">
                    <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg" alt="Visa" className="h-6 w-auto" />
                    <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
                    <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/wallets/apple-pay.svg" alt="Apple Pay" className="h-6 w-auto" />
                  </div>
                  <div className="text-sm text-white/50">Garantie Satisfait ou Remboursé 30 Jours</div>
                </div>
                <div className="text-sm font-medium text-blue-200 flex items-center justify-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  L'offre expire à minuit
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-medium">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Garantie 30 jours
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Paiement 100% Sécurisé
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Livraison Suivie (10-15 jours)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
