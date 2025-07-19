// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import analyticsService from '../services/analyticsService';

export interface CartItem {
  id: string;
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  model: string;
  color: string;
  quantity: number;
  image?: string;
  sku?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  tax: number;
  finalTotal: number;
  country: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'UPDATE_SHIPPING'; payload: { cost: number; country: string } }
  | { type: 'SET_COUNTRY'; payload: string };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  updateShippingCost: (cost: number, country: string) => void;
  setCountry: (country: string) => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  getFinalTotal: () => number;
  isItemInCart: (productId: number, variantId?: number) => boolean;
  getCartForCheckout: () => any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateShipping = (items: CartItem[], country: string = 'PE'): number => {
  if (items.length === 0) return 0;
  
  const shippingRates: { [key: string]: number } = {
    'PE': 5.00,  // Perú
    'CO': 8.00,  // Colombia
    'EC': 7.00,  // Ecuador
    'BO': 9.00,  // Bolivia
    'CL': 10.00, // Chile
    'AR': 12.00, // Argentina
    'BR': 15.00, // Brasil
    'MX': 18.00, // México
    'US': 25.00, // Estados Unidos
    'CA': 28.00, // Canadá
    'ES': 22.00, // España
    'FR': 24.00, // Francia
    'DE': 23.00, // Alemania
    'GB': 26.00, // Reino Unido
    'IT': 21.00, // Italia
    'OTHER': 30.00 // Otros países
  };
  
  return shippingRates[country] || shippingRates['OTHER'];
};

const calculateTax = (subtotal: number, country: string = 'PE'): number => {
  const taxRates: { [key: string]: number } = {
    'PE': 0,      // Perú - Sin impuestos para dropshipping
    'CO': 0,      // Colombia
    'EC': 0,      // Ecuador
    'BO': 0,      // Bolivia
    'CL': 0,      // Chile
    'AR': 0,      // Argentina
    'BR': 0,      // Brasil
    'MX': 0.16,   // México - IVA 16%
    'US': 0.08,   // Estados Unidos - Sales Tax promedio
    'CA': 0.13,   // Canadá - HST/GST promedio
    'ES': 0.21,   // España - IVA 21%
    'FR': 0.20,   // Francia - TVA 20%
    'DE': 0.19,   // Alemania - MwSt 19%
    'GB': 0.20,   // Reino Unido - VAT 20%
    'IT': 0.22,   // Italia - IVA 22%
    'OTHER': 0.15 // Otros países - promedio 15%
  };
  
  return subtotal * (taxRates[country] || 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = { ...action.payload, quantity: action.payload.quantity || 1 };
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      let updatedItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Item ya existe, actualizar cantidad
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxQuantity || 99) }
            : item
        );
      } else {
        // Nuevo item
        updatedItems = [...state.items, newItem as CartItem];
      }
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems, state.country);
      const tax = calculateTax(totalPrice, state.country);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems, state.country);
      const tax = calculateTax(totalPrice, state.country);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }
      
      const updatedItems = state.items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
          : item
      );
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems, state.country);
      const tax = calculateTax(totalPrice, state.country);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        shippingCost: 0,
        tax: 0,
        finalTotal: 0
      };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    
    case 'LOAD_CART': {
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(items, state.country);
      const tax = calculateTax(totalPrice, state.country);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'UPDATE_SHIPPING': {
      const { cost, country } = action.payload;
      const tax = calculateTax(state.totalPrice, country);
      const finalTotal = state.totalPrice + cost + tax;
      
      return {
        ...state,
        shippingCost: cost,
        country,
        tax,
        finalTotal
      };
    }

    case 'SET_COUNTRY': {
      const country = action.payload;
      const shippingCost = calculateShipping(state.items, country);
      const tax = calculateTax(state.totalPrice, country);
      const finalTotal = state.totalPrice + shippingCost + tax;
      
      return {
        ...state,
        country,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  shippingCost: 0,
  tax: 0,
  finalTotal: 0,
  country: 'PE' // País por defecto
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedCountry = localStorage.getItem('shippingCountry');
    
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }

    if (savedCountry) {
      dispatch({ type: 'SET_COUNTRY', payload: savedCountry });
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  // Guardar país cuando cambie
  useEffect(() => {
    localStorage.setItem('shippingCountry', state.country);
  }, [state.country]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    
    // Analytics
    analyticsService.trackAddToCart(
      item.productId,
      item.quantity || 1,
      item.price,
      item.name
    );
    
    // Toast notification
    toast.success(`${item.name} agregado al carrito`, {
      icon: '🛒',
      duration: 3000,
    });
  };

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      
      // Analytics
      analyticsService.trackRemoveFromCart(
        item.productId,
        item.quantity,
        item.price,
        item.name
      );
      
      // Toast notification
      toast.success(`${item.name} removido del carrito`, {
        icon: '🗑️',
        duration: 2000,
      });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      const oldQuantity = item.quantity;
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      
      // Analytics para cambio de cantidad
      if (quantity > oldQuantity) {
        analyticsService.trackAddToCart(
          item.productId,
          quantity - oldQuantity,
          item.price,
          item.name
        );
      } else if (quantity < oldQuantity) {
        analyticsService.trackRemoveFromCart(
          item.productId,
          oldQuantity - quantity,
          item.price,
          item.name
        );
      }
      
      // Update cart analytics
      analyticsService.trackCartUpdate(state.totalPrice, state.totalItems);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Carrito vaciado', {
      icon: '🧹',
      duration: 2000,
    });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const updateShippingCost = (cost: number, country: string) => {
    dispatch({ type: 'UPDATE_SHIPPING', payload: { cost, country } });
  };

  const setCountry = (country: string) => {
    dispatch({ type: 'SET_COUNTRY', payload: country });
  };

  const getItemCount = (): number => {
    return state.totalItems;
  };

  const getTotalPrice = (): number => {
    return state.totalPrice;
  };

  const getFinalTotal = (): number => {
    return state.finalTotal;
  };

  const isItemInCart = (productId: number, variantId?: number): boolean => {
    return state.items.some(item => 
      item.productId === productId && 
      (variantId ? item.variantId === variantId : true)
    );
  };

  const getCartForCheckout = () => {
    return {
      items: state.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        model: item.model,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku
      })),
      subtotal: state.totalPrice,
      shippingCost: state.shippingCost,
      tax: state.tax,
      total: state.finalTotal,
      country: state.country,
      itemCount: state.totalItems
    };
  };

    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    updateShippingCost,
    setCountry,
    getItemCount,
    getTotalPrice,
    getFinalTotal,
    isItemInCart,
    getCartForCheckout
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
    // frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import analyticsService from '../services/analyticsService';

export interface CartItem {
  id: string;
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  model: string;
  color: string;
  quantity: number;
  image?: string;
  sku?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  tax: number;
  finalTotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'UPDATE_SHIPPING'; payload: number };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  updateShippingCost: (cost: number) => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  isItemInCart: (productId: number, variantId?: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateShipping = (items: CartItem[], country: string = 'PE'): number => {
  if (items.length === 0) return 0;
  
  const shippingRates: { [key: string]: number } = {
    'PE': 5.00,  // Perú
    'CO': 8.00,  // Colombia
    'EC': 7.00,  // Ecuador
    'BO': 9.00,  // Bolivia
    'CL': 10.00, // Chile
    'AR': 12.00, // Argentina
    'BR': 15.00, // Brasil
    'MX': 18.00, // México
    'US': 25.00, // Estados Unidos
    'OTHER': 30.00 // Otros países
  };
  
  return shippingRates[country] || shippingRates['OTHER'];
};

const calculateTax = (subtotal: number, country: string = 'PE'): number => {
  // En la mayoría de países latinoamericanos no se cobra tax en dropshipping
  const taxRates: { [key: string]: number } = {
    'PE': 0,
    'CO': 0,
    'EC': 0,
    'BO': 0,
    'CL': 0,
    'AR': 0,
    'BR': 0,
    'MX': 0,
    'US': 0.08, // 8% en algunos estados de US
    'OTHER': 0
  };
  
  return subtotal * (taxRates[country] || 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = { ...action.payload, quantity: action.payload.quantity || 1 };
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      let updatedItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Item ya existe, actualizar cantidad
        updatedItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxQuantity || 99) }
            : item
        );
      } else {
        // Nuevo item
        updatedItems = [...state.items, newItem as CartItem];
      }
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems);
      const tax = calculateTax(totalPrice);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems);
      const tax = calculateTax(totalPrice);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si cantidad es 0 o menor, remover item
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }
      
      const updatedItems = state.items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
          : item
      );
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(updatedItems);
      const tax = calculateTax(totalPrice);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        shippingCost: 0,
        tax: 0,
        finalTotal: 0
      };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    
    case 'LOAD_CART': {
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = calculateShipping(items);
      const tax = calculateTax(totalPrice);
      const finalTotal = totalPrice + shippingCost + tax;
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        shippingCost,
        tax,
        finalTotal
      };
    }
    
    case 'UPDATE_SHIPPING': {
      const shippingCost = action.payload;
      const tax = calculateTax(state.totalPrice);
      const finalTotal = state.totalPrice + shippingCost + tax;
      
      return {
        ...state,
        shippingCost,
        finalTotal
      };
    }
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  shippingCost: 0,
  tax: 0,
  finalTotal: 0
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }