import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, MapPin } from 'lucide-react'

const testimonials = [
  {
    name: "Sophie M.",
    city: "Paris",
    text: "Absolument génial pour les trajets en métro l'été ! Il est super léger et la batterie tient vraiment bien. Le mode tour de cou est une libération.",
    rating: 5,
    date: "Il y a 2 jours"
  },
  {
    name: "Thomas D.",
    city: "Lyon",
    text: "Le meilleur investissement de l'été. Très silencieux, je l'utilise même au bureau open-space sans déranger personne. L'écran LED est très pratique.",
    rating: 5,
    date: "Il y a 4 jours"
  },
  {
    name: "Claire L.",
    city: "Marseille",
    text: "Parfait pour la plage. La puissance au niveau 5 est impressionnante pour un si petit appareil. Je recommande à 100%.",
    rating: 5,
    date: "Il y a 1 semaine"
  }
]

export const SocialProof = () => {

  return (
    <section id="reviews" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex justify-center items-center gap-1 text-foreground mb-4">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Approuvé par des milliers de Français</h2>
          <p className="text-lg text-muted-foreground">Rejoignez notre communauté de clients satisfaits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-secondary/50 rounded-3xl p-8 border border-border transition-colors hover:border-foreground/30">
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className={`w-4 h-4 ${idx < t.rating ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-foreground text-lg mb-6 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    {t.name}
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t.city} • {t.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    </section>
  )
}
