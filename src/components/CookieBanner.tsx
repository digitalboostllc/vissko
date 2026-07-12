import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('vissko-cookie-consent')
    if (!hasConsented) {
      // Small delay so it doesn't pop up instantly on page load
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('vissko-cookie-consent', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-zinc-800 p-3 rounded-full hidden md:block">
                  <Cookie className="w-6 h-6 text-zinc-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Respect de votre vie privée</h3>
                  <p className="text-sm text-zinc-400">
                    Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu. 
                    En cliquant sur "Accepter", vous consentez à l'utilisation de ces cookies.
                  </p>
                </div>
              </div>
              <div className="flex w-full md:w-auto shrink-0">
                <Button 
                  onClick={acceptCookies} 
                  className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 font-bold rounded-xl px-8"
                >
                  Accepter
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
