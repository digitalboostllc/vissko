import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, ArrowRight, RefreshCw, XCircle, Gift, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { trackEvent } from '@/lib/tracking'

interface SuccessPageProps {
  onGoHome: () => void;
  onTrackOrder: () => void;
}

export const SuccessPage = ({ onGoHome, onTrackOrder }: SuccessPageProps) => {
  const [status, setStatus] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpsellLoading, setIsUpsellLoading] = useState(false)
  const [upsellSuccess, setUpsellSuccess] = useState(false)

  const handleUpsell = async () => {
    setIsUpsellLoading(true)
    try {
      const sessionId = activeSessionId;
      
      if (!sessionId) {
        throw new Error('Session ID is missing');
      }

      const response = await fetch('/api/one-click-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_session_id: sessionId })
      })
      const data = await response.json()
      
      if (data.success) {
        setUpsellSuccess(true)
        trackEvent('Purchase', { value: 53.40, currency: 'EUR', event_id: sessionId + '_upsell' })
      } else {
        console.error('Upsell failed:', data.error)
        alert('Impossible de traiter la demande avec le moyen de paiement enregistré.')
      }
    } catch (error) {
      console.error('Upsell error:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsUpsellLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const sessionId = urlParams.get('session_id')

    if (!sessionId) {
      setIsLoading(false)
      return
    }

    setActiveSessionId(sessionId)

    fetch(`/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status)
        setCustomerEmail(data.customer_email)
        setOrderId(data.order_id)
        setIsLoading(false)
        
        if (data.status === 'complete') {
          trackEvent('Purchase', { value: data.amount_total || 89.00, currency: 'EUR', event_id: sessionId })
        }

        // Clean up the URL so it looks nicer
        window.history.replaceState({}, document.title, "/")
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mb-4" />
        <p className="text-zinc-500 font-medium">Vérification de votre paiement...</p>
      </div>
    )
  }

  if (status !== 'complete') {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-center mb-4">Paiement non finalisé</h1>
        <p className="text-zinc-500 text-center mb-8">
          Votre paiement n'a pas pu être confirmé. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.
        </p>
        <Button onClick={onGoHome} className="bg-black text-white hover:bg-zinc-800 rounded-full px-8">
          Retour à l'accueil
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="bg-white border-b border-zinc-200 py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-center">
          <Logo className="h-6 w-auto text-zinc-900" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 w-full max-w-xl text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50" />
              <CheckCircle2 className="w-10 h-10 text-emerald-600 relative z-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-4">Merci pour votre commande !</h1>
          <p className="text-zinc-500 mb-8 text-lg">
            Votre paiement a été accepté. Un email de confirmation a été envoyé à <strong className="text-zinc-900">{customerEmail}</strong>.
          </p>

          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8 text-left space-y-4">
            <div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Numéro de commande</div>
              <div className="font-mono text-xl font-bold text-zinc-900">{orderId}</div>
            </div>
            
            <div className="flex items-start gap-3 mt-4 text-sm text-zinc-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <RefreshCw className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p>Votre commande est en cours de préparation. La livraison suivie prend généralement de 10 à 15 jours ouvrés.</p>
            </div>
          </div>

          {/* Upsell Box */}
          {upsellSuccess ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 mb-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="font-bold text-emerald-900 text-lg mb-2">Offre Ajoutée avec Succès !</h3>
              <p className="text-emerald-800 text-sm">
                Votre deuxième ventilateur a été ajouté à votre commande pour seulement 53,40 €. Vous n'avez rien d'autre à faire.
              </p>
            </motion.div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-8 text-left relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-amber-900 text-lg">Offre Exclusive !</h3>
              </div>
              <p className="text-amber-800 text-sm mb-4 leading-relaxed">
                Ajoutez un <strong>2ème ventilateur Vissko</strong> pour un proche avec <strong className="text-amber-600">40% de réduction immédiate</strong> ! Parfait pour les couples ou comme cadeau d'été.
              </p>
              <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl mb-4">
                <span className="line-through text-zinc-400 text-sm">89,00 €</span>
                <span className="font-black text-2xl text-amber-600">53,40 €</span>
              </div>
              <Button 
                onClick={handleUpsell}
                disabled={isUpsellLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-xl shadow-sm text-base flex items-center justify-center transition-all"
              >
                {isUpsellLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Profiter de l'offre (-40%)
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              onClick={onTrackOrder}
              className="flex-1 rounded-full bg-black hover:bg-zinc-800 text-white font-bold py-6 text-base"
            >
              <Package className="w-5 h-5 mr-2" />
              Suivre la commande
            </Button>
            <Button 
              onClick={onGoHome}
              variant="outline"
              className="flex-1 rounded-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black font-bold py-6 text-base"
            >
              Retour à l'accueil
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
