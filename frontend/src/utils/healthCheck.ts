// frontend/src/utils/healthCheck.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const FRONTEND_VERSION = '2.0.0';
const EXPECTED_API_VERSION = '2.0.0';

interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  apiVersion: string;
  timestamp: string;
  uptime: number;
  environment: string;
  services?: {
    database: string | boolean;
    email: boolean;
    stripe: boolean;
    cloudinary: boolean;
  };
  database?: {
    connected: boolean;
    time: string;
  };
}

interface HealthCheckResult {
  success: boolean;
  frontend: {
    version: string;
    environment: string;
    apiUrl: string;
  };
  backend?: BackendHealthResponse;
  versionMatch: boolean;
  latency: number;
  error?: string;
}

/**
 * Realiza un health check completo del sistema
 * Verifica conectividad y sincronización de versiones
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  const result: HealthCheckResult = {
    success: false,
    frontend: {
      version: FRONTEND_VERSION,
      environment: process.env.NODE_ENV || 'development',
      apiUrl: API_URL
    },
    versionMatch: false,
    latency: 0
  };

  try {
    // Hacer request al backend health endpoint
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const latency = Date.now() - startTime;
    result.latency = latency;

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data: BackendHealthResponse = await response.json();
    result.backend = data;

    // Verificar que las versiones coincidan
    result.versionMatch = data.apiVersion === EXPECTED_API_VERSION;

    // Marcar como exitoso si el backend responde OK
    result.success = data.status === 'OK';

    // Advertir si las versiones no coinciden
    if (!result.versionMatch) {
      console.warn(
        `⚠️ Version mismatch! Frontend expects API v${EXPECTED_API_VERSION}, but backend is v${data.apiVersion}`
      );
    }

    return result;

  } catch (error: any) {
    result.error = error.message || 'Unknown error';
    result.latency = Date.now() - startTime;

    console.error('❌ Health check failed:', error);
    return result;
  }
}

/**
 * Health check simple y rápido (solo conectividad)
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtiene información detallada del backend (requiere más tiempo)
 */
export async function getBackendInfo(): Promise<BackendHealthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/health/full`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Failed to get backend info:', error);
    return null;
  }
}

/**
 * Verifica si el frontend y backend están sincronizados
 */
export async function checkVersionSync(): Promise<{
  synced: boolean;
  frontendVersion: string;
  backendVersion: string;
  message: string;
}> {
  try {
    const healthCheck = await performHealthCheck();

    if (!healthCheck.success || !healthCheck.backend) {
      return {
        synced: false,
        frontendVersion: FRONTEND_VERSION,
        backendVersion: 'unknown',
        message: 'No se pudo conectar con el backend'
      };
    }

    const synced = healthCheck.versionMatch;

    return {
      synced,
      frontendVersion: FRONTEND_VERSION,
      backendVersion: healthCheck.backend.apiVersion,
      message: synced
        ? '✅ Frontend y backend sincronizados'
        : `⚠️ Versiones diferentes: Frontend v${FRONTEND_VERSION}, Backend v${healthCheck.backend.apiVersion}`
    };

  } catch (error: any) {
    return {
      synced: false,
      frontendVersion: FRONTEND_VERSION,
      backendVersion: 'error',
      message: error.message || 'Error verificando sincronización'
    };
  }
}
