import { useEffect, useState, useCallback } from 'react';

interface IzipayConfig {
  publicKey: string;
  amount: number;
  currency: string;
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  identityCode: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IzipayResponse {
  code: string;
  message: string;
  transactionId?: string;
  authorizationCode?: string;
  transactionDate?: string;
}

interface UseIzipayProps {
  onSuccess: (response: IzipayResponse) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    KR: any; // SDK de Izipay (Krypton)
  }
}

/**
 * Hook para integrar Izipay en React
 * Usa el SDK KR (Krypton) de Izipay
 */
export const useIzipay = ({ onSuccess, onError }: UseIzipayProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar si el SDK está cargado
  useEffect(() => {
    const checkIzipayLoaded = () => {
      if (window.KR && typeof window.KR.setFormConfig === 'function') {
        console.log('✅ SDK de Izipay (KR) cargado correctamente');
        setIsLoaded(true);
      } else {
        console.log('⏳ Esperando SDK de Izipay...');
        setTimeout(checkIzipayLoaded, 500);
      }
    };

    checkIzipayLoaded();
  }, []);

  /**
   * Abrir formulario de pago de Izipay
   */
  const openCardPayment = useCallback(async (config: IzipayConfig, formToken: string) => {
    if (!isLoaded || !window.KR) {
      console.error('❌ SDK de Izipay no está cargado');
      onError({ message: 'SDK de Izipay no disponible' });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🔵 Configurando formulario de Izipay con formToken');

      // Configurar el formulario con el token
      window.KR.setFormConfig({
        formToken: formToken,
        'kr-language': 'es-ES'
      });

      // Evento cuando el pago se envía
      window.KR.onSubmit(async (paymentResponse: any) => {
        console.log('📥 Respuesta de pago:', paymentResponse);

        if (paymentResponse.clientAnswer && paymentResponse.clientAnswer.orderStatus === 'PAID') {
          setIsProcessing(false);
          onSuccess({
            code: '00',
            message: 'Pago exitoso',
            transactionId: paymentResponse.clientAnswer.transactions?.[0]?.uuid,
            authorizationCode: paymentResponse.clientAnswer.transactions?.[0]?.transactionDetails?.cardDetails?.authorizationResponse,
            transactionDate: paymentResponse.clientAnswer.orderDetails?.creationDate
          });
        } else {
          setIsProcessing(false);
          onError({
            code: paymentResponse.clientAnswer?.orderStatus || 'ERROR',
            message: paymentResponse.clientAnswer?.orderStatusLabel || 'Error en el pago'
          });
        }

        return false; // Prevenir redirección automática
      });

      // Abrir el formulario de pago
      console.log('🚀 Abriendo formulario de pago de Izipay');
      window.KR.openPaymentForm();

    } catch (error) {
      console.error('❌ Error al abrir formulario de Izipay:', error);
      setIsProcessing(false);
      onError(error);
    }
  }, [isLoaded, onSuccess, onError]);

  return {
    isLoaded,
    isProcessing,
    openCardPayment
  };
};
