// frontend/src/pages/PrivacyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En iPhone Cases Store ("nosotros", "nuestro", "la tienda"), respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando visitas nuestro sitio web y realizas compras.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos diferentes tipos de información para brindarte un mejor servicio:
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">2.1. Información que nos proporcionas:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Dirección de envío</li>
                  <li>Información de pago (procesada por terceros seguros)</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">2.2. Información recopilada automáticamente:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de navegación</li>
                  <li>Cookies y tecnologías similares</li>
                  <li>Información de análisis de sitio web (Google Analytics, Facebook Pixel, TikTok Pixel)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos tu información personal para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Procesar pedidos:</strong> Gestionar y entregar tus compras</li>
              <li><strong>Comunicación:</strong> Enviar confirmaciones de pedido, actualizaciones de envío y responder consultas</li>
              <li><strong>Marketing:</strong> Enviar promociones y ofertas (solo si te has suscrito)</li>
              <li><strong>Mejorar servicios:</strong> Analizar el uso del sitio para mejorar la experiencia del usuario</li>
              <li><strong>Seguridad:</strong> Prevenir fraude y proteger nuestros sistemas</li>
              <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir Información con Terceros</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartir tu información con terceros de confianza para:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">Procesadores de pago:</h3>
                <p className="text-gray-700">Stripe, MercadoPago, Culqi (no almacenamos datos de tarjetas)</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">Servicios de envío:</h3>
                <p className="text-gray-700">Empresas de logística para entregar tus pedidos</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">Servicios de marketing:</h3>
                <p className="text-gray-700">Google Analytics, Facebook, TikTok (datos anónimos para análisis)</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">Servicios de email:</h3>
                <p className="text-gray-700">SendGrid para enviar notificaciones y newsletters</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Importante:</strong> Nunca vendemos ni alquilamos tu información personal a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-gray-700">
                <strong>Tipos de cookies que usamos:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                <li><strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                <li><strong>Funcionales:</strong> Recordar preferencias (idioma, carrito)</li>
                <li><strong>Analíticas:</strong> Entender cómo usas nuestro sitio</li>
                <li><strong>Publicitarias:</strong> Mostrar anuncios relevantes</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio. Consulta nuestra <Link to="/cookies" className="text-blue-600 hover:underline font-semibold">Política de Cookies</Link> completa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguridad de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encriptación SSL/TLS de 256 bits en todas las comunicaciones</li>
              <li>Almacenamiento seguro de datos en servidores protegidos</li>
              <li>Acceso restringido a información personal solo para personal autorizado</li>
              <li>Auditorías de seguridad regulares</li>
              <li>No almacenamos información completa de tarjetas de crédito</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Sin embargo, ningún método de transmisión por Internet es 100% seguro. Hacemos nuestro mejor esfuerzo para proteger tus datos, pero no podemos garantizar seguridad absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tienes los siguientes derechos sobre tus datos personales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Acceso</h3>
                <p className="text-gray-700 text-sm">Solicitar una copia de tus datos personales</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Rectificación</h3>
                <p className="text-gray-700 text-sm">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Supresión</h3>
                <p className="text-gray-700 text-sm">Solicitar la eliminación de tus datos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Portabilidad</h3>
                <p className="text-gray-700 text-sm">Recibir tus datos en formato estructurado</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Oposición</h3>
                <p className="text-gray-700 text-sm">Oponerte al procesamiento de tus datos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">✓ Derecho de Restricción</h3>
                <p className="text-gray-700 text-sm">Limitar el uso de tus datos</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para ejercer cualquiera de estos derechos, contáctanos por email o WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo. Generalmente:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Información de pedidos: 5 años (requerimiento fiscal)</li>
              <li>Datos de marketing: Hasta que canceles tu suscripción</li>
              <li>Datos de cuenta: Mientras tu cuenta esté activa</li>
              <li>Datos de navegación: 26 meses (Google Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro sitio no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si eres padre/madre y descubres que tu hijo ha proporcionado información personal, contáctanos para eliminarla.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Enlaces a Otros Sitios</h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de esos sitios. Te recomendamos leer sus políticas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos mediante un aviso prominente en nuestro sitio o por email. La fecha de "Última actualización" al inicio indica cuándo se revisó por última vez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre esta Política de Privacidad o quieres ejercer tus derechos, contáctanos:
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
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">iPhone Cases Store<br/>Lima, Perú</span>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="border-t pt-8 mt-8">
            <h3 className="font-bold text-gray-900 mb-4">Documentos relacionados:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/terms" className="text-blue-600 hover:underline font-semibold">Términos y Condiciones</Link>
              <Link to="/cookies" className="text-blue-600 hover:underline font-semibold">Política de Cookies</Link>
              <Link to="/returns" className="text-blue-600 hover:underline font-semibold">Política de Devoluciones</Link>
              <Link to="/shipping" className="text-blue-600 hover:underline font-semibold">Política de Envíos</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
