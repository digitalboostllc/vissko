import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const scenes = [
  {
    title: "Au bureau",
    desc: "Restez concentré et au frais sans déranger vos collègues grâce au moteur ultra-silencieux.",
    image: "/assets/lifestyle-office.png",
    colSpan: "col-span-1 md:col-span-2 row-span-2"
  },
  {
    title: "Dans les transports",
    desc: "Le métro parisien en été n'est plus un calvaire. Accrochez-le à votre cou et profitez du trajet.",
    image: "/assets/lifestyle-metro.png",
    colSpan: "col-span-1 md:col-span-1 row-span-1"
  },
  {
    title: "À la plage",
    desc: "L'accessoire indispensable pour vos vacances. Résistant et endurant pour des heures sous le soleil.",
    image: "/assets/lifestyle-beach.png",
    colSpan: "col-span-1 md:col-span-1 row-span-1"
  }
]

export const Lifestyle = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">Adaptabilité Totale</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground">Conçu pour votre vie.</h3>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Du bureau à la plage, le Vissko s'intègre parfaitement à votre quotidien grâce à son design discret et élégant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[300px]">
          {scenes.map((scene, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl bg-secondary ${scene.colSpan}`}
            >
              {/* Text Scrim (Gradient for legibility) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-colors z-10" />
              <img 
                src={scene.image} 
                alt={scene.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 600"><rect fill="%23e5e5ea" width="800" height="600"/><text fill="%239ca3af" font-family="sans-serif" font-size="24" font-weight="bold" x="50%" y="50%" text-anchor="middle">Image Lifestyle (' + scene.title + ')</text></svg>'
                }}
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-white">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-2xl font-bold">{scene.title}</h4>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                    {scene.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
