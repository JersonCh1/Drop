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
          // Cerrar modal
          const modal = document.getElementById('izipay-modal');
          if (modal) modal.style.display = 'none';

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

          // Mapear estados de Izipay a códigos de error más específicos
          const orderStatus = paymentResponse.clientAnswer?.orderStatus;
          let errorCode = orderStatus || 'ERROR';
          let errorMessage = paymentResponse.clientAnswer?.orderStatusLabel || 'Error en el pago';

          // Mejorar mensajes de error según el estado
          if (orderStatus === 'REFUSED') {
            errorCode = 'REFUSED';
            errorMessage = 'Transacción rechazada por el banco';
          } else if (orderStatus === 'UNPAID') {
            errorCode = 'UNPAID';
            errorMessage = 'Pago no completado';
          } else if (orderStatus === 'ABANDONED') {
            errorCode = 'ABANDONED';
            errorMessage = 'Pago cancelado por el usuario';
          } else if (orderStatus === 'EXPIRED') {
            errorCode = 'EXPIRED';
            errorMessage = 'Sesión de pago expirada';
          }

          onError({
            code: errorCode,
            message: errorMessage
          });
        }

        return false; // Prevenir redirección automática
      });

      // Crear modal si no existe
      let modal = document.getElementById('izipay-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'izipay-modal';
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
          background: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 30px;
          border: none;
          background: none;
          cursor: pointer;
          color: #666;
          width: 30px;
          height: 30px;
          padding: 0;
          line-height: 1;
        `;
        closeBtn.onclick = () => {
          modal!.style.display = 'none';
          setIsProcessing(false);
        };

        const formContainer = document.createElement('div');
        formContainer.id = 'izipay-form-container';
        formContainer.className = 'kr-embedded';
        formContainer.setAttribute('kr-form-token', formToken);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(formContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
      } else {
        // Actualizar token si el modal ya existe
        const formContainer = document.getElementById('izipay-form-container');
        if (formContainer) {
          formContainer.setAttribute('kr-form-token', formToken);
        }
      }

      // Mostrar modal
      modal.style.display = 'flex';

      // Renderizar el formulario
      console.log('🚀 Abriendo formulario de pago de Izipay');

      // Intentar diferentes métodos según la versión del SDK
      if (typeof window.KR.showEmbeddedForm === 'function') {
        await window.KR.showEmbeddedForm('#izipay-form-container');
      } else if (typeof window.KR.renderElements === 'function') {
        await window.KR.renderElements('#izipay-form-container');
      } else {
        // Fallback: el formulario se renderiza automáticamente con el atributo kr-form-token
        console.log('✅ Formulario configurado, se renderizará automáticamente');
      }

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
