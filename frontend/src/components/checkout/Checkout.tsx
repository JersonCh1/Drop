import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { QRCodeSVG } from 'qrcode.react';
import { useIzipay } from '../../hooks/useIzipay';
import PaymentMethodSelector from './PaymentMethodSelector';
import { trackingPixels } from '../../utils/trackingPixels';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface CheckoutProps {
  onClose: () => void;
  onOrderComplete: () => void;
}

type PaymentMethod = 'yape' | 'plin' | 'izipay' | 'mercadopago';

const Checkout: React.FC<CheckoutProps> = ({ onClose, onOrderComplete }) => {
  const { items: cart, totalPrice, shippingCost, finalTotal, clearCart } = useCart();

  // Track InitiateCheckout cuando se abre el checkout
  useEffect(() => {
    if (cart.length > 0) {
      trackingPixels.trackInitiateCheckout({
        content_ids: cart.map(item => item.productId.toString()),
        contents: cart.map(item => ({
          id: item.productId.toString(),
          quantity: item.quantity,
          name: item.name
        })),
        value: finalTotal,
        currency: 'USD',
        num_items: cart.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  }, []); // Solo al montar el componente

  // Determinar método de pago por defecto
  const defaultPaymentMethod: PaymentMethod = 'izipay'; // Izipay es la pasarela principal

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultPaymentMethod);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'PE',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [operationCode, setOperationCode] = useState('');
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  // Estado del cupón
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Cálculos de precios
  const subtotal = totalPrice;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = appliedCoupon ? appliedCoupon.newTotal + shippingCost : finalTotal;

  // Inicializar Izipay
  const { isLoaded: isIzipayLoaded, openCardPayment } = useIzipay({
    onSuccess: async (response) => {
      console.log('Pago exitoso con Izipay:', response);

      // Track Purchase
      trackingPixels.trackPurchase({
        content_ids: cart.map(item => item.productId.toString()),
        contents: cart.map(item => ({
          id: item.productId.toString(),
          quantity: item.quantity,
          name: item.name
        })),
        value: total,
        currency: 'USD',
        transaction_id: response.transactionId || `izipay_${Date.now()}`
      });

      clearCart();
      alert('¡Pago exitoso! Tu orden ha sido procesada.');
      onOrderComplete();
    },
    onError: (error) => {
      console.error('Error de Izipay:', error);
      alert('Hubo un error al procesar el pago con Izipay. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
    if (!formData.state.trim()) newErrors.state = 'Estado/Región es requerido';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal: totalPrice,
          userId: null // Por ahora sin usuario
        })
      });

      const result = await response.json();

      if (result.success) {
        setAppliedCoupon(result.data);
        setCouponError('');
      } else {
        setCouponError(result.message || 'Cupón no válido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validando cupón:', error);
      setCouponError('Error al validar el cupón. Intenta de nuevo.');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleConfirmPayment = async () => {
    if (!operationCode.trim()) {
      alert('Por favor ingresa el código de operación');
      return;
    }

    if (operationCode.trim().length < 6) {
      alert('El código de operación debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo: pendingOrderData.customerInfo,
          items: pendingOrderData.items.map((item: any) => ({
            name: item.name,
            model: item.model || '',
            color: item.color || '',
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: pendingOrderData.subtotal,
          shippingCost: pendingOrderData.shippingCost,
          total: pendingOrderData.total,
          paymentMethod: pendingOrderData.paymentMethod,
          operationCode: operationCode.trim(),
          orderDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden');
      }

      const result = await response.json();
      console.log('Order created with operation code:', result);

      // Track Purchase
      const orderId = result.data?.id || result.orderNumber;
      trackingPixels.trackPurchase({
        content_ids: pendingOrderData.items.map((item: any) => item.productId?.toString() || '0'),
        contents: pendingOrderData.items.map((item: any) => ({
          id: item.productId?.toString() || '0',
          quantity: item.quantity,
          name: item.name
        })),
        value: pendingOrderData.total,
        currency: 'USD',
        transaction_id: orderId || `${pendingOrderData.paymentMethod}_${Date.now()}`
      });

      clearCart();
      setShowPaymentConfirmation(false);
      alert('¡Pago confirmado! Tu orden ha sido registrada exitosamente. Recibirás un email de confirmación.');
      onOrderComplete();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al confirmar tu pago. Por favor intenta de nuevo o contacta con soporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

      if (paymentMethod === 'mercadopago') {
        // Crear preferencia de MercadoPago
        const response = await fetch(`${API_URL}/mercadopago/create-preference`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData: {
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              customerPhone: formData.phone,
              shippingAddress: formData.address,
              shippingCity: formData.city,
              shippingState: formData.state,
              shippingZip: formData.postalCode,
              shippingCountry: formData.country
            },
            items: cart.map(item => ({
              productId: item.id,
              variantId: item.variantId || null,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || ''
            }))
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('MercadoPago preference created:', result);

          // Track Purchase (nota: en MercadoPago el pago se completa después del redirect, pero trackeamos la intención)
          trackingPixels.trackPurchase({
            content_ids: cart.map(item => item.productId.toString()),
            contents: cart.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              name: item.name
            })),
            value: total,
            currency: 'USD',
            transaction_id: result.preferenceId || `mercadopago_${Date.now()}`
          });

          clearCart();

          // Redirigir a MercadoPago
          if (result.initPoint) {
            window.location.href = result.initPoint;
          } else {
            alert('Error al crear el link de pago de MercadoPago');
          }
        } else {
          throw new Error('Error al crear la preferencia de MercadoPago');
        }
      } else if (paymentMethod === 'izipay') {
        // Izipay - Obtener FormToken y abrir modal de pago
        if (!isIzipayLoaded) {
          alert('El SDK de Izipay aún no está cargado. Por favor espera un momento e intenta de nuevo.');
          setIsSubmitting(false);
          return;
        }

        // Primero crear orden en la BD
        const orderResponse = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerInfo: formData,
            items: cart.map(item => ({
              name: item.name,
              model: item.model || '',
              color: item.color || '',
              quantity: item.quantity,
              price: item.price
            })),
            subtotal,
            shippingCost,
            total,
            paymentMethod: 'izipay',
            orderDate: new Date().toISOString()
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Error al crear la orden');
        }

        const orderResult = await orderResponse.json();
        const orderId = orderResult.data?.id || orderResult.orderNumber;

        // Obtener FormToken del backend
        const response = await fetch(`${API_URL}/izipay/formtoken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'PEN',
            orderId: orderId,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phone,
            identityType: 'DNI',
            identityCode: formData.postalCode, // Usamos postal code como identidad
            address: formData.address,
            country: formData.country,
            city: formData.city,
            state: formData.state,
            zipCode: formData.postalCode
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Izipay formToken obtained:', result);

          // Abrir el formulario de pago de Izipay usando el hook
          await openCardPayment(
            {
              publicKey: process.env.REACT_APP_IZIPAY_PUBLIC_KEY || '',
              amount: total,
              currency: 'PEN',
              orderId: orderId,
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phoneNumber: formData.phone,
              identityCode: formData.postalCode,
              address: formData.address,
              country: formData.country,
              city: formData.city,
              state: formData.state,
              zipCode: formData.postalCode
            },
            result.formToken
          );
        } else {
          throw new Error('Error al obtener FormToken de Izipay');
        }
      } else if (paymentMethod === 'yape' || paymentMethod === 'plin') {
        // Yape/Plin - Procesar vía Izipay
        // Primero crear orden en la BD
        const orderResponse = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerInfo: formData,
            items: cart.map(item => ({
              name: item.name,
              model: item.model || '',
              color: item.color || '',
              quantity: item.quantity,
              price: item.price
            })),
            subtotal,
            shippingCost,
            total,
            paymentMethod: paymentMethod,
            orderDate: new Date().toISOString()
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Error al crear la orden');
        }

        const orderResult = await orderResponse.json();
        const orderId = orderResult.data?.id || orderResult.orderNumber;

        // Obtener FormToken del backend especificando el método de pago
        const response = await fetch(`${API_URL}/izipay/formtoken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'PEN',
            orderId: orderId,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phone,
            identityType: 'DNI',
            identityCode: formData.postalCode,
            address: formData.address,
            country: 'PE',
            city: formData.city,
            state: formData.state,
            zipCode: formData.postalCode,
            payMethod: paymentMethod === 'yape' ? 'YAPE_CODE' : 'PLIN'
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Izipay ${paymentMethod} formToken obtained:`, result);

          // Track Purchase intent
          trackingPixels.trackPurchase({
            content_ids: cart.map(item => item.productId.toString()),
            contents: cart.map(item => ({
              id: item.productId.toString(),
              quantity: item.quantity,
              name: item.name
            })),
            value: total,
            currency: 'USD',
            transaction_id: orderId
          });

          clearCart();

          // TODO: Aquí se debería usar el hook useIzipay para abrir el formulario
          // Por ahora, simplemente mostramos un mensaje
          alert(`Se abrirá el formulario de ${paymentMethod.toUpperCase()} vía Izipay. (Pendiente: integrar SDK completo en frontend)`);
          onOrderComplete();
        } else {
          throw new Error(`Error al obtener FormToken de Izipay para ${paymentMethod}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar tu orden. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-br from-gray-50 to-white shadow-2xl overflow-y-auto">
        <form onSubmit={handleSubmitOrder} className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold">Finalizar Compra</h2>
                <p className="text-blue-100 text-sm mt-1">Completa tu información para procesar el pago</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Información Personal y Envío */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                  Información de Contacto y Envío
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Pérez"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+51 999 999 999"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Av. Principal 123, Dpto 4B"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Lima"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado/Región *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Lima"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="15001"
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      País *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="PE">Perú</option>
                      <option value="CO">Colombia</option>
                      <option value="EC">Ecuador</option>
                      <option value="BO">Bolivia</option>
                      <option value="CL">Chile</option>
                      <option value="AR">Argentina</option>
                      <option value="US">Estados Unidos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                  Método de Pago
                </h3>
                <p className="text-sm text-gray-600 mb-6 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Transacciones 100% seguras y protegidas
                </p>

                {/* Payment Method Selection - Modern Futuristic Style */}
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelectMethod={(method) => setPaymentMethod(method as PaymentMethod)}
                />

                {/* MercadoPago Info */}
                {paymentMethod === 'mercadopago' && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Redirigiendo a MercadoPago</h4>
                        <p className="text-sm text-gray-600">
                          Serás redirigido a la plataforma segura de MercadoPago para completar tu pago.
                          Acepta todas las tarjetas locales y métodos de pago de Perú.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yape Info */}
                {paymentMethod === 'yape' && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pago con Yape vía Izipay</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Paga con Yape de manera instantánea a través de la pasarela segura de Izipay.
                          Genera tu código de aprobación en la app de Yape e ingrésalo en el formulario.
                        </p>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-700 font-medium">
                            ✓ Pago instantáneo con código OTP<br/>
                            ✓ Sin comisiones adicionales<br/>
                            ✓ Confirmación inmediata automática<br/>
                            ✓ Procesado por BCP (Izipay)
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          Abre tu app Yape → Menú → "Código de aprobación" → Ingresa el código aquí
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plin Info */}
                {paymentMethod === 'plin' && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💸</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pago con Plin vía Izipay</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Paga con Plin de manera instantánea a través de la pasarela segura de Izipay.
                          Compatible con todos los bancos del Perú: Interbank, Scotiabank, BBVA y más.
                        </p>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-700 font-medium">
                            ✓ Transferencia inmediata<br/>
                            ✓ Compatible con todos los bancos<br/>
                            ✓ Sin comisiones adicionales<br/>
                            ✓ Procesado por BCP (Izipay)
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          Se abrirá el formulario de pago para completar tu transacción con Plin
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Izipay Info */}
                {paymentMethod === 'izipay' && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pago con Izipay</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Pasarela oficial del BCP (Banco de Crédito del Perú). Acepta todas las tarjetas:
                          Visa, Mastercard, American Express y Diners. Pago 100% seguro con automatización CJ Dropshipping.
                        </p>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-700 font-medium">
                            ✓ Todas las tarjetas (Visa, Mastercard, Amex, Diners)<br/>
                            ✓ Procesamiento instantáneo<br/>
                            ✓ Dinero disponible al día siguiente<br/>
                            ✓ Automatización 100% con CJ Dropshipping
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          Se abrirá el formulario seguro de Izipay para completar tu pago.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección de Cupón de Descuento */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                  Cupón de Descuento
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Tienes un cupón? Ingrésalo aquí para obtener tu descuento
                </p>

                {!appliedCoupon ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Ej: VERANO20"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all uppercase font-mono tracking-wide"
                      disabled={isValidatingCoupon}
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                    >
                      {isValidatingCoupon ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Validando...</span>
                        </>
                      ) : (
                        <span>Aplicar</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appliedCoupon.description || `Descuento de ${appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : `S/ ${appliedCoupon.discountValue}`} aplicado`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          -${discountAmount.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold mt-1 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Quitar cupón
                        </button>
                      </div>
                    </div>
                    {appliedCoupon.freeShipping && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm text-green-700 font-semibold flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          ¡Envío GRATIS incluido!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {couponError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{couponError}</p>
                  </div>
                )}
              </div>

              {/* Resumen de Orden */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4">Resumen de tu Orden</h3>

                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-blue-100">{item.model} - {item.color} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-white/20 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-300 font-semibold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Descuento ({appliedCoupon.code}):
                      </span>
                      <span className="font-bold text-green-300">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Envío:</span>
                    <span className="font-semibold">
                      {appliedCoupon?.freeShipping ? (
                        <span className="text-green-300 font-bold">GRATIS</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold border-t border-white/20 pt-3 mt-3">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-green-300 font-semibold">
                        ¡Ahorraste ${(discountAmount + (appliedCoupon.freeShipping ? shippingCost : 0)).toFixed(2)}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer con Botón de Pago */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-2xl">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Pagar ${total.toFixed(2)}</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Confirmación de Pago Yape/Plin */}
      {showPaymentConfirmation && pendingOrderData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => {
                setShowPaymentConfirmation(false);
                setIsSubmitting(false);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                pendingOrderData.paymentMethod === 'yape'
                  ? 'bg-purple-100'
                  : 'bg-green-100'
              }`}>
                <span className="text-5xl">{pendingOrderData.paymentMethod === 'yape' ? '📱' : '💸'}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Pagar con {pendingOrderData.paymentMethod === 'yape' ? 'Yape' : 'Plin'}
              </h3>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                ${pendingOrderData.total.toFixed(2)}
              </p>
            </div>

            <div className={`p-6 rounded-2xl mb-6 ${
              pendingOrderData.paymentMethod === 'yape'
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
            }`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* QR Code */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200">
                    <QRCodeSVG
                      value={`917780708`}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    <strong>Escanea con tu app</strong>
                  </p>
                </div>

                {/* Instrucciones */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Instrucciones de Pago
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 font-bold text-xs">1</span>
                      <span>Abre tu app de <strong>{pendingOrderData.paymentMethod === 'yape' ? 'Yape' : 'Plin'}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 font-bold text-xs">2</span>
                      <span>Escanea el QR o envía <strong>${pendingOrderData.total.toFixed(2)}</strong> al número <strong>917 780 708</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 font-bold text-xs">3</span>
                      <span>Copia el <strong>código de operación</strong> que aparece después del pago</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 font-bold text-xs">4</span>
                      <span>Pega el código abajo y confirma</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Código de Operación *
              </label>
              <input
                type="text"
                value={operationCode}
                onChange={(e) => setOperationCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123456"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-lg text-center tracking-wider"
                maxLength={20}
              />
              <p className="text-xs text-gray-600 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Ingresa el código exactamente como aparece en tu app
              </p>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting || !operationCode.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Confirmando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Pago</span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Al confirmar, aceptas que realizaste el pago y proporcionas el código de operación válido
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
