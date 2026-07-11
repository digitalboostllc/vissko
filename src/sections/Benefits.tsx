import { motion } from 'framer-motion'
import { BatteryCharging, Wind, User, Zap, ChevronRight } from 'lucide-react'

const features = [
  {
    icon: <BatteryCharging className="w-8 h-8 text-foreground" />,
    title: 'Batterie 1800mAh',
    description: 'Une autonomie exceptionnelle pour vous accompagner toute la journée sans interruption.',
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-2'
  },
  {
    icon: <Wind className="w-8 h-8 text-foreground" />,
    title: '5 Vitesses',
    description: 'De la brise légère au souffle puissant. Ajustez la vitesse selon vos envies.',
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-1'
  },
  {
    icon: <User className="w-8 h-8 text-foreground" />,
    title: 'Mode Tour de Cou',
    description: 'Gardez les mains libres avec sa sangle ergonomique. Parfait pour le sport ou les voyages.',
    colSpan: 'col-span-1 md:col-span-4 lg:col-span-2'
  },
  {
    icon: <Zap className="w-8 h-8 text-foreground" />,
    title: 'Charge Rapide USB-C',
    description: 'Faites le plein d\'énergie en quelques minutes pour des heures de fraîcheur.',
    colSpan: 'col-span-1 md:col-span-2 lg:col-span-1'
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
}

export const Benefits = () => {
  return (
    <section id="features" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="max-w-2xl mb-16 mx-auto text-center">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">L'Ingénierie du confort</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Petit par la taille.<br/>Immense par ses capacités.</h3>
          <p className="text-lg text-muted-foreground">
            Chaque détail a été pensé pour vous offrir la meilleure expérience de refroidissement, où que vous soyez.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className={`group bg-background rounded-3xl p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 ${feature.colSpan}`}
            >
              <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">{feature.title}</h4>
              <p className="text-muted-foreground mb-6 line-clamp-2">{feature.description}</p>
              
              <a href="#" className="inline-flex items-center text-sm font-semibold text-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                En savoir plus <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
