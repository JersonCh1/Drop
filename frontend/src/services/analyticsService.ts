// frontend/src/services/analyticsService.ts
class AnalyticsService {
  private baseUrl: string;
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private async trackEvent(type: string, event: string, data?: any): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': this.sessionId,
        },
        body: JSON.stringify({
          type,
          event,
          data: data || {},
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Configurar usuario autenticado
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  // Page Views
  trackPageView(page: string, additionalData?: any): void {
    this.trackEvent('PAGE_VIEW', 'page_visited', {
      page,
      title: document.title,
      referrer: document.referrer,
      ...additionalData
    });
  }

  // Product Events
  trackProductView(productId: number, productName: string, category?: string, price?: number): void {
    this.trackEvent('PRODUCT_VIEW', 'product_viewed', {
      productId,
      productName,
      category,
      price,
      timestamp: Date.now()
    });
  }

  trackAddToCart(productId: number, quantity: number, price: number, productName?: string): void {
    this.trackEvent('CART_ACTION', 'add_to_cart', {
      productId,
      quantity,
      price,
      productName,
      value: quantity * price
    });
  }

  trackRemoveFromCart(productId: number, quantity: number, price: number, productName?: string): void {
    this.trackEvent('CART_ACTION', 'remove_from_cart', {
      productId,
      quantity,
      price,
      productName,
      value: quantity * price
    });
  }

  trackCartUpdate(cartValue: number, itemCount: number): void {
    this.trackEvent('CART_ACTION', 'cart_updated', {
      cartValue,
      itemCount
    });
  }

  // Checkout Events
  trackCheckoutStarted(cartValue: number, itemCount: number, items: any[]): void {
    this.trackEvent('CART_ACTION', 'checkout_started', {
      cartValue,
      itemCount,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }

  trackCheckoutStepCompleted(step: number, stepName: string, additionalData?: any): void {
    this.trackEvent('CART_ACTION', 'checkout_step_completed', {
      step,
      stepName,
      ...additionalData
    });
  }

  trackPaymentMethodSelected(method: string): void {
    this.trackEvent('CART_ACTION', 'payment_method_selected', {
      method
    });
  }

  // Purchase Events
  trackPurchase(orderId: string, orderNumber: string, total: number, items: any[]): void {
    this.trackEvent('PURCHASE', 'purchase_completed', {
      orderId,
      orderNumber,
      total,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      itemCount: items.length,
      revenue: total
    });
  }

  trackPurchaseFailed(reason: string, step?: string): void {
    this.trackEvent('PURCHASE', 'purchase_failed', {
      reason,
      step
    });
  }

  // User Actions
  trackUserRegistration(method: string = 'email'): void {
    this.trackEvent('USER_ACTION', 'user_registered', {
      method,
      timestamp: Date.now()
    });
  }

  trackUserLogin(method: string = 'email'): void {
    this.trackEvent('USER_ACTION', 'user_logged_in', {
      method,
      timestamp: Date.now()
    });
  }

  trackSearch(query: string, resultsCount?: number): void {
    this.trackEvent('USER_ACTION', 'search_performed', {
      query,
      resultsCount,
      timestamp: Date.now()
    });
  }

  trackFilterApplied(filterType: string, filterValue: string): void {
    this.trackEvent('USER_ACTION', 'filter_applied', {
      filterType,
      filterValue
    });
  }

  trackEmailSignup(source?: string): void {
    this.trackEvent('USER_ACTION', 'email_signup', {
      source: source || 'unknown'
    });
  }

  // Engagement Events
  trackTimeOnPage(page: string, timeSpent: number): void {
    this.trackEvent('USER_ACTION', 'time_on_page', {
      page,
      timeSpent, // en segundos
      timestamp: Date.now()
    });
  }

  trackScroll(percentage: number, page: string): void {
    this.trackEvent('USER_ACTION', 'page_scroll', {
      percentage,
      page
    });
  }

  trackButtonClick(buttonName: string, context?: string): void {
    this.trackEvent('USER_ACTION', 'button_clicked', {
      buttonName,
      context
    });
  }

  trackLinkClick(linkText: string, url: string, external: boolean = false): void {
    this.trackEvent('USER_ACTION', 'link_clicked', {
      linkText,
      url,
      external
    });
  }

  // Error Tracking
  trackError(error: string, context?: string, fatal: boolean = false): void {
    this.trackEvent('USER_ACTION', 'error_occurred', {
      error,
      context,
      fatal,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Performance Tracking
  trackPageLoadTime(loadTime: number, page: string): void {
    this.trackEvent('USER_ACTION', 'page_load_time', {
      loadTime, // en millisegundos
      page
    });
  }

  // Social Media Tracking
  trackSocialShare(platform: string, content: string): void {
    this.trackEvent('USER_ACTION', 'social_share', {
      platform,
      content
    });
  }

  // Review and Rating Events
  trackReviewSubmitted(productId: number, rating: number): void {
    this.trackEvent('USER_ACTION', 'review_submitted', {
      productId,
      rating
    });
  }

  // Newsletter and Communication
  trackNewsletterSignup(source: string): void {
    this.trackEvent('USER_ACTION', 'newsletter_signup', {
      source
    });
  }

  // Custom Events
  trackCustomEvent(eventName: string, properties?: any): void {
    this.trackEvent('USER_ACTION', eventName, properties);
  }

  // Batch Events (para enviar múltiples eventos juntos)
  async trackBatch(events: Array<{type: string, event: string, data?: any}>): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/analytics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': this.sessionId,
        },
        body: JSON.stringify({
          events: events.map(e => ({
            ...e,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          }))
        })
      });
    } catch (error) {
      console.error('Batch analytics tracking error:', error);
    }
  }

  // Utilidades para tracking automático
  setupAutoTracking(): void {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.trackPageLoadTime(loadTime, window.location.pathname);
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track every 25%
          this.trackScroll(maxScroll, window.location.pathname);
        }
      }
    });

    // Track link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const link = target as HTMLAnchorElement;
        const isExternal = link.hostname !== window.location.hostname;
        this.trackLinkClick(link.textContent || link.href, link.href, isExternal);
      }
    });

    // Track unhandled errors
    window.addEventListener('error', (e) => {
      this.trackError(e.message, e.filename + ':' + e.lineno, true);
    });
  }

  // Debug mode
  enableDebugMode(): void {
    (window as any).analytics = this;
    console.log('Analytics debug mode enabled. Use window.analytics to access methods.');
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;