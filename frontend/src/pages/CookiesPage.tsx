// frontend/src/pages/CookiesPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas un sitio web. Las cookies permiten que el sitio web reconozca tu dispositivo y recuerde información sobre tu visita, como tus preferencias y acciones.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
              <p className="text-gray-700">
                <strong>En términos simples:</strong> Las cookies son como notas adhesivas que el sitio web coloca en tu navegador para recordar quién eres y qué estabas haciendo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. ¿Cómo Usamos las Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En iPhone Cases Store utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener tus productos en el carrito de compras</li>
              <li>Recordar tus preferencias (idioma, moneda)</li>
              <li>Mantener tu sesión activa cuando inicias sesión</li>
              <li>Entender cómo usas nuestro sitio web</li>
              <li>Mejorar tu experiencia de navegación</li>
              <li>Mostrar contenido y anuncios relevantes</li>
              <li>Analizar el rendimiento de nuestro sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Tipos de Cookies que Utilizamos</h2>
            <div className="space-y-4">
              {/* Cookies Esenciales */}
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Cookies Estrictamente Necesarias</h3>
                    <p className="text-gray-700 mb-2">
                      Estas cookies son esenciales para que el sitio web funcione correctamente. No se pueden desactivar.
                    </p>
                    <div className="bg-white rounded p-3 mt-2">
                      <p className="text-sm text-gray-700 mb-1"><strong>Ejemplos:</strong></p>
                      <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                        <li>Carrito de compras</li>
                        <li>Sesión de usuario</li>
                        <li>Preferencias de seguridad</li>
                        <li>Balance de carga del servidor</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies Funcionales */}
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Cookies de Funcionalidad</h3>
                    <p className="text-gray-700 mb-2">
                      Permiten que el sitio recuerde tus elecciones para brindarte una experiencia personalizada.
                    </p>
                    <div className="bg-white rounded p-3 mt-2">
                      <p className="text-sm text-gray-700 mb-1"><strong>Ejemplos:</strong></p>
                      <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                        <li>Idioma preferido (Español/English)</li>
                        <li>Región o ubicación</li>
                        <li>Tamaño de fuente y accesibilidad</li>
                        <li>Productos vistos recientemente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies Analíticas */}
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Cookies Analíticas y de Rendimiento</h3>
                    <p className="text-gray-700 mb-2">
                      Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando información de forma anónima.
                    </p>
                    <div className="bg-white rounded p-3 mt-2">
                      <p className="text-sm text-gray-700 mb-1"><strong>Servicios que usamos:</strong></p>
                      <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                        <li>Google Analytics (análisis de tráfico)</li>
                        <li>Estadísticas de página</li>
                        <li>Tiempo de carga y rendimiento</li>
                        <li>Rutas de navegación</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies Publicitarias */}
              <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-600">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Cookies de Publicidad y Marketing</h3>
                    <p className="text-gray-700 mb-2">
                      Se utilizan para mostrar anuncios relevantes y medir la efectividad de nuestras campañas publicitarias.
                    </p>
                    <div className="bg-white rounded p-3 mt-2">
                      <p className="text-sm text-gray-700 mb-1"><strong>Plataformas que usamos:</strong></p>
                      <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
                        <li>Facebook Pixel (Meta)</li>
                        <li>TikTok Pixel</li>
                        <li>Google Ads</li>
                        <li>Retargeting de productos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies de Terceros</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Algunos servicios de terceros colocan cookies en tu dispositivo en nuestro nombre. Estas cookies nos ayudan a mejorar tu experiencia y analizar el uso del sitio.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">Servicio</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">Propósito</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Google Analytics</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Análisis de tráfico web</td>
                    <td className="px-4 py-3 text-sm text-gray-700">26 meses</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Facebook Pixel</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Publicidad y conversiones</td>
                    <td className="px-4 py-3 text-sm text-gray-700">90 días</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">TikTok Pixel</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Publicidad y conversiones</td>
                    <td className="px-4 py-3 text-sm text-gray-700">13 meses</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Stripe / Payment Providers</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Procesamiento seguro de pagos</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cómo Controlar las Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tienes el derecho y la capacidad de decidir si aceptas o rechazas cookies. Aquí te explicamos cómo:
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Opciones de Control:</h3>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                      Configuración del Navegador
                    </h4>
                    <p className="text-gray-700 text-sm ml-11">
                      La mayoría de los navegadores aceptan cookies automáticamente, pero puedes modificar la configuración para rechazarlas. Sin embargo, esto puede afectar la funcionalidad del sitio.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                      Eliminar Cookies
                    </h4>
                    <p className="text-gray-700 text-sm ml-11">
                      Puedes eliminar todas las cookies que ya están en tu dispositivo. Ten en cuenta que esto eliminará tus preferencias.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                      Modo Incógnito / Privado
                    </h4>
                    <p className="text-gray-700 text-sm ml-11">
                      Puedes navegar en modo privado para limitar el seguimiento, aunque esto no previene todas las cookies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Instrucciones por Navegador</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Aquí te explicamos cómo gestionar cookies en los navegadores más populares:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Google Chrome</h3>
                <p className="text-gray-700 text-sm">
                  Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Mozilla Firefox</h3>
                <p className="text-gray-700 text-sm">
                  Opciones → Privacidad y seguridad → Cookies y datos del sitio
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Safari</h3>
                <p className="text-gray-700 text-sm">
                  Preferencias → Privacidad → Cookies y datos de sitios web
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Edge</h3>
                <p className="text-gray-700 text-sm">
                  Configuración → Cookies y permisos de sitio → Cookies y datos del sitio
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Consecuencias de Rechazar Cookies</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
              <p className="text-gray-700 mb-2">
                Si decides rechazar o deshabilitar cookies, algunas funciones del sitio pueden verse afectadas:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                <li>No podrás mantener productos en tu carrito entre sesiones</li>
                <li>Tendrás que iniciar sesión cada vez que visites el sitio</li>
                <li>Las preferencias de idioma y configuración no se guardarán</li>
                <li>Algunas funciones de personalización no estarán disponibles</li>
                <li>Es posible que no puedas completar compras</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Actualizaciones de esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las tecnologías que utilizamos o por requisitos legales. Te notificaremos de cambios significativos mediante un aviso en nuestro sitio web. La fecha de "Última actualización" al inicio de esta página indica cuándo se revisó por última vez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Más Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para más información sobre cómo manejamos tus datos personales, consulta nuestra <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Política de Privacidad</Link>.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Recursos Útiles:</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    All About Cookies - Guía completa sobre cookies
                  </a>
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Your Online Choices - Control de publicidad online
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre nuestra Política de Cookies:
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Email: privacy@iphonecasesstore.com</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-gray-700">WhatsApp: +51 917 780 708</span>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="border-t pt-8 mt-8">
            <h3 className="font-bold text-gray-900 mb-4">Documentos relacionados:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Política de Privacidad</Link>
              <Link to="/terms" className="text-blue-600 hover:underline font-semibold">Términos y Condiciones</Link>
              <Link to="/returns" className="text-blue-600 hover:underline font-semibold">Política de Devoluciones</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
