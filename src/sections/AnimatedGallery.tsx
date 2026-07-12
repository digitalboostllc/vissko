import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Maximize2, ShieldCheck } from 'lucide-react'

export const AnimatedGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // GSAP/Framer Motion Scroll effects
  const scaleImage = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2])
  const opacityText = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [0, 1, 0])

  return (
    <section ref={containerRef} id="gallery" className="relative min-h-[120vh] bg-secondary flex items-center justify-center overflow-hidden">
      
      {/* Scroll-driven Text Content */}
      <motion.div 
        style={{ opacity: opacityText }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full px-4"
      >
        <h3 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
          Un design d'exception.
        </h3>
        <p className="text-xl text-muted-foreground font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-foreground" /> Matériaux premium et finitions soignées.
        </p>
      </motion.div>

      {/* Main Product Image with Parallax Zoom */}
      <motion.div 
        style={{ scale: scaleImage }}
        className="relative z-10 w-full max-w-4xl px-4 flex justify-center"
      >
        <img 
          src="/assets/vissko-fan-gallery.png" 
          alt="Design du Vissko"
          className="w-full max-w-2xl object-contain mix-blend-multiply dark:mix-blend-normal"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 600"><rect fill="%23f3f4f6" width="800" height="600"/><text fill="%239ca3af" font-family="sans-serif" font-size="24" font-weight="bold" x="50%" y="50%" text-anchor="middle">Galerie (Vue 360/Zoom)</text></svg>'
          }}
        />
        
        {/* Callouts */}
        <div className="absolute top-1/4 right-[15%] lg:right-[25%] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full hidden md:flex items-center gap-2 animate-bounce border border-black/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold whitespace-nowrap">Conception Premium</span>
        </div>

        <div className="absolute bottom-1/4 left-[15%] lg:left-[25%] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full hidden md:flex items-center gap-2 border border-black/10">
          <div className="w-2 h-2 rounded-full bg-black" />
          <span className="text-sm font-bold text-black">Port USB-C</span>
        </div>
      </motion.div>

      {/* Helper icon */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground flex flex-col items-center gap-2">
        <Maximize2 className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest">Scrollez pour zoomer</span>
      </div>
    </section>
  )
}
