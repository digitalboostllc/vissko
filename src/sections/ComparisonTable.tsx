import { Check, X } from 'lucide-react'

export const ComparisonTable = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight">
            Pourquoi choisir <span className="text-black">Vissko</span> ?
          </h2>
          <p className="text-lg text-zinc-500">
            Comparez et constatez la différence par vous-même.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border border-zinc-200 rounded-3xl overflow-hidden bg-white">
            
            {/* Header Row */}
            <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-200">
              <div className="p-6 md:p-8"></div>
              <div className="p-6 md:p-8 text-center border-x border-zinc-200 bg-black relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                  Notre Produit
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">Vissko™</h3>
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="text-base md:text-xl font-bold text-zinc-500">Ventilateur Classique</h3>
              </div>
            </div>

            {/* Feature 1 */}
            <div className="grid grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-6 flex items-center font-semibold text-zinc-900 text-sm md:text-base">Batterie & Autonomie</div>
              <div className="p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-6 h-6 text-emerald-500" />
                <span className="text-xs md:text-sm font-bold text-center">1800mAh (Longue durée)</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-6 h-6 text-red-500 opacity-50" />
                <span className="text-xs md:text-sm text-zinc-500 text-center">Faible autonomie</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-6 flex items-center font-semibold text-zinc-900 text-sm md:text-base">Niveau Sonore</div>
              <div className="p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-6 h-6 text-emerald-500" />
                <span className="text-xs md:text-sm font-bold text-center">Ultra-silencieux (Moteur Brushless)</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-6 h-6 text-red-500 opacity-50" />
                <span className="text-xs md:text-sm text-zinc-500 text-center">Bruyant & Dérangeant</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-6 flex items-center font-semibold text-zinc-900 text-sm md:text-base">Écran de Contrôle</div>
              <div className="p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-6 h-6 text-emerald-500" />
                <span className="text-xs md:text-sm font-bold text-center">Écran LED Intelligent</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-6 h-6 text-red-500 opacity-50" />
                <span className="text-xs md:text-sm text-zinc-500 text-center">Aucun indicateur</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-6 flex items-center font-semibold text-zinc-900 text-sm md:text-base">Design & Matériaux</div>
              <div className="p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-6 h-6 text-emerald-500" />
                <span className="text-xs md:text-sm font-bold text-center">Premium & Ergonomique</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-6 h-6 text-red-500 opacity-50" />
                <span className="text-xs md:text-sm text-zinc-500 text-center">Plastique bon marché</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
