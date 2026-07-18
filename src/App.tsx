import { useState, useEffect } from 'react'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { AnimatedGallery } from '@/sections/AnimatedGallery'
import { ActionVideos } from '@/sections/ActionVideos'
import { SocialProof } from '@/sections/SocialProof'
import { FAQ } from '@/sections/FAQ'
import { FinalCTA } from '@/sections/FinalCTA'
import { Guarantee } from '@/sections/Guarantee'
import { Lifestyle } from '@/sections/Lifestyle'
import { ComparisonTable } from '@/sections/ComparisonTable'
import { AsSeenOn } from '@/sections/AsSeenOn'
import { StickyCTA } from '@/components/StickyCTA'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { TrackingPage } from '@/pages/TrackingPage'
import { CGVPage } from '@/pages/CGVPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { SuccessPage } from '@/pages/SuccessPage'
import { AdminPage } from '@/pages/AdminPage'
import { trackEvent } from '@/lib/tracking'

type ViewState = 'landing' | 'checkout' | 'tracking' | 'cgv' | 'privacy' | 'success' | 'admin'

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing')
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false)

  const openCheckout = () => {
    trackEvent('InitiateCheckout')
    setCurrentView('checkout')
  }
  const goHome = () => setCurrentView('landing')
  const openTracking = () => setCurrentView('tracking')
  const navigateTo = (view: ViewState) => setCurrentView(view)

  useEffect(() => {
    // Check if we are returning from Stripe checkout
    if (window.location.pathname === '/return') {
      setCurrentView('success')
      trackEvent('Purchase', { value: 89.00, currency: 'EUR' })
    } else if (window.location.pathname === '/admin') {
      setCurrentView('admin')
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

  if (currentView === 'admin') {
    return <AdminPage onBack={goHome} />
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative pb-32 md:pb-0">
        <Header onBuyClick={openCheckout} />
        <main className="flex-grow">
          <Hero onBuyClick={openCheckout} />
          <AsSeenOn />
          <ActionVideos />
          <AnimatedGallery />
          <ComparisonTable />
          <Lifestyle />
          <Guarantee />
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
