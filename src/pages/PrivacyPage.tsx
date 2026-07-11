import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage = ({ onBack }: PrivacyPageProps) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
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
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">1. Collecte des renseignements personnels</h2>
            <p>Nous collectons les renseignements suivants lors de votre commande : Nom, Prénom, Adresse postale, Adresse électronique. Ces données sont recueillies au travers de formulaires et grâce à l'interactivité établie entre vous et notre site Web (Stripe Checkout).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">2. Utilisation des données</h2>
            <p>Les renseignements personnels que nous collectons sont utilisés pour les finalités suivantes : Suivi de la commande, Informations/Offres promotionnelles, Statistiques, et Gestion de la relation client.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">3. Fichiers journaux et témoins (Cookies)</h2>
            <p>Nous recueillons certaines informations par le biais de fichiers journaux (log file) et de fichiers témoins (cookies). Il s'agit principalement d'informations concernant le système d'exploitation, les pages visitées et les requêtes, ainsi que l'heure et le jour de connexion, ceci dans un but d'amélioration de nos services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">4. Droit d'opposition et de retrait</h2>
            <p>Nous nous engageons à vous offrir un droit d'opposition et de retrait quant à vos renseignements personnels. Pour pouvoir exercer ces droits, vous pouvez nous contacter via l'adresse de support affichée sur le site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">5. Sécurité</h2>
            <p>Les renseignements personnels que nous collectons sont conservés dans un environnement sécurisé. Les personnes travaillant pour nous sont tenues de respecter la confidentialité de vos informations. Nous avons recours au protocole SSL (Secure Sockets Layer) via notre partenaire Stripe pour le paiement.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
