// frontend/src/utils/googleAnalytics.ts
// Google Analytics 4 Integration

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';

// Inicializar Google Analytics
export const initGA = (): void => {
  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics ID no configurado');
    return;
  }

  // Crear script para gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Inicializar dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    send_page_view: false // Lo haremos manualmente
  });

  console.log('✅ Google Analytics inicializado:', GA_TRACKING_ID);
};

// Track Page View
export const trackPageView = (url: string): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track Events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce Events

// Ver producto
export const trackProductView = (product: {
  id: string | number;
  name: string;
  category?: string;
  price?: number;
}): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: 'EUR',
    value: product.price || 0,
    items: [
      {
        item_id: product.id.toString(),
        item_name: product.name,
        item_category: product.category || 'Carcasas iPhone',
        price: product.price || 0,
      },
    ],
  });
};

// Agregar al carrito
export const trackAddToCart = (product: {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'EUR',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id.toString(),
        item_name: product.name,
        item_category: product.category || 'Carcasas iPhone',
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
};

// Remover del carrito
export const trackRemoveFromCart = (product: {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'remove_from_cart', {
    currency: 'EUR',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id.toString(),
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
};

// Iniciar checkout
export const trackBeginCheckout = (items: any[], total: number): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: total,
    items: items.map((item) => ({
      item_id: item.id?.toString() || item.productId?.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

// Completar compra
export const trackPurchase = (order: {
  orderId: string;
  total: number;
  shipping?: number;
  tax?: number;
  items: any[];
}): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: order.orderId,
    currency: 'EUR',
    value: order.total,
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    items: order.items.map((item) => ({
      item_id: item.id?.toString() || item.productId?.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

// Búsqueda
export const trackSearch = (searchTerm: string): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });
};

// Registro de usuario
export const trackSignUp = (method: string = 'email'): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'sign_up', {
    method: method,
  });
};

// Login de usuario
export const trackLogin = (method: string = 'email'): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'login', {
    method: method,
  });
};

// Share
export const trackShare = (method: string, contentType: string, itemId: string): void => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'share', {
    method: method,
    content_type: contentType,
    item_id: itemId,
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackSignUp,
  trackLogin,
  trackShare,
};
