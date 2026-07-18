export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  } else {
    // Fallback or debug logging if adblocker blocks fbq
    console.warn(`[Pixel] Fired: ${eventName}`, data || '');
  }
}
