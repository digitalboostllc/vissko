import { Logo } from '@/components/Logo'

interface FooterProps {
  onNavigate: (view: 'cgv' | 'privacy') => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-zinc-950 text-white border-t border-white/10 pt-12 pb-32 md:pb-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto text-white" />
          </div>
          
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <button onClick={() => onNavigate('cgv')} className="hover:text-white transition-colors">
              Conditions Générales de Vente (CGV)
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
              Politique de Confidentialité
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="text-center md:text-left text-sm text-zinc-500">
            <p className="font-semibold text-zinc-300 mb-2">À propos de nous</p>
            <p>Vissko LLC</p>
            <p>2443 Sierra Nevada Road</p>
            <p>Mammoth Lakes, CA 93546, USA</p>
          </div>
          <div className="text-center md:text-right text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Vissko. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  )
}
