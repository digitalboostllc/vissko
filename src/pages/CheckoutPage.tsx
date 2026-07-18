import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { ChevronLeft, ShieldCheck, Minus, Plus } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder')

interface CheckoutPageProps {
  onBack: () => void;
  quantity: number;
}

export const CheckoutPage = ({ onBack, quantity: initialQuantity }: CheckoutPageProps) => {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSession = async (qty: number) => {
    setIsLoading(true)
    setError(null)
    setClientSecret(null) // Unmount old iframe while loading

    try {
      const discount = localStorage.getItem('vissko_coupon');
      
      // Extract FB cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const tracking = {
        utm_source: localStorage.getItem('utm_source'),
        utm_medium: localStorage.getItem('utm_medium'),
        utm_campaign: localStorage.getItem('utm_campaign'),
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp')
      };

      const res = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty, discount, tracking })
      })
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        setError('Erreur lors de la création de la session. Vérifiez vos clés Stripe.')
      }
    } catch {
      setError('Impossible de se connecter au serveur de paiement.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchSession(quantity)
  }, []) // Only on mount. We call fetchSession manually on quantity change

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > 10) return
    setQuantity(newQty)
    fetchSession(newQty)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* LEFT COLUMN: Payment Form (White Background) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start bg-white pt-8 pb-12 lg:pt-16 px-4 lg:px-12 border-r border-zinc-200">
        <div className="w-full max-w-xl">
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour à la boutique
          </button>
          
          <h1 className="text-2xl font-bold mb-8">Paiement</h1>

          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20 flex-col gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
              <p className="text-sm text-zinc-500 font-medium animate-pulse">Mise à jour du paiement...</p>
            </div>
          ) : clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout className="w-full" />
            </EmbeddedCheckoutProvider>
          ) : null}
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary (Light Gray Background) */}
      <div className="w-full lg:w-1/2 bg-zinc-50 border-t lg:border-t-0 border-zinc-200 pt-8 pb-12 lg:pt-16 px-4 lg:px-12 flex flex-col items-center">
        <div className="w-full max-w-md sticky top-16">
          <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
          
          {/* Product Item */}
          <div className="flex items-center gap-4 mb-6">
            {/* 
              FIX: Wrapper div is relative, but NO overflow-hidden.
              The inner div has overflow-hidden for the image borders, 
              but the badge sits on the outer wrapper.
            */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-white border border-zinc-200 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src="/assets/vissko-fan-hero.png" 
                  alt="Vissko Fan" 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="absolute -top-2 -right-2 bg-zinc-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full z-10">{quantity}</span>
            </div>
            
            <div className="flex-grow">
              <h3 className="font-semibold text-zinc-900">Vissko™ Premium Fan</h3>
              <p className="text-sm text-zinc-500">Blanc Minimaliste</p>
            </div>
            <div className="font-medium text-right">
              <div>89.00€</div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-2 mb-6">
            <span className="text-sm font-medium text-zinc-600 ml-2">Quantité</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold w-4 text-center">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10 || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <hr className="border-zinc-200 my-6" />

          {/* Pricing Breakdown */}
          <div className="space-y-3 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="font-medium text-zinc-900">{(129.00 * quantity).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Réduction</span>
              <span className="font-medium">-{(40.00 * quantity).toFixed(2)}€</span>
            </div>
            {localStorage.getItem('vissko_coupon') === 'SAVE10' && (
              <div className="flex justify-between text-amber-600">
                <span>Code Promo (SAVE10)</span>
                <span className="font-medium">-{((89.00 * quantity) * 0.1).toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Livraison Suivie (10-15 jours)</span>
              <span className="font-medium text-zinc-900">Gratuite</span>
            </div>
          </div>

          <hr className="border-zinc-200 my-6" />

          {/* Total */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-black">
              {localStorage.getItem('vissko_coupon') === 'SAVE10' 
                ? ((89.00 * quantity) * 0.9).toFixed(2)
                : (89.00 * quantity).toFixed(2)}€
            </span>
          </div>

          {/* Trust Badges */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 flex flex-col items-center">
            <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 
              Paiement 100% sécurisé
            </div>
            <div className="flex gap-4 items-center mb-4">
              <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg" alt="Visa" className="h-6 w-auto grayscale opacity-70" />
              <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg" alt="Mastercard" className="h-6 w-auto grayscale opacity-70" />
              <img src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/wallets/apple-pay.svg" alt="Apple Pay" className="h-6 w-auto grayscale opacity-70" />
            </div>
            <div className="text-xs text-center text-zinc-500">
              Chiffrement SSL 256-bit. <br/>
              Garantie Satisfait ou Remboursé 30 Jours.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
