import { ShieldCheck, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export const Guarantee = () => {
  return (
    <section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-16">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-emerald-500/10 animate-[spin_15s_linear_infinite_reverse]" />
                <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-emerald-400" />
              </div>
            </motion.div>

            <div className="flex flex-col text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Garantie 30 Jours <br className="hidden md:block" />
                <span className="text-emerald-400">Satisfait ou Remboursé</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Nous sommes tellement convaincus que vous allez adorer votre ventilateur Vissko que nous prenons tous les risques. Essayez-le pendant 30 jours. Si vous n'êtes pas 100% bluffé par sa puissance et son confort, renvoyez-le nous pour un remboursement intégral. 
                <strong className="text-white font-semibold"> Zéro question. Zéro tracas.</strong>
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-zinc-300">
                  Retours Simplifiés
                </div>
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-zinc-300">
                  Support Client 7j/7
                </div>
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-zinc-300">
                  Paiement Sécurisé
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
