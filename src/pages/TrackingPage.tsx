import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Truck, CheckCircle2, ChevronLeft, Plane, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

interface TrackingPageProps {
  onBack: () => void;
}

const generateTimeline = (createdAtStr: string) => {
  // Parse SQLite DATETIME to JS Date (assumes UTC)
  const safeDateStr = createdAtStr.replace(' ', 'T') + 'Z';
  const createdAt = new Date(safeDateStr);
  const now = new Date();
  
  // If invalid date, fallback to now
  const baseDate = isNaN(createdAt.getTime()) ? now : createdAt;
  
  const diffTime = Math.max(0, now.getTime() - baseDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const steps = [
    {
      title: "Commande Confirmée",
      desc: "Votre paiement a été accepté.",
      location: "En ligne",
      Icon: CheckCircle2,
      dayOffset: 0,
    },
    {
      title: "Préparation de la commande",
      desc: "Colis emballé et prêt pour l'expédition.",
      location: "2443 Sierra Nevada Road, Mammoth Lakes CA",
      Icon: Package,
      dayOffset: 2,
    },
    {
      title: "Pris en charge par DHL",
      desc: "Le transporteur a récupéré votre colis.",
      location: "Mammoth Lakes, CA 93546",
      Icon: Truck,
      dayOffset: 4,
    },
    {
      title: "En transit international",
      desc: "Votre colis est en route vers la France.",
      location: "Centre de tri international DHL",
      Icon: Plane,
      dayOffset: 7,
    },
    {
      title: "Arrivé en France",
      desc: "Colis en cours de dédouanement et tri local.",
      location: "Centre de tri (France)",
      Icon: MapPin,
      dayOffset: 12,
    },
    {
      title: "En cours de livraison",
      desc: "Le livreur est en route vers votre adresse.",
      location: "Adresse de livraison",
      Icon: Truck,
      dayOffset: 16,
    }
  ];

  return steps.map((step, index) => {
    const stepDate = addDays(baseDate, step.dayOffset);
    // A step is completed if current days passed is >= the step's dayOffset
    // OR if it's the very first step
    const isCompleted = diffDays >= step.dayOffset || index === 0;
    
    // The current active step is the last completed step
    const nextStepOffset = steps[index + 1]?.dayOffset || 999;
    const isCurrent = isCompleted && diffDays < nextStepOffset;

    return { 
      ...step, 
      dateStr: formatDate(stepDate), 
      isCompleted, 
      isCurrent 
    };
  });
}

export const TrackingPage = ({ onBack }: TrackingPageProps) => {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber || !email) return
    
    setIsLoading(true)
    setErrorMsg('')
    
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`)
      if (!res.ok) {
        throw new Error("Commande introuvable avec ces identifiants.")
      }
      const data = await res.json()
      setOrderData(data)
      setIsTracking(true)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const timeline = orderData ? generateTimeline(orderData.created_at) : [];
  const currentStatus = timeline.find(t => t.isCurrent)?.title || "En cours de traitement";

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
                Entrez votre numéro de commande et l'adresse email utilisée lors de l'achat pour suivre l'état de votre livraison via DHL.
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
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold break-all pr-4">{orderNumber}</h2>
                  <p className="text-sm text-emerald-600 font-medium">{currentStatus}</p>
                  <p className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Transporteur: DHL Express
                  </p>
                </div>
                <button onClick={() => setIsTracking(false)} className="text-xs font-medium text-zinc-500 hover:text-black underline whitespace-nowrap">
                  Fermer
                </button>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 space-y-6 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-200 before:to-transparent">
                
                {timeline.map((step, idx) => {
                  const { Icon, isCompleted, isCurrent, title, desc, location, dateStr } = step;
                  
                  // Styling based on state
                  let iconBg = "bg-zinc-100";
                  let iconBorder = "border-white";
                  let iconColor = "text-zinc-400";
                  let boxOpacity = "opacity-50";
                  
                  if (isCompleted) {
                    iconBg = isCurrent ? "bg-amber-500" : "bg-emerald-500";
                    iconColor = "text-white";
                    boxOpacity = "opacity-100";
                  }

                  return (
                    <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-opacity duration-300 ${boxOpacity}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 ${iconBorder} ${iconBg} absolute left-[-2.5rem] md:left-1/2 md:-ml-4 translate-x-1.5 md:translate-x-0 shadow-sm z-10`}>
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                      </div>
                      
                      <div className="w-full md:w-[calc(50%-2rem)] bg-zinc-50 p-4 rounded-xl border border-zinc-100 shadow-sm relative">
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                          <div className="font-bold text-zinc-900 text-sm">{title}</div>
                          <div className="text-[10px] font-bold text-zinc-500 bg-zinc-200/50 px-2 py-0.5 rounded-full inline-block w-fit">
                            {dateStr}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-600 mb-2">{desc}</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          <MapPin className="w-3 h-3" /> {location}
                        </div>
                      </div>
                    </div>
                  )
                })}

              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

