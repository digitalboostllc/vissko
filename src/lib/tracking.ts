export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined') {
    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', eventName, data);
    }
    // Google Analytics 4
    if ((window as any).gtag) {
      const gaEventName = eventName === 'InitiateCheckout' ? 'begin_checkout' : eventName === 'Purchase' ? 'purchase' : eventName;
      (window as any).gtag('event', gaEventName, data);
    }
    
    if (!(window as any).fbq && !(window as any).gtag) {
      console.warn(`[Tracking] Fired: ${eventName}`, data || '');
    }
  }
}
