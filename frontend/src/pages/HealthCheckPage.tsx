// frontend/src/pages/HealthCheckPage.tsx
import React, { useState, useEffect } from 'react';
import { performHealthCheck, getBackendInfo, checkVersionSync } from '../utils/healthCheck';

interface HealthStatus {
  loading: boolean;
  basicHealth: any;
  fullHealth: any;
  versionSync: any;
  lastCheck: Date | null;
}

const HealthCheckPage: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    loading: true,
    basicHealth: null,
    fullHealth: null,
    versionSync: null,
    lastCheck: null
  });

  const runHealthChecks = async () => {
    setStatus(prev => ({ ...prev, loading: true }));

    try {
      // Ejecutar todos los checks en paralelo
      const [basicHealth, fullHealth, versionSync] = await Promise.all([
        performHealthCheck(),
        getBackendInfo(),
        checkVersionSync()
      ]);

      setStatus({
        loading: false,
        basicHealth,
        fullHealth,
        versionSync,
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Error running health checks:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (isHealthy: boolean) => {
    return isHealthy
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">System Health Check</h1>
            <p className="text-blue-100 mt-1">
              Verificación de estado del sistema y sincronización
            </p>
          </div>

          {/* Última verificación */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {status.lastCheck
                ? `Última verificación: ${status.lastCheck.toLocaleTimeString()}`
                : 'No verificado'}
            </span>
            <button
              onClick={runHealthChecks}
              disabled={status.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {status.loading ? 'Verificando...' : 'Refrescar'}
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Loading State */}
            {status.loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Ejecutando verificaciones...</span>
              </div>
            )}

            {/* Version Sync */}
            {!status.loading && status.versionSync && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sincronización de Versiones
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status.versionSync.synced)}`}>
                      {status.versionSync.synced ? '✓ Sincronizado' : '✗ Desincronizado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-600">Frontend:</span>
                    <span className="font-mono font-medium">v{status.versionSync.frontendVersion}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-600">Backend:</span>
                    <span className="font-mono font-medium">v{status.versionSync.backendVersion}</span>
                  </div>
                  <p className={`text-sm mt-2 ${status.versionSync.synced ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.versionSync.message}
                  </p>
                </div>
              </div>
            )}

            {/* Basic Health */}
            {!status.loading && status.basicHealth && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Conectividad Básica
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Estado del Backend:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status.basicHealth.success)}`}>
                      {status.basicHealth.success ? '✓ Online' : '✗ Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-600">Latencia:</span>
                    <span className={`font-medium ${status.basicHealth.latency < 500 ? 'text-green-600' : status.basicHealth.latency < 1000 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {status.basicHealth.latency}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-600">API URL:</span>
                    <span className="font-mono text-sm text-gray-700">{status.basicHealth.frontend.apiUrl}</span>
                  </div>
                  {status.basicHealth.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Error:</strong> {status.basicHealth.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Health */}
            {!status.loading && status.fullHealth && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Servicios del Backend
                </h2>

                {/* Backend Info */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <div className="text-xs text-gray-500">Servicio</div>
                    <div className="font-medium">{status.fullHealth.service}</div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <div className="text-xs text-gray-500">Entorno</div>
                    <div className="font-medium capitalize">{status.fullHealth.environment}</div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <div className="text-xs text-gray-500">Uptime</div>
                    <div className="font-medium">{Math.floor(status.fullHealth.uptime / 60)}m {Math.floor(status.fullHealth.uptime % 60)}s</div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded">
                    <div className="text-xs text-gray-500">Última actualización</div>
                    <div className="font-medium text-xs">{new Date(status.fullHealth.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>

                {/* Services Status */}
                {status.fullHealth.services && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700 mb-2">Estado de Servicios:</h3>
                    {Object.entries(status.fullHealth.services).map(([service, serviceStatus]) => {
                      const isHealthy = serviceStatus === 'connected' || serviceStatus === true;
                      return (
                        <div key={service} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                          <span className="text-gray-700 capitalize">{service}:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(isHealthy)}`}>
                            {typeof serviceStatus === 'boolean'
                              ? (serviceStatus ? '✓ Configurado' : '✗ No configurado')
                              : serviceStatus === 'connected'
                              ? '✓ Conectado'
                              : serviceStatus === 'error'
                              ? '✗ Error'
                              : String(serviceStatus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Database Info */}
                {status.fullHealth.database && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center text-green-800">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <span className="font-medium">Base de datos conectada</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {!status.loading && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Recomendaciones</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  {status.versionSync && !status.versionSync.synced && (
                    <li>• Actualiza el frontend o backend para sincronizar las versiones</li>
                  )}
                  {status.basicHealth && status.basicHealth.latency > 1000 && (
                    <li>• La latencia es alta (&gt;1s), considera optimizar la conexión</li>
                  )}
                  {status.fullHealth && status.fullHealth.services && !status.fullHealth.services.database && (
                    <li>• La base de datos no está conectada, verifica la configuración</li>
                  )}
                  {(!status.basicHealth || !status.basicHealth.success) && (
                    <li>• El backend no responde, verifica que esté en ejecución</li>
                  )}
                  {status.versionSync?.synced && status.basicHealth?.success && (
                    <li className="text-green-700">✓ Sistema operando correctamente</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Esta página verifica la conectividad y sincronización entre frontend y backend</p>
          <p className="mt-1">Para soporte técnico, revisa los logs de Railway (backend) y Vercel (frontend)</p>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckPage;
