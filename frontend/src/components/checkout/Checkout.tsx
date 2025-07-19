import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  model: string;
  color: string;
  quantity: number;
  image: string;
}

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

const Checkout: React.FC<CheckoutProps> = ({ onClose, onOrderComplete }) => {
  const { items: cart, totalPrice, shippingCost, finalTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
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

  // Cálculos de precios
  const subtotal = totalPrice;
  const total = finalTotal;

  function calculateShipping(country: string): number {
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
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
    if (!formData.state.trim()) newErrors.state = 'Estado/Región es requerido';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerInfo: formData,
        items: cart,
        subtotal,
        shippingCost,
        total,
        orderDate: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Orden creada:', result);
        clearCart(); // Limpiar carrito después de orden exitosa
        onOrderComplete();
        alert('¡Orden creada exitosamente! Te contactaremos pronto.');
      } else {
        throw new Error('Error al crear la orden');
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
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-blue-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
              <p className="text-sm text-gray-600">Paso {currentStep} de 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Info Personal</span>
              <span>Dirección</span>
              <span>Confirmar</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Información Personal</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Pérez"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+51 999 999 999"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Información de Envío</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PE">Perú</option>
                    <option value="CO">Colombia</option>
                    <option value="EC">Ecuador</option>
                    <option value="BO">Bolivia</option>
                    <option value="CL">Chile</option>
                    <option value="AR">Argentina</option>
                    <option value="BR">Brasil</option>
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Av. Principal 123, Dpto 4B"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Lima"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado/Región *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Lima"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="15001"
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Costo de Envío</h4>
                  <p className="text-blue-800">${shippingCost.toFixed(2)} USD</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Tiempo estimado: 5-10 días hábiles
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Confirmar Orden</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Información del Cliente</h4>
                  <p className="text-sm text-gray-600">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.email}<br />
                    {formData.phone}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dirección de Envío</h4>
                  <p className="text-sm text-gray-600">
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.postalCode}<br />
                    {formData.country}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">Resumen de la Orden</h4>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.model} - {item.color}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Envío:</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800">Información de Pago</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Te contactaremos por WhatsApp para coordinar el pago y envío. 
                        Aceptamos transferencias bancarias y otros métodos locales.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={currentStep === 1 ? onClose : () => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Orden'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;