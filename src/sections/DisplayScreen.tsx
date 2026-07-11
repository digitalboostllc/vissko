import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Activity, Zap } from 'lucide-react'

export const DisplayScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Parallax effects
  const yImage = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacityText = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0])

  return (
    <section ref={containerRef} className="relative bg-[#050507] text-white py-32 overflow-hidden">
      
      {/* Abstract light beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-30 pointer-events-none">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-white/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            style={{ opacity: opacityText }}
            className="flex flex-col max-w-xl"
          >
            <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Écran Intelligent LED</h2>
            <h3 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              L'intelligence,<br/>
              en un coup d'œil.
            </h3>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              Ne soyez plus jamais pris au dépourvu. L'écran LED intégré affiche avec précision le niveau de batterie restant et la vitesse sélectionnée en temps réel.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-full shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">5 Niveaux de puissance</h4>
                  <p className="text-sm text-gray-400">Passez du mode brise silencieuse au mode turbo rafale d'une simple pression.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-full shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Jauge de batterie précise</h4>
                  <p className="text-sm text-gray-400">Pourcentage exact (0-100%) pour savoir exactement quand recharger.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual Content */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* The actual product image will go here */}
            <motion.div 
              style={{ y: yImage }}
              className="relative w-full max-w-md aspect-square bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center p-4 backdrop-blur-md overflow-hidden"
            >
              <img 
                src="/assets/vissko-led-display.png" 
                alt="Écran LED du ventilateur Vissko"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 400"><rect fill="%231D1D1F" width="400" height="400" rx="20"/><text fill="%239ca3af" font-family="sans-serif" font-size="18" font-weight="bold" x="50%" y="50%" text-anchor="middle">Gros plan Écran LED</text><text fill="%23fff" font-family="sans-serif" font-size="48" font-weight="bold" x="50%" y="65%" text-anchor="middle">85%</text></svg>'
                }}
              />
              
              {/* Tech outline around image */}
              <div className="absolute inset-0 border border-white/20 rounded-[2rem] pointer-events-none" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
