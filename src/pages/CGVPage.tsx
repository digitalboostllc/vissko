import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface CGVPageProps {
  onBack: () => void;
}

export const CGVPage = ({ onBack }: CGVPageProps) => {
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
        <h1 className="text-3xl font-bold mb-8">Conditions Générales de Vente (CGV)</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">1. Objet</h2>
            <p>Les présentes Conditions Générales de Vente régissent exclusivement les ventes de produits proposés sur le site Vissko. Elles s'appliquent à l'exclusion de toutes autres conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">2. Prix</h2>
            <p>Les prix de nos produits sont indiqués en euros toutes taxes comprises (TVA et autres taxes applicables au jour de la commande), sauf indication contraire et hors frais de traitement et d'expédition.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">3. Commandes</h2>
            <p>Vous pouvez passer commande sur internet via notre site web. Les informations contractuelles sont présentées en langue française et feront l'objet d'une confirmation reprenant ces informations contractuelles au plus tard au moment de votre validation de commande.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">4. Validation de votre commande</h2>
            <p>Toute commande figurant sur le site web suppose l'adhésion aux présentes Conditions Générales. Toute confirmation de commande entraîne votre adhésion pleine et entière aux présentes conditions générales de vente, sans exception ni réserve.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">5. Paiement</h2>
            <p>Le fait de valider votre commande implique pour vous l'obligation de payer le prix indiqué. Le règlement de vos achats s'effectue par carte bancaire grâce au système sécurisé Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">6. Rétractation et Retours</h2>
            <p>Conformément aux dispositions de l'article L.121-21 du Code de la Consommation, vous disposez d'un délai de rétractation de 30 jours (notre garantie étendue) à compter de la réception de vos produits pour exercer votre droit de rétraction sans avoir à justifier de motifs ni à payer de pénalité.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
