// frontend/src/pages/ReturnsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const ReturnsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Política de Devoluciones y Reembolsos
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          {/* Guarantee Badge */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-3">Garantía de Satisfacción 100%</h2>
            <p className="text-green-100 text-lg">
              30 días para devoluciones. Sin preguntas. Sin complicaciones.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Nuestra Promesa</h2>
            <p className="text-gray-700 leading-relaxed">
              En iPhone Cases Store, queremos que estés 100% satisfecho con tu compra. Si por cualquier razón no estás completamente satisfecho con tu producto, ofrecemos devoluciones y reembolsos completos dentro de los 30 días posteriores a la recepción de tu pedido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Período de Devolución</h2>
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
              <h3 className="font-bold text-gray-900 mb-2">Tienes 30 días desde la fecha de recepción</h3>
              <p className="text-gray-700 leading-relaxed">
                El período de 30 días comienza el día en que recibes tu producto. Puedes solicitar una devolución en cualquier momento durante este período, sin necesidad de dar explicaciones.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Condiciones para Devoluciones</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para que tu devolución sea elegible, el producto debe cumplir con las siguientes condiciones:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Condición Original
                </h3>
                <p className="text-gray-700 text-sm">El producto debe estar en su condición original, sin usar y con todas las etiquetas</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Empaque Original
                </h3>
                <p className="text-gray-700 text-sm">Debe incluir todo el empaque original y materiales</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sin Daños
                </h3>
                <p className="text-gray-700 text-sm">No debe tener signos de uso, daños o alteraciones</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Comprobante de Compra
                </h3>
                <p className="text-gray-700 text-sm">Debes proporcionar tu número de pedido o recibo</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cómo Solicitar una Devolución</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Proceso en 3 Pasos:</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 mb-1">Contáctanos</h4>
                      <p className="text-gray-700 text-sm">
                        Envíanos un mensaje por WhatsApp (+51 917 780 708) o email (returns@iphonecasesstore.com) con:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 text-sm ml-4 mt-1">
                        <li>Número de pedido</li>
                        <li>Razón de la devolución (opcional)</li>
                        <li>Fotos del producto si hay un defecto</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 mb-1">Aprobación y Dirección</h4>
                      <p className="text-gray-700 text-sm">
                        Revisaremos tu solicitud (generalmente en 24 horas) y te enviaremos:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 text-sm ml-4 mt-1">
                        <li>Aprobación de devolución</li>
                        <li>Dirección de envío para devolución</li>
                        <li>Número de RMA (Return Merchandise Authorization)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 mb-1">Envía el Producto</h4>
                      <p className="text-gray-700 text-sm">
                        Empaca el producto de forma segura y envíalo a la dirección proporcionada. Incluye el número de RMA dentro del paquete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Costos de Envío</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-bold text-gray-900 mb-2">Productos Defectuosos o Error Nuestro:</h3>
                <p className="text-gray-700">
                  <strong className="text-green-700">¡Envío GRATIS!</strong> Si el producto llega defectuoso, dañado o enviamos el producto incorrecto, cubrimos el 100% de los costos de envío de devolución.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <h3 className="font-bold text-gray-900 mb-2">Cambio de Opinión:</h3>
                <p className="text-gray-700">
                  Si simplemente cambiaste de opinión o el producto no te gustó, los costos de envío de devolución corren por tu cuenta. Te recomendamos usar un servicio de envío con tracking.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Reembolsos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.1. Procesamiento</h3>
                <p className="text-gray-700 leading-relaxed">
                  Una vez que recibamos y inspeccionemos tu devolución, te enviaremos un email confirmando la recepción. Procesaremos tu reembolso dentro de <strong>5-10 días hábiles</strong>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.2. Método de Reembolso</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  El reembolso se procesará al mismo método de pago utilizado en la compra original:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Tarjeta de crédito/débito:</strong> 5-10 días hábiles para reflejarse</li>
                  <li><strong>Yape/Plin:</strong> 2-3 días hábiles</li>
                  <li><strong>MercadoPago:</strong> 3-5 días hábiles</li>
                  <li><strong>Otras plataformas:</strong> Según políticas del proveedor</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.3. Monto del Reembolso</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">El reembolso incluye:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Precio del producto</li>
                    <li>Impuestos pagados</li>
                    <li>Costo de envío original (si el producto era defectuoso)</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    <strong>Nota:</strong> Si la devolución es por cambio de opinión, el costo de envío original no se reembolsa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cambios por Otro Producto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si deseas cambiar tu producto por otro color, modelo o producto diferente:
            </p>
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Solicita la devolución del producto original</li>
                <li>Una vez aprobada, realiza un nuevo pedido del producto deseado</li>
                <li>Te proporcionaremos un código de descuento para el envío si aplica</li>
              </ol>
              <p className="text-gray-700 mt-4">
                <strong>Tip:</strong> Si el error fue nuestro (color/modelo incorrecto), cubrimos todos los costos del cambio.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Productos No Retornables</h2>
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
              <p className="text-gray-700 mb-2 font-semibold">Los siguientes productos NO son elegibles para devolución:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Productos personalizados o hechos a medida</li>
                <li>Productos en liquidación o venta final (claramente marcados)</li>
                <li>Tarjetas de regalo o códigos de descuento</li>
                <li>Productos descargables o digitales (si aplicara)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Productos Defectuosos o Dañados</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Si tu producto llega defectuoso o dañado:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Inspecciona tu pedido inmediatamente</strong> al recibirlo. Toma fotos si hay daños visibles.
                  </li>
                  <li>
                    <strong>Contáctanos dentro de 48 horas</strong> de recibir el pedido con fotos del producto dañado y su empaque.
                  </li>
                  <li>
                    <strong>Elegirás una solución:</strong>
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Reemplazo del producto (envío gratis)</li>
                      <li>Reembolso completo (incluye envío original)</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Importante:</strong> No es necesario devolver productos gravemente dañados. Te pediremos fotos y procederemos con el reemplazo o reembolso inmediato.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Retrasos en Reembolsos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si aún no has recibido tu reembolso después del tiempo esperado:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>Verifica tu cuenta bancaria nuevamente</li>
              <li>Contacta a tu banco o compañía de tarjeta de crédito (puede tomar tiempo adicional)</li>
              <li>Contacta a tu proveedor de pago (Yape, MercadoPago, etc.)</li>
              <li>Si has hecho todo lo anterior y aún no recibes tu reembolso, contáctanos inmediatamente</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Artículos en Venta/Promoción</h2>
            <p className="text-gray-700 leading-relaxed">
              Los artículos en promoción son elegibles para devolución bajo las mismas condiciones, a menos que estén específicamente marcados como "venta final" o "no retornable" en la página del producto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Preguntas Frecuentes</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">¿Puedo devolver un producto usado?</h3>
                <p className="text-gray-700 text-sm">
                  No. Los productos deben estar en su condición original sin usar para ser elegibles para devolución.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">¿Qué pasa si perdí mi número de pedido?</h3>
                <p className="text-gray-700 text-sm">
                  No te preocupes. Puedes usar el email con el que realizaste la compra o contactarnos con tu nombre y dirección de envío.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">¿Puedo devolver múltiples artículos del mismo pedido?</h3>
                <p className="text-gray-700 text-sm">
                  Sí. Puedes devolver uno o todos los artículos de tu pedido, siempre que cumplan con las condiciones de devolución.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">¿Ofrecen devoluciones internacionales?</h3>
                <p className="text-gray-700 text-sm">
                  Sí. Nuestra política de devolución de 30 días aplica para todos los clientes, independientemente de su ubicación.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre devoluciones o necesitas ayuda:
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Email: returns@iphonecasesstore.com</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-gray-700">WhatsApp: +51 917 780 708</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Horario: Lun-Vie 9am-6pm, Sáb 9am-1pm (Hora de Perú)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="border-t pt-8 mt-8">
            <h3 className="font-bold text-gray-900 mb-4">Documentos relacionados:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/terms" className="text-blue-600 hover:underline font-semibold">Términos y Condiciones</Link>
              <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Política de Privacidad</Link>
              <Link to="/shipping" className="text-blue-600 hover:underline font-semibold">Política de Envíos</Link>
              <Link to="/faq" className="text-blue-600 hover:underline font-semibold">Preguntas Frecuentes</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
