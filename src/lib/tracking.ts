export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined') {
    // Facebook Pixel
    if ((window as any).fbq) {
      if (data?.event_id) {
        (window as any).fbq('track', eventName, data, { eventID: data.event_id });
      } else {
        (window as any).fbq('track', eventName, data);
      }
    }
    // Google Analytics 4
    if ((window as any).gtag) {
      let gaEventName = eventName;
      if (eventName === 'InitiateCheckout') gaEventName = 'begin_checkout';
      if (eventName === 'Purchase') gaEventName = 'purchase';
      if (eventName === 'ViewContent') gaEventName = 'view_item';
      if (eventName === 'AddToCart') gaEventName = 'add_to_cart';
      
      const gaData: any = {
         value: data?.value || 89.00,
         currency: data?.currency || 'EUR',
         items: [{
           item_id: data?.content_ids?.[0] || 'vissko_fan',
           item_name: 'Vissko Ventilateur Portable 1800mAh',
           price: (data?.value && data?.num_items) ? Number((data.value / data.num_items).toFixed(2)) : 89.00,
           quantity: data?.num_items || 1
         }]
      };

      if (data?.event_id && eventName === 'Purchase') {
        gaData.transaction_id = data.event_id;
      }

      (window as any).gtag('event', gaEventName, gaData);
    }

    // TikTok Pixel
    if ((window as any).ttq) {
      let ttqEventName = eventName;
      if (eventName === 'Purchase') ttqEventName = 'CompletePayment';
      
      const ttqData: any = {
        value: data?.value || 89.00,
        currency: data?.currency || 'EUR',
        contents: [{
          content_id: data?.content_ids?.[0] || 'vissko_fan',
          content_name: 'Vissko Ventilateur Portable',
          price: (data?.value && data?.num_items) ? Number((data.value / data.num_items).toFixed(2)) : 89.00,
          quantity: data?.num_items || 1
        }]
      };

      if (data?.event_id) {
        (window as any).ttq.track(ttqEventName, ttqData, { event_id: data.event_id });
      } else {
        (window as any).ttq.track(ttqEventName, ttqData);
      }
    }

    // Snapchat Pixel
    if ((window as any).snaptr) {
      let snapEventName = eventName;
      if (eventName === 'ViewContent') snapEventName = 'VIEW_CONTENT';
      if (eventName === 'AddToCart') snapEventName = 'ADD_CART';
      if (eventName === 'InitiateCheckout') snapEventName = 'START_CHECKOUT';
      if (eventName === 'Purchase') snapEventName = 'PURCHASE';

      const snapData: any = {
        price: data?.value || 89.00,
        currency: data?.currency || 'EUR',
        item_ids: data?.content_ids || ['vissko_fan'],
        number_items: data?.num_items || 1
      };
      
      if (data?.event_id && eventName === 'Purchase') {
        snapData.transaction_id = data.event_id;
      }

      (window as any).snaptr('track', snapEventName, snapData);
    }
    
    if (!(window as any).fbq && !(window as any).gtag && !(window as any).ttq && !(window as any).snaptr) {
      console.warn(`[Tracking] Fired: ${eventName}`, data || '');
    }
  }
}
