import { useEffect, useState } from 'react';

interface CulqiToken {
  id: string;
  object: string;
  creation_date: number;
  email: string;
  card_number: string;
  last_four: string;
  active: boolean;
  iin: {
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: {
      name: string;
      country: string;
      country_code: string;
    };
  };
  client: {
    ip: string;
    ip_country: string;
    ip_country_code: string;
    browser: string;
    device_fingerprint: string;
    device_type: string;
  };
}

interface CulqiInstance {
  publicKey: string;
  settings: (options: any) => void;
  open: () => void;
  close: () => void;
  token: CulqiToken | null;
  error: any;
}

declare global {
  interface Window {
    Culqi: () => CulqiInstance;
  }
}

interface UseCulqiOptions {
  publicKey: string | undefined;
  title?: string;
  currency?: string;
  description?: string;
  amount: number; // En centavos (100 = S/ 1.00)
  onToken?: (token: CulqiToken) => void;
  onError?: (error: any) => void;
}

export const useCulqi = ({
  publicKey,
  title = 'Pago con Culqi',
  currency = 'PEN',
  description = 'Orden de compra',
  amount,
  onToken,
  onError
}: UseCulqiOptions) => {
  const [isReady, setIsReady] = useState(false);
  const [culqiInstance, setCulqiInstance] = useState<CulqiInstance | null>(null);

  useEffect(() => {
    if (!publicKey) {
      console.warn('Culqi public key no proporcionada');
      return;
    }

    // Verificar que Culqi esté cargado
    if (typeof window.Culqi === 'undefined') {
      console.error('Culqi SDK no está cargado');
      return;
    }

    try {
      // Configurar Culqi globalmente
      const culqi = window.Culqi();

      culqi.publicKey = publicKey;

      culqi.settings({
        title,
        currency,
        description,
        amount
      });

      // Guardar referencia de la instancia
      setCulqiInstance(culqi);
      setIsReady(true);

      console.log('✅ Culqi inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando Culqi:', error);
      if (onError) onError(error);
    }
  }, [publicKey, title, currency, description, amount]);

  // Función global para manejar el token (debe estar en window)
  useEffect(() => {
    if (!isReady || !culqiInstance) return;

    // Definir función global para Culqi
    (window as any).culqi = function() {
      if (culqiInstance.token) {
        console.log('✅ Token de Culqi recibido:', culqiInstance.token.id);
        if (onToken) onToken(culqiInstance.token);
      } else if (culqiInstance.error) {
        console.error('❌ Error de Culqi:', culqiInstance.error);
        if (onError) onError(culqiInstance.error);
      }
    };
  }, [isReady, culqiInstance, onToken, onError]);

  const openCulqi = () => {
    if (!isReady || !culqiInstance) {
      console.error('Culqi no está listo');
      return;
    }

    // Actualizar configuración antes de abrir
    culqiInstance.settings({
      title,
      currency,
      description,
      amount
    });

    culqiInstance.open();
  };

  const closeCulqi = () => {
    if (culqiInstance) {
      culqiInstance.close();
    }
  };

  return {
    isReady,
    openCulqi,
    closeCulqi,
    culqiInstance
  };
};
