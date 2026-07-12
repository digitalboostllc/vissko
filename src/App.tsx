import { useState, useEffect } from 'react'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { AnimatedGallery } from '@/sections/AnimatedGallery'
import { ActionVideos } from '@/sections/ActionVideos'
import { Benefits } from '@/sections/Benefits'
import { DisplayScreen } from '@/sections/DisplayScreen'
import { Lifestyle } from '@/sections/Lifestyle'
import { SocialProof } from '@/sections/SocialProof'
import { FAQ } from '@/sections/FAQ'
import { FinalCTA } from '@/sections/FinalCTA'
import { StickyCTA } from '@/components/StickyCTA'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { TrackingPage } from '@/pages/TrackingPage'
import { CGVPage } from '@/pages/CGVPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { SuccessPage } from '@/pages/SuccessPage'

type ViewState = 'landing' | 'checkout' | 'tracking' | 'cgv' | 'privacy' | 'success'

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing')
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false)

  const openCheckout = () => setCurrentView('checkout')
  const goHome = () => setCurrentView('landing')
  const openTracking = () => setCurrentView('tracking')
  const navigateTo = (view: ViewState) => setCurrentView(view)

  useEffect(() => {
    // Check if we are returning from Stripe checkout
    if (window.location.pathname === '/return') {
      setCurrentView('success')
    }

    // Expose openTracking globally so the Header can call it
    (window as any).openTracking = openTracking

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExitIntent && currentView === 'landing') {
        setHasShownExitIntent(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      delete (window as any).openTracking
    }
  }, [hasShownExitIntent, currentView])

  if (currentView === 'checkout') {
    return <CheckoutPage onBack={goHome} />
  }

  if (currentView === 'tracking') {
    return <TrackingPage onBack={goHome} />
  }

  if (currentView === 'cgv') {
    return <CGVPage onBack={goHome} />
  }

  if (currentView === 'privacy') {
    return <PrivacyPage onBack={goHome} />
  }

  if (currentView === 'success') {
    return <SuccessPage onGoHome={goHome} onTrackOrder={openTracking} />
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative pb-32 md:pb-0">
        <Header onBuyClick={openCheckout} />
        <main className="flex-grow">
          <Hero onBuyClick={openCheckout} />
          <ActionVideos />
          <AnimatedGallery />
          <Benefits />
          <DisplayScreen />
          <Lifestyle />
          <SocialProof />
          <FAQ />
          <FinalCTA onBuyClick={openCheckout} />
        </main>
        <Footer onNavigate={navigateTo} />
      </div>

      <StickyCTA onBuyClick={openCheckout} />
      <CookieBanner />
    </SmoothScroll>
  )
}

export default App
