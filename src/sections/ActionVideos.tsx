import { motion } from 'framer-motion'

const videos = [
  {
    src: '/assets/video_outdoor_walk.mp4',
    title: 'Ajustement Facile'
  },
  {
    src: '/assets/video_crowded_street.mp4',
    title: 'Fraîcheur Intense'
  },
  {
    src: '/assets/video_commute_button.mp4',
    title: 'Contrôle Rapide'
  },
  {
    src: '/assets/video_crowded_festival.mp4',
    title: 'Autonomie Journée'
  }
]

export const ActionVideos = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">
            Le Vissko en action
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            L'essayer, c'est l'adopter.
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-secondary border border-border group cursor-pointer"
            >
              <video
                src={video.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <p className="text-white font-bold text-sm md:text-lg">
                  {video.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
