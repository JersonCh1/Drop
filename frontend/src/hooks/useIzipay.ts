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
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%), rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-in-out;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
          background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
          padding: 0;
          border-radius: 24px;
          max-width: 550px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        // Header del modal con mejor diseño
        const modalHeader = document.createElement('div');
        modalHeader.style.cssText = `
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          padding: 28px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        `;

        const headerContent = document.createElement('div');
        headerContent.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Pago Seguro</h2>
          </div>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400;">
            Ingresa los datos de tu tarjeta de forma segura
          </p>
        `;
        modalHeader.appendChild(headerContent);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          color: white;
          width: 40px;
          height: 40px;
          padding: 0;
          line-height: 1;
          border-radius: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 300;
        `;
        closeBtn.onmouseover = () => {
          closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
          closeBtn.style.transform = 'scale(1.1)';
        };
        closeBtn.onmouseout = () => {
          closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
          closeBtn.style.transform = 'scale(1)';
        };
        closeBtn.onclick = () => {
          modal!.style.animation = 'fadeOut 0.2s ease-in-out';
          setTimeout(() => {
            modal!.style.display = 'none';
          }, 200);
          setIsProcessing(false);
        };
        modalHeader.appendChild(closeBtn);

        // Contenedor del formulario con padding
        const formWrapper = document.createElement('div');
        formWrapper.style.cssText = `
          padding: 35px 30px;
          overflow-y: auto;
          max-height: calc(90vh - 140px);
        `;

        const formContainer = document.createElement('div');
        formContainer.id = 'izipay-form-container';
        formContainer.className = 'kr-embedded';
        formContainer.setAttribute('kr-form-token', formToken);

        // Footer con indicadores de seguridad
        const modalFooter = document.createElement('div');
        modalFooter.style.cssText = `
          background: #f9fafb;
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        `;
        modalFooter.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span style="color: #10b981; font-size: 13px; font-weight: 600;">Conexión Segura SSL</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span style="color: #3b82f6; font-size: 13px; font-weight: 600;">Protegido por Izipay</span>
          </div>
        `;

        formWrapper.appendChild(formContainer);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(formWrapper);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);

        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Estilos personalizados para el formulario de Izipay */
          #izipay-form-container .kr-embedded {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          #izipay-form-container .kr-field {
            margin-bottom: 20px !important;
          }

          #izipay-form-container .kr-label {
            color: #374151 !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: 8px !important;
            display: block !important;
          }

          #izipay-form-container .kr-input,
          #izipay-form-container input {
            width: 100% !important;
            padding: 14px 16px !important;
            border: 2px solid #e5e7eb !important;
            border-radius: 12px !important;
            font-size: 15px !important;
            transition: all 0.2s ease !important;
            background: white !important;
            color: #111827 !important;
          }

          #izipay-form-container .kr-input:focus,
          #izipay-form-container input:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
          }

          #izipay-form-container .kr-button,
          #izipay-form-container button[type="submit"] {
            width: 100% !important;
            padding: 16px 24px !important;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            margin-top: 24px !important;
            box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39) !important;
            letter-spacing: 0.5px !important;
          }

          #izipay-form-container .kr-button:hover,
          #izipay-form-container button[type="submit"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.5) !important;
          }

          #izipay-form-container .kr-button:active,
          #izipay-form-container button[type="submit"]:active {
            transform: translateY(0) !important;
          }

          #izipay-form-container .kr-error {
            color: #ef4444 !important;
            font-size: 13px !important;
            margin-top: 6px !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
          }

          #izipay-form-container .kr-card-icon {
            width: 40px !important;
            height: 28px !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }

          /* Mejorar campos de fecha y CVV */
          #izipay-form-container .kr-expiry,
          #izipay-form-container .kr-security-code {
            display: inline-block !important;
            width: calc(50% - 8px) !important;
          }

          #izipay-form-container .kr-expiry {
            margin-right: 16px !important;
          }

          /* Estilo para el loader/spinner */
          #izipay-form-container .kr-spinner {
            border-color: #3b82f6 !important;
          }

          /* Mejorar mensajes de validación */
          #izipay-form-container .kr-field.kr-invalid .kr-input {
            border-color: #ef4444 !important;
            background: #fef2f2 !important;
          }

          #izipay-form-container .kr-field.kr-valid .kr-input {
            border-color: #10b981 !important;
          }
        `;
        document.head.appendChild(style);

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
