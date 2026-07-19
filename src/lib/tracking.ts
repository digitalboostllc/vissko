export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined') {
    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', eventName, data);
    }
    // Google Analytics 4
    if ((window as any).gtag) {
      let gaEventName = eventName;
      if (eventName === 'InitiateCheckout') gaEventName = 'begin_checkout';
      if (eventName === 'Purchase') gaEventName = 'purchase';
      if (eventName === 'ViewContent') gaEventName = 'view_item';
      if (eventName === 'AddToCart') gaEventName = 'add_to_cart';
      
      const gaData = {
         value: data?.value || 89.00,
         currency: data?.currency || 'EUR',
         items: [{
           item_id: data?.content_ids?.[0] || 'vissko_fan',
           item_name: 'Vissko Ventilateur Portable 1800mAh',
           price: (data?.value && data?.num_items) ? Number((data.value / data.num_items).toFixed(2)) : 89.00,
           quantity: data?.num_items || 1
         }]
      };

      (window as any).gtag('event', gaEventName, gaData);
    }
    
    if (!(window as any).fbq && !(window as any).gtag) {
      console.warn(`[Tracking] Fired: ${eventName}`, data || '');
    }
  }
}
