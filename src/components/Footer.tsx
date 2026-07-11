import { Logo } from '@/components/Logo'

interface FooterProps {
  onNavigate: (view: 'cgv' | 'privacy') => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-zinc-950 text-white border-t border-white/10 py-12">
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
        
        <div className="mt-8 text-center md:text-left text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Vissko. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
