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
import { LiveSalesPopup } from '@/components/LiveSalesPopup'
import { ExitIntentModal } from '@/components/ExitIntentModal'
import { trackEvent } from '@/lib/tracking'

type ViewState = 'landing' | 'checkout' | 'tracking' | 'cgv' | 'privacy' | 'success' | 'admin'

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing')
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false)
  const [checkoutQty, setCheckoutQty] = useState(1)

  const openCheckout = (qty = 1) => {
    setCheckoutQty(qty)
    trackEvent('InitiateCheckout')
    setCurrentView('checkout')
  }
  const goHome = () => setCurrentView('landing')
  const openTracking = () => setCurrentView('tracking')
  const navigateTo = (view: ViewState) => setCurrentView(view)

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Vissko Ventilateur Portable",
      "image": "https://vissko.us/assets/vissko-fan-hero.png",
      "description": "Ventilateur multifonction tour de cou, 5 vitesses, écran LED.",
      "brand": {
        "@type": "Brand",
        "name": "Vissko"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://vissko.us",
        "priceCurrency": "EUR",
        "price": "89.00",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1204"
      }
    };
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

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
      document.head.removeChild(script)
    }
  }, [hasShownExitIntent, currentView])

    if (currentView === 'checkout') {
      return <CheckoutPage onBack={goHome} quantity={checkoutQty} />
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
      <LiveSalesPopup />
      {hasShownExitIntent && <ExitIntentModal onClose={() => setHasShownExitIntent(false)} onBuyClick={openCheckout} />}
    </SmoothScroll>
  )
}

export default App
