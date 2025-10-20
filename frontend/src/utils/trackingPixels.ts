// frontend/src/utils/trackingPixels.ts

/**
 * Tracking Pixels Manager para Facebook (Meta) Pixel y TikTok Pixel
 * Configurar los IDs en .env:
 * REACT_APP_META_PIXEL_ID=tu_pixel_id
 * REACT_APP_TIKTOK_PIXEL_ID=tu_pixel_id
 */

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    _fbq?: any;
    _ttq?: any;
  }
}

class TrackingPixels {
  private metaPixelId: string | undefined;
  private tiktokPixelId: string | undefined;
  private isInitialized: boolean = false;

  constructor() {
    this.metaPixelId = process.env.REACT_APP_META_PIXEL_ID;
    this.tiktokPixelId = process.env.REACT_APP_TIKTOK_PIXEL_ID;
  }

  /**
   * Inicializar todos los pixels
   */
  init(): void {
    if (this.isInitialized) return;

    this.initMetaPixel();
    this.initTikTokPixel();

    this.isInitialized = true;
    console.log('📊 Tracking pixels inicializados');
  }

  /**
   * Inicializar Meta (Facebook) Pixel
   */
  private initMetaPixel(): void {
    if (!this.metaPixelId) {
      console.warn('⚠️  Meta Pixel ID no configurado');
      return;
    }

    // Facebook Pixel Code
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    window.fbq('init', this.metaPixelId);
    window.fbq('track', 'PageView');

    console.log('✅ Meta Pixel inicializado:', this.metaPixelId);
  }

  /**
   * Inicializar TikTok Pixel
   */
  private initTikTokPixel(): void {
    if (!this.tiktokPixelId) {
      console.warn('⚠️  TikTok Pixel ID no configurado');
      return;
    }

    const pixelId = this.tiktokPixelId; // Guardar referencia antes de la función anónima

    // TikTok Pixel Code
    (function(w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
        'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
      ];
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function(t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function(e: any, n: any) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = document.createElement('script');
        o.type = 'text/javascript';
        o.async = true;
        o.src = i + '?sdkid=' + e + '&lib=' + t;
        var a = document.getElementsByTagName('script')[0];
        a.parentNode!.insertBefore(o, a);
      };

      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');

    console.log('✅ TikTok Pixel inicializado:', this.tiktokPixelId);
  }

  /**
   * Track PageView
   */
  trackPageView(pageName?: string): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'PageView');
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.page();
    }

    console.log('📄 PageView tracked:', pageName || 'Unknown');
  }

  /**
   * Track ViewContent - Usuario ve un producto
   */
  trackViewContent(data: {
    content_name: string;
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
  }): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'ViewContent', data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('ViewContent', data);
    }

    console.log('👁️  ViewContent tracked:', data);
  }

  /**
   * Track AddToCart
   */
  trackAddToCart(data: {
    content_name: string;
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
    quantity?: number;
  }): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'AddToCart', data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('AddToCart', data);
    }

    console.log('🛒 AddToCart tracked:', data);
  }

  /**
   * Track InitiateCheckout
   */
  trackInitiateCheckout(data: {
    content_ids: string[];
    contents: any[];
    value: number;
    currency: string;
    num_items: number;
  }): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'InitiateCheckout', data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('InitiateCheckout', data);
    }

    console.log('💳 InitiateCheckout tracked:', data);
  }

  /**
   * Track Purchase - Conversión completada
   */
  trackPurchase(data: {
    content_ids: string[];
    contents: any[];
    value: number;
    currency: string;
    transaction_id: string;
  }): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'Purchase', data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('CompletePayment', data);
    }

    console.log('💰 Purchase tracked:', data);
  }

  /**
   * Track Search
   */
  trackSearch(searchString: string): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'Search', {
        search_string: searchString
      });
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('Search', {
        query: searchString
      });
    }

    console.log('🔍 Search tracked:', searchString);
  }

  /**
   * Track Lead - Usuario da su email
   */
  trackLead(data?: any): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('track', 'Lead', data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track('SubmitForm', data);
    }

    console.log('📧 Lead tracked:', data);
  }

  /**
   * Track Custom Event
   */
  trackCustomEvent(eventName: string, data?: any): void {
    // Meta Pixel
    if (window.fbq && this.metaPixelId) {
      window.fbq('trackCustom', eventName, data);
    }

    // TikTok Pixel
    if (window.ttq && this.tiktokPixelId) {
      window.ttq.track(eventName, data);
    }

    console.log(`⭐ Custom event tracked: ${eventName}`, data);
  }

  /**
   * Check si los pixels están configurados
   */
  isConfigured(): {
    meta: boolean;
    tiktok: boolean;
  } {
    return {
      meta: !!this.metaPixelId,
      tiktok: !!this.tiktokPixelId
    };
  }
}

// Export singleton
export const trackingPixels = new TrackingPixels();
