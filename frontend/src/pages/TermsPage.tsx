// frontend/src/pages/TermsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar el sitio web de iPhone Cases Store ("el sitio", "nosotros", "nuestro"), aceptas estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de las leyes locales aplicables. Si no estás de acuerdo con alguno de estos términos, no utilices nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso del Sitio</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">2.1. Licencia de Uso</h3>
                <p className="text-gray-700 leading-relaxed">
                  Se te otorga una licencia limitada, no exclusiva, intransferible y revocable para acceder y usar nuestro sitio web únicamente para fines personales y no comerciales.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">2.2. Restricciones</h3>
                <p className="text-gray-700 mb-2">No puedes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Modificar o copiar los materiales del sitio</li>
                  <li>Usar los materiales para fines comerciales sin autorización</li>
                  <li>Intentar descompilar o realizar ingeniería inversa del software</li>
                  <li>Eliminar derechos de autor u otras notaciones de propiedad</li>
                  <li>Transferir los materiales a otra persona</li>
                  <li>Usar robots, scrapers o herramientas automatizadas sin permiso</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Productos y Precios</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.1. Descripciones de Productos</h3>
                <p className="text-gray-700 leading-relaxed">
                  Hacemos todo lo posible para mostrar con precisión los colores y detalles de nuestros productos. Sin embargo, no podemos garantizar que la visualización de colores en tu monitor sea precisa. Nos reservamos el derecho de modificar descripciones y especificaciones sin previo aviso.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.2. Precios</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Todos los precios están en dólares estadounidenses (USD)</li>
                  <li>Los precios incluyen envío internacional</li>
                  <li>Nos reservamos el derecho de cambiar precios sin previo aviso</li>
                  <li>Los precios promocionales son válidos por tiempo limitado</li>
                  <li>En caso de error de precio, notificaremos y ofreceremos cancelar o completar la compra al precio correcto</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.3. Disponibilidad</h3>
                <p className="text-gray-700 leading-relaxed">
                  Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de descontinuar productos en cualquier momento. Si un producto ordenado no está disponible, te notificaremos y ofreceremos un reembolso completo o producto alternativo.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Proceso de Compra</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">4.1. Pedidos</h3>
                <p className="text-gray-700 leading-relaxed">
                  Al realizar un pedido, haces una oferta para comprar los productos. Todos los pedidos están sujetos a aceptación por nuestra parte. Nos reservamos el derecho de rechazar o cancelar cualquier pedido por cualquier motivo, incluyendo:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                  <li>Falta de disponibilidad del producto</li>
                  <li>Errores en la descripción o precio del producto</li>
                  <li>Problemas identificados por nuestro sistema de detección de fraude</li>
                  <li>Otros problemas identificados en el pedido</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">4.2. Confirmación</h3>
                <p className="text-gray-700 leading-relaxed">
                  Recibirás un email de confirmación después de realizar tu pedido. Esta confirmación no constituye aceptación de tu pedido. La aceptación ocurre cuando procesamos tu pago y te enviamos un email de confirmación de envío.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">4.3. Cancelación de Pedidos</h3>
                <p className="text-gray-700 leading-relaxed">
                  Puedes cancelar tu pedido antes de que sea enviado contactándonos inmediatamente. Una vez enviado, aplican nuestras políticas de devolución estándar.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pago</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">5.1. Métodos de Pago</h3>
                <p className="text-gray-700 leading-relaxed mb-2">Aceptamos los siguientes métodos de pago:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Tarjetas de crédito/débito (Visa, Mastercard, American Express)</li>
                  <li>Yape y Plin (Perú)</li>
                  <li>MercadoPago</li>
                  <li>Culqi</li>
                  <li>Stripe</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">5.2. Seguridad de Pago</h3>
                <p className="text-gray-700 leading-relaxed">
                  Todos los pagos se procesan a través de plataformas de pago seguras de terceros. No almacenamos información completa de tarjetas de crédito en nuestros servidores. Todas las transacciones están encriptadas con SSL de 256 bits.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">5.3. Autorización de Pago</h3>
                <p className="text-gray-700 leading-relaxed">
                  Al proporcionar información de pago, autorizas que se cargue a tu método de pago el monto total de tu pedido, incluyendo impuestos y costos de envío aplicables.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Envíos y Entregas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.1. Tiempos de Entrega</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Nacional (Perú): 3-7 días hábiles</li>
                  <li>Latinoamérica: 15-25 días hábiles</li>
                  <li>Internacional: 20-35 días hábiles</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Los tiempos son estimados y pueden variar por circunstancias fuera de nuestro control (aduanas, feriados, clima).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.2. Direcciones de Envío</h3>
                <p className="text-gray-700 leading-relaxed">
                  Es tu responsabilidad proporcionar información de envío precisa y completa. No nos hacemos responsables de retrasos o pérdidas resultantes de direcciones incorrectas o incompletas.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.3. Riesgo de Pérdida</h3>
                <p className="text-gray-700 leading-relaxed">
                  El riesgo de pérdida y el título de los productos pasan a ti al momento de la entrega al transportista.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Devoluciones y Reembolsos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ofrecemos garantía de satisfacción de 30 días. Para información detallada sobre devoluciones, reembolsos y cambios, consulta nuestra <Link to="/returns" className="text-blue-600 hover:underline font-semibold">Política de Devoluciones</Link> completa.
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-700 font-semibold">En resumen:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                <li>30 días para devoluciones desde la recepción</li>
                <li>Productos deben estar en condición original</li>
                <li>Reembolsos procesados en 5-10 días hábiles</li>
                <li>Costos de envío de devolución a cargo del cliente (salvo defectos)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Garantía</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">8.1. Garantía Limitada</h3>
                <p className="text-gray-700 leading-relaxed">
                  Garantizamos que nuestros productos están libres de defectos de materiales y fabricación bajo uso normal durante 30 días desde la fecha de compra. Esta garantía no cubre:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                  <li>Daño causado por uso indebido o negligencia</li>
                  <li>Desgaste normal</li>
                  <li>Modificaciones no autorizadas</li>
                  <li>Daños cosméticos que no afecten la funcionalidad</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">8.2. Descargo de Garantías Adicionales</h3>
                <p className="text-gray-700 leading-relaxed">
                  Excepto por la garantía limitada anterior, los productos se venden "TAL CUAL" sin garantías de ningún tipo, expresas o implícitas. No garantizamos que los productos cumplan con tus requisitos específicos o que sean completamente libres de errores.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                EN NINGÚN CASO SEREMOS RESPONSABLES POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUYENDO SIN LIMITACIÓN, PÉRDIDA DE GANANCIAS, DATOS, USO, BUENA VOLUNTAD, U OTRAS PÉRDIDAS INTANGIBLES, RESULTANTES DE:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                <li>Tu acceso o uso (o incapacidad de acceder o usar) del sitio</li>
                <li>Cualquier conducta o contenido de terceros en el sitio</li>
                <li>Cualquier contenido obtenido del sitio</li>
                <li>Acceso no autorizado, uso o alteración de tus transmisiones o contenido</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                Nuestra responsabilidad total no excederá el monto pagado por el producto en cuestión.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnización</h2>
            <p className="text-gray-700 leading-relaxed">
              Aceptas indemnizar, defender y mantener indemne a iPhone Cases Store, sus afiliados, oficiales, directores, empleados y agentes de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gasto (incluyendo honorarios legales) que surjan de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>Tu uso y acceso al sitio</li>
              <li>Tu violación de estos Términos</li>
              <li>Tu violación de derechos de terceros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todo el contenido del sitio, incluyendo texto, gráficos, logos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de iPhone Cases Store o sus proveedores de contenido y está protegido por leyes de derechos de autor internacionales.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700 font-semibold mb-2">Marcas Registradas:</p>
              <p className="text-gray-700 text-sm">
                iPhone, iPhone 15, iPhone 14, etc., son marcas registradas de Apple Inc. No estamos afiliados, asociados, autorizados, respaldados por, ni de ninguna manera conectados oficialmente con Apple Inc.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Privacidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Tu privacidad es importante para nosotros. Consulta nuestra <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Política de Privacidad</Link> para entender cómo recopilamos, usamos y protegemos tu información personal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigencia los nuevos términos. Qué constituye un cambio material será determinado a nuestra sola discreción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de Perú, sin dar efecto a ninguna disposición sobre conflicto de leyes. Cualquier disputa que surja de estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de Lima, Perú.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Resolución de Disputas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">15.1. Negociación Informal</h3>
                <p className="text-gray-700 leading-relaxed">
                  Antes de presentar cualquier reclamo formal, aceptas intentar resolver la disputa informalmente contactándonos primero. Haremos nuestro mejor esfuerzo para resolver la disputa de buena fe.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">15.2. Arbitraje</h3>
                <p className="text-gray-700 leading-relaxed">
                  Si no podemos resolver una disputa informalmente, cualquier reclamo legal contra nosotros se resolverá mediante arbitraje vinculante, excepto que cualquiera de las partes pueda llevar una acción individual en un tribunal de reclamos menores.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Divisibilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Si alguna disposición de estos Términos se considera inválida o inaplicable, esa disposición se eliminará o limitará al mínimo necesario, y las disposiciones restantes de estos Términos continuarán en plena vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Renuncia</h2>
            <p className="text-gray-700 leading-relaxed">
              Ninguna renuncia por nuestra parte de cualquier término o condición establecido en estos Términos se considerará una renuncia adicional o continua de dicho término o condición o una renuncia de cualquier otro término o condición.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos:
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Email: legal@iphonecasesstore.com</span>
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

export default TermsPage;
