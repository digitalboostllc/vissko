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

  const openCheckout = (qty: any = 1) => {
    const finalQty = typeof qty === 'number' ? qty : 1;
    setCheckoutQty(finalQty)
    
    let val = 89.00;
    if (finalQty === 2) val = 142.00;
    if (finalQty === 3) val = 186.00;
    
    trackEvent('InitiateCheckout', {
      value: val,
      currency: 'EUR',
      num_items: finalQty,
      content_ids: ['vissko_fan'],
      content_type: 'product'
    })
    setCurrentView('checkout')
  }
  const goHome = () => setCurrentView('landing')
  const openTracking = () => setCurrentView('tracking')
  const navigateTo = (view: ViewState) => setCurrentView(view)

  // Initialization Effect (Run Once)
  useEffect(() => {
    // UTM Capture
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    
    if (utmSource) localStorage.setItem('utm_source', utmSource)
    if (utmMedium) localStorage.setItem('utm_medium', utmMedium)
    if (utmCampaign) localStorage.setItem('utm_campaign', utmCampaign)

    // Fetch Tracking IDs
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings.FB_PIXEL_ID) {
          const script = document.createElement('script')
          script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.FB_PIXEL_ID}');
            fbq('track', 'PageView');
            fbq('track', 'ViewContent', { content_ids: ['vissko_fan'], content_type: 'product', value: 89.00, currency: 'EUR' });
          `
          document.head.appendChild(script)
        }
        if (settings.GTM_ID) {
          // Google Analytics 4 (gtag.js)
          const script1 = document.createElement('script')
          script1.async = true
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.GTM_ID}`
          document.head.appendChild(script1)

          const script2 = document.createElement('script')
          script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.GTM_ID}');
          `
          document.head.appendChild(script2)
        }
      })
      .catch(console.error)

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

    return () => {
      delete (window as any).openTracking
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, []) // Empty dependency array -> runs exactly once!

  // Exit Intent Event Listener Effect (Depends on state)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExitIntent && currentView === 'landing') {
        setHasShownExitIntent(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
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
    return <AdminPage />
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
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
