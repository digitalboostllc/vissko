import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Truck, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

interface TrackingPageProps {
  onBack: () => void;
}

export const TrackingPage = ({ onBack }: TrackingPageProps) => {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber || !email) return
    
    setIsLoading(true)
    setErrorMsg('')
    
    try {
      const res = await fetch(`http://localhost:4242/api/tracking/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`)
      if (!res.ok) {
        throw new Error("Commande introuvable avec ces identifiants.")
      }
      await res.json()
      // You can use data.status to dynamically update the timeline here later
      setIsTracking(true)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </button>
          <Logo className="h-6 w-auto text-zinc-900" />
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {!isTracking ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-zinc-900" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center mb-2">Suivre ma commande</h1>
              <p className="text-zinc-500 text-center mb-8 text-sm">
                Entrez votre numéro de commande et l'adresse email utilisée lors de l'achat pour suivre l'état de votre livraison (10-15 jours ouvrés).
              </p>

              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-zinc-700 mb-1">Numéro de commande</label>
                  <input 
                    type="text" 
                    id="order"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex: #VSK-12345"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Adresse Email</label>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full rounded-xl bg-black hover:bg-zinc-800 text-white font-bold py-6 mt-4 transition-all"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Rechercher
                    </>
                  )}
                </Button>
                
                {errorMsg && (
                  <p className="text-red-500 text-sm text-center font-medium mt-4">{errorMsg}</p>
                )}
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold">Commande {orderNumber || '#VSK-12345'}</h2>
                  <p className="text-sm text-emerald-600 font-medium">En cours de livraison</p>
                </div>
                <button onClick={() => setIsTracking(false)} className="text-sm text-zinc-500 hover:text-black underline">Nouvelle recherche</button>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-emerald-500 text-slate-500 absolute left-[-2rem] translate-x-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white absolute" />
                  </div>
                  <div className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <div className="font-bold text-zinc-900">Commande Confirmée</div>
                    <div className="text-xs text-zinc-500 mt-1">Votre paiement a été accepté.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-emerald-500 text-slate-500 absolute left-[-2rem] translate-x-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white absolute" />
                  </div>
                  <div className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <div className="font-bold text-zinc-900">Préparation de la commande</div>
                    <div className="text-xs text-zinc-500 mt-1">L'entrepôt emballe votre Vissko Fan.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 text-slate-500 absolute left-[-2rem] translate-x-1.5 shadow-sm animate-pulse">
                    <Truck className="w-3 h-3 text-white absolute" />
                  </div>
                  <div className="w-full bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="font-bold text-blue-900">En transit</div>
                    <div className="text-xs text-blue-700 mt-1">Le colis a été remis au transporteur international. (10-15 jours)</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-zinc-200 text-slate-500 absolute left-[-2rem] translate-x-1.5 shadow-sm">
                  </div>
                  <div className="w-full p-4 rounded-xl opacity-50">
                    <div className="font-bold text-zinc-900">Livraison Estimée</div>
                    <div className="text-xs text-zinc-500 mt-1">En attente de réception en centre de tri local.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
