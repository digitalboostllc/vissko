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
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 bg-zinc-50 border-b border-zinc-200">
              <div className="p-6 md:p-8"></div>
              <div className="p-2 md:p-8 text-center border-x border-zinc-200 bg-black relative flex flex-col justify-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1 md:px-3 rounded-full whitespace-nowrap">
                  Notre Produit
                </span>
                <h3 className="text-sm md:text-2xl font-black text-white">Vissko™</h3>
              </div>
              <div className="p-2 md:p-8 text-center flex flex-col justify-center">
                <h3 className="text-[11px] leading-tight md:text-xl font-bold text-zinc-500">Ventilateur Classique</h3>
              </div>
            </div>

            {/* Feature 1 */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-3 md:p-6 flex items-center font-semibold text-zinc-900 text-xs md:text-base leading-tight">Batterie & Autonomie</div>
              <div className="p-3 md:p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <span className="text-[10px] md:text-sm font-bold text-center leading-tight">1800mAh (Longue durée)</span>
              </div>
              <div className="p-3 md:p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 opacity-50" />
                <span className="text-[10px] md:text-sm text-zinc-500 text-center leading-tight">Faible autonomie</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-3 md:p-6 flex items-center font-semibold text-zinc-900 text-xs md:text-base leading-tight">Niveau Sonore</div>
              <div className="p-3 md:p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <span className="text-[10px] md:text-sm font-bold text-center leading-tight">Ultra-silencieux</span>
              </div>
              <div className="p-3 md:p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 opacity-50" />
                <span className="text-[10px] md:text-sm text-zinc-500 text-center leading-tight">Bruyant & Dérangeant</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-3 md:p-6 flex items-center font-semibold text-zinc-900 text-xs md:text-base leading-tight">Écran de Contrôle</div>
              <div className="p-3 md:p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <span className="text-[10px] md:text-sm font-bold text-center leading-tight">Écran LED Intelligent</span>
              </div>
              <div className="p-3 md:p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 opacity-50" />
                <span className="text-[10px] md:text-sm text-zinc-500 text-center leading-tight">Aucun indicateur</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-zinc-100 last:border-0">
              <div className="p-3 md:p-6 flex items-center font-semibold text-zinc-900 text-xs md:text-base leading-tight">Design & Matériaux</div>
              <div className="p-3 md:p-6 border-x border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-2">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <span className="text-[10px] md:text-sm font-bold text-center leading-tight">Premium & Ergonomique</span>
              </div>
              <div className="p-3 md:p-6 flex flex-col items-center justify-center gap-2">
                <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 opacity-50" />
                <span className="text-[10px] md:text-sm text-zinc-500 text-center leading-tight">Plastique bon marché</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
