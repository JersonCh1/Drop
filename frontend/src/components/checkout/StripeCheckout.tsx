// frontend/src/components/checkout/StripeCheckout.tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface StripeCheckoutProps {
  orderData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<{
  orderData: any;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ orderData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Confirmar el pago
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
      });

      if (error) {
        toast.error(error.message || 'Error al procesar el pago');
        setProcessing(false);
      } else {
        toast.success('Pago procesado exitosamente');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('Error al procesar el pago');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
        <PaymentElement />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">${orderData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Envío:</span>
          <span className="font-semibold">${orderData.shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span className="text-blue-600">${orderData.total.toFixed(2)} USD</span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? 'Procesando...' : `Pagar $${orderData.total.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ orderData, onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post(`${API_URL}/stripe/create-checkout-session`, {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total
      });

      if (response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
      } else if (response.data.url) {
        // Redireccionar a Stripe Checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Error al iniciar el proceso de pago');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Preparando checkout...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar el checkout. Por favor intenta de nuevo.</p>
        <button
          onClick={onCancel}
          className="mt-4 bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#2563eb',
            },
          },
        }}
      >
        <CheckoutForm
          orderData={orderData}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default StripeCheckout;
