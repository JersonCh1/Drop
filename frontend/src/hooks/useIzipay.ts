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
  payMethod?: 'CARD' | 'YAPE_CODE' | 'PLIN'; // Métodos de pago soportados
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
    Izipay: any;
  }
}

/**
 * Hook para integrar Izipay en React
 * Maneja tarjetas, Yape y Plin
 */
export const useIzipay = ({ onSuccess, onError }: UseIzipayProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar si el SDK está cargado
  useEffect(() => {
    const checkIzipayLoaded = () => {
      if (window.Izipay) {
        setIsLoaded(true);
      } else {
        // Reintentar cada 500ms hasta que se cargue
        setTimeout(checkIzipayLoaded, 500);
      }
    };

    checkIzipayLoaded();
  }, []);

  /**
   * Abrir formulario de Izipay para tarjetas
   */
  const openCardPayment = useCallback(async (config: IzipayConfig, formToken: string) => {
    if (!isLoaded || !window.Izipay) {
      console.error('SDK de Izipay no está cargado');
      onError({ message: 'SDK de Izipay no disponible' });
      return;
    }

    setIsProcessing(true);

    try {
      const iziConfig = {
        transactionId: config.orderId,
        merchantCode: config.publicKey.substring(0, 10), // Primeros 10 chars del public key
        order: {
          orderNumber: config.orderId,
          currency: config.currency,
          amount: config.amount * 100, // Convertir a centavos
          processType: 'AT', // Autorización y captura
          merchantBuyerId: config.email,
          dateTimeTransaction: new Date().toISOString()
        },
        billing: {
          firstName: config.firstName,
          lastName: config.lastName,
          email: config.email,
          phoneNumber: config.phoneNumber,
          street: config.address,
          city: config.city,
          state: config.state,
          country: config.country,
          postalCode: config.zipCode,
          document: config.identityCode,
          documentType: 'DNI'
        },
        appearance: {
          logo: '', // URL del logo de tu tienda (opcional)
          theme: 'default'
        }
      };

      const checkout = new window.Izipay({ config: iziConfig });

      // Cargar el formulario con el formToken
      await checkout.LoadForm({
        authorization: formToken,
        keyRSA: config.publicKey,
        callbackResponse: (response: IzipayResponse) => {
          setIsProcessing(false);

          if (response.code === '00') {
            // Pago exitoso
            onSuccess(response);
          } else {
            // Error en el pago
            onError(response);
          }
        }
      });

    } catch (error) {
      console.error('Error al abrir formulario de Izipay:', error);
      setIsProcessing(false);
      onError(error);
    }
  }, [isLoaded, onSuccess, onError]);

  /**
   * Procesar pago con Yape
   */
  const processYapePayment = useCallback(async (config: IzipayConfig, formToken: string, yapeCode: string) => {
    if (!isLoaded || !window.Izipay) {
      console.error('SDK de Izipay no está cargado');
      onError({ message: 'SDK de Izipay no disponible' });
      return;
    }

    setIsProcessing(true);

    try {
      const iziConfig = {
        transactionId: config.orderId,
        merchantCode: config.publicKey.substring(0, 10),
        order: {
          orderNumber: config.orderId,
          currency: 'PEN', // Yape solo soporta PEN
          amount: config.amount * 100,
          processType: 'AT',
          merchantBuyerId: config.email,
          dateTimeTransaction: new Date().toISOString()
        },
        billing: {
          firstName: config.firstName,
          lastName: config.lastName,
          email: config.email,
          phoneNumber: config.phoneNumber,
          street: config.address,
          city: config.city,
          state: config.state,
          country: 'PE',
          postalCode: config.zipCode,
          document: config.identityCode,
          documentType: 'DNI'
        },
        payMethod: 'YAPE_CODE' // Especificar método Yape
      };

      const checkout = new window.Izipay({ config: iziConfig });

      // Procesar pago con código Yape
      await checkout.LoadForm({
        authorization: formToken,
        keyRSA: config.publicKey,
        yapeOTP: yapeCode, // Código OTP de Yape
        callbackResponse: (response: IzipayResponse) => {
          setIsProcessing(false);

          if (response.code === '00') {
            onSuccess(response);
          } else {
            // Códigos de error específicos de Yape:
            // Y06: Restricciones de Yape
            // Y07: Excede límite diario
            // Y08: Cuenta bloqueada
            // Y12/Y13: Código OTP inválido/expirado
            onError(response);
          }
        }
      });

    } catch (error) {
      console.error('Error al procesar pago Yape:', error);
      setIsProcessing(false);
      onError(error);
    }
  }, [isLoaded, onSuccess, onError]);

  /**
   * Procesar pago con Plin
   */
  const processPlinPayment = useCallback(async (config: IzipayConfig, formToken: string) => {
    if (!isLoaded || !window.Izipay) {
      console.error('SDK de Izipay no está cargado');
      onError({ message: 'SDK de Izipay no disponible' });
      return;
    }

    setIsProcessing(true);

    try {
      const iziConfig = {
        transactionId: config.orderId,
        merchantCode: config.publicKey.substring(0, 10),
        order: {
          orderNumber: config.orderId,
          currency: 'PEN',
          amount: config.amount * 100,
          processType: 'AT',
          merchantBuyerId: config.email,
          dateTimeTransaction: new Date().toISOString()
        },
        billing: {
          firstName: config.firstName,
          lastName: config.lastName,
          email: config.email,
          phoneNumber: config.phoneNumber,
          street: config.address,
          city: config.city,
          state: config.state,
          country: 'PE',
          postalCode: config.zipCode,
          document: config.identityCode,
          documentType: 'DNI'
        },
        payMethod: 'PLIN' // Especificar método Plin
      };

      const checkout = new window.Izipay({ config: iziConfig });

      await checkout.LoadForm({
        authorization: formToken,
        keyRSA: config.publicKey,
        callbackResponse: (response: IzipayResponse) => {
          setIsProcessing(false);

          if (response.code === '00') {
            onSuccess(response);
          } else {
            onError(response);
          }
        }
      });

    } catch (error) {
      console.error('Error al procesar pago Plin:', error);
      setIsProcessing(false);
      onError(error);
    }
  }, [isLoaded, onSuccess, onError]);

  return {
    isLoaded,
    isProcessing,
    openCardPayment,
    processYapePayment,
    processPlinPayment
  };
};
