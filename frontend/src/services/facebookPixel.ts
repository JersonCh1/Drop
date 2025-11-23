/**
 * Facebook Pixel Service
 *
 * Servicio para rastrear eventos de e-commerce en Facebook Pixel
 * Documentación: https://developers.facebook.com/docs/facebook-pixel/implementation
 */

// Extender el objeto Window para incluir fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Verifica si Facebook Pixel está cargado
 */
const isPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Evento: Ver contenido (ViewContent)
 * Se dispara cuando un usuario ve un producto
 */
export const trackViewContent = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category || 'Phone Cases',
    value: product.price,
    currency: product.currency || 'USD',
  });

  console.log('📊 Facebook Pixel: ViewContent tracked', product.name);
};

/**
 * Evento: Agregar al carrito (AddToCart)
 * Se dispara cuando un usuario agrega un producto al carrito
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * (product.quantity || 1),
    currency: product.currency || 'USD',
  });

  console.log('📊 Facebook Pixel: AddToCart tracked', product.name);
};

/**
 * Evento: Iniciar checkout (InitiateCheckout)
 * Se dispara cuando un usuario inicia el proceso de pago
 */
export const trackInitiateCheckout = (cart: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'InitiateCheckout', {
    content_ids: cart.items.map(item => item.id),
    contents: cart.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_type: 'product',
    value: cart.total,
    currency: cart.currency || 'USD',
    num_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  });

  console.log('📊 Facebook Pixel: InitiateCheckout tracked', cart.total);
};

/**
 * Evento: Agregar información de pago (AddPaymentInfo)
 * Se dispara cuando un usuario agrega información de pago
 */
export const trackAddPaymentInfo = (cart: {
  total: number;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'AddPaymentInfo', {
    value: cart.total,
    currency: cart.currency || 'USD',
  });

  console.log('📊 Facebook Pixel: AddPaymentInfo tracked');
};

/**
 * Evento: Compra completada (Purchase)
 * Se dispara cuando un usuario completa una compra exitosamente
 */
export const trackPurchase = (order: {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'Purchase', {
    content_ids: order.items.map(item => item.id),
    contents: order.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_type: 'product',
    value: order.total,
    currency: order.currency || 'USD',
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    // ID único de la orden para evitar duplicados
    order_id: order.orderId,
  });

  console.log('📊 Facebook Pixel: Purchase tracked', order.orderId, order.total);
};

/**
 * Evento: Búsqueda (Search)
 * Se dispara cuando un usuario busca productos
 */
export const trackSearch = (searchTerm: string) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'Search', {
    search_string: searchTerm,
  });

  console.log('📊 Facebook Pixel: Search tracked', searchTerm);
};

/**
 * Evento: Agregar a wishlist (AddToWishlist)
 * Se dispara cuando un usuario agrega un producto a favoritos
 */
export const trackAddToWishlist = (product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'AddToWishlist', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: product.currency || 'USD',
  });

  console.log('📊 Facebook Pixel: AddToWishlist tracked', product.name);
};

/**
 * Evento personalizado
 * Para eventos custom que no están en el estándar de Facebook
 */
export const trackCustomEvent = (eventName: string, params?: any) => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('trackCustom', eventName, params);

  console.log('📊 Facebook Pixel: Custom event tracked', eventName, params);
};

/**
 * Rastrear visualización de página
 * Ya se hace automáticamente, pero puedes usarlo para SPAs
 */
export const trackPageView = () => {
  if (!isPixelLoaded()) {
    console.warn('Facebook Pixel no está cargado');
    return;
  }

  window.fbq('track', 'PageView');

  console.log('📊 Facebook Pixel: PageView tracked');
};

export default {
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackAddToWishlist,
  trackCustomEvent,
  trackPageView,
};
