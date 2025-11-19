// frontend/src/pages/FAQPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  category: string;
  question: string;
  answer: string | JSX.Element;
}

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const faqs: FAQItem[] = [
    // Envíos y Entrega
    {
      category: 'Envíos',
      question: '¿Cuánto tiempo tarda el envío?',
      answer: 'El tiempo de envío varía según tu ubicación. Generalmente: \n• Nacional (Perú): 3-7 días hábiles\n• Latinoamérica: 15-25 días hábiles\n• Internacional: 20-35 días hábiles\n\nRecibirás un número de tracking para seguir tu pedido.'
    },
    {
      category: 'Envíos',
      question: '¿El envío es gratis?',
      answer: '¡Sí! Ofrecemos envío gratis en todos los pedidos nacionales e internacionales. El costo ya está incluido en el precio del producto.'
    },
    {
      category: 'Envíos',
      question: '¿Puedo rastrear mi pedido?',
      answer: <>Sí, puedes rastrear tu pedido en cualquier momento desde nuestra página de <Link to="/track" className="text-blue-600 hover:underline font-semibold">seguimiento de pedidos</Link>. También recibirás actualizaciones por email.</>
    },
    {
      category: 'Envíos',
      question: '¿Qué hago si mi pedido no llega?',
      answer: 'Si tu pedido no llega en el tiempo estimado, contacta con nuestro equipo de soporte a través de WhatsApp. Investigaremos y resolveremos el problema inmediatamente.'
    },

    // Productos
    {
      category: 'Productos',
      question: '¿Las carcasas son de buena calidad?',
      answer: 'Todas nuestras carcasas están hechas con materiales premium: TPU flexible y policarbonato rígido. Ofrecemos protección contra caídas, rayones y polvo. Además, tenemos garantía de satisfacción de 30 días.'
    },
    {
      category: 'Productos',
      question: '¿Qué modelos de iPhone tienen disponibles?',
      answer: 'Tenemos carcasas para todos los modelos recientes de iPhone:\n• iPhone 15 (Pro, Pro Max, Plus)\n• iPhone 14 (Pro, Pro Max, Plus)\n• iPhone 13 (Pro, Pro Max, Mini)\n• iPhone 12 (Pro, Pro Max, Mini)\n• iPhone 11 (Pro, Pro Max)\n• Y modelos anteriores\n\nVerifica la compatibilidad en la página de cada producto.'
    },
    {
      category: 'Productos',
      question: '¿Las carcasas interfieren con la carga inalámbrica?',
      answer: 'No. Todas nuestras carcasas son compatibles con carga inalámbrica (MagSafe y Qi). Puedes cargar tu iPhone sin necesidad de quitar la carcasa.'
    },
    {
      category: 'Productos',
      question: '¿Tienen protección para la cámara?',
      answer: 'Sí, todas nuestras carcasas incluyen bordes elevados alrededor de la cámara para protegerla de rayones cuando colocas tu iPhone sobre superficies planas.'
    },

    // Pagos
    {
      category: 'Pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos múltiples métodos de pago:\n• Tarjetas de crédito/débito (Visa, Mastercard, American Express)\n• Yape (Perú - GRATIS)\n• Plin (Perú - GRATIS)\n• MercadoPago\n• Culqi\n• Stripe\n\nTodos los pagos son 100% seguros y encriptados.'
    },
    {
      category: 'Pagos',
      question: '¿Es seguro pagar en línea?',
      answer: 'Absolutamente. Utilizamos las plataformas de pago más seguras del mercado con encriptación SSL de 256 bits. Nunca almacenamos información de tus tarjetas.'
    },
    {
      category: 'Pagos',
      question: '¿Puedo pagar contra entrega?',
      answer: 'Actualmente no ofrecemos pago contra entrega. Sin embargo, aceptamos Yape y Plin que son métodos de pago inmediatos y gratuitos en Perú.'
    },
    {
      category: 'Pagos',
      question: '¿Emiten factura o boleta?',
      answer: 'Sí, emitimos comprobantes electrónicos. Recibirás tu comprobante por email inmediatamente después de confirmar tu pedido.'
    },

    // Devoluciones y Garantía
    {
      category: 'Garantía',
      question: '¿Tienen garantía?',
      answer: 'Sí, todos nuestros productos tienen 30 días de garantía de satisfacción. Si no estás satisfecho con tu compra, te devolvemos el dinero o cambiamos el producto sin preguntas.'
    },
    {
      category: 'Garantía',
      question: '¿Cómo hago una devolución?',
      answer: <>Para hacer una devolución, contacta con nuestro equipo a través de WhatsApp o email dentro de los 30 días posteriores a recibir tu pedido. Consulta nuestra <Link to="/returns" className="text-blue-600 hover:underline font-semibold">política de devoluciones</Link> completa.</>,
    },
    {
      category: 'Garantía',
      question: '¿Qué pasa si mi producto llega defectuoso?',
      answer: 'Si tu producto llega defectuoso o dañado, contacta inmediatamente con nosotros. Te enviaremos un reemplazo gratis o te devolveremos el 100% de tu dinero.'
    },
    {
      category: 'Garantía',
      question: '¿Puedo cambiar por otro color o modelo?',
      answer: 'Sí, puedes cambiar tu producto por otro color o modelo diferente dentro de los 30 días. Solo cubre el costo de envío del nuevo producto.'
    },

    // Cuenta y Pedidos
    {
      category: 'Cuenta',
      question: '¿Necesito crear una cuenta para comprar?',
      answer: 'No es obligatorio, pero te recomendamos crear una cuenta para:\n• Rastrear tus pedidos fácilmente\n• Guardar direcciones de envío\n• Acceder a descuentos exclusivos\n• Ver tu historial de compras'
    },
    {
      category: 'Cuenta',
      question: '¿Cómo veo el estado de mi pedido?',
      answer: <>Puedes ver el estado de tu pedido de dos formas:\n1. Inicia sesión en tu cuenta y ve a "Mis Pedidos"\n2. Usa nuestra <Link to="/track" className="text-blue-600 hover:underline font-semibold">página de tracking</Link> con tu número de pedido</>
    },
    {
      category: 'Cuenta',
      question: '¿Olvidé mi contraseña, qué hago?',
      answer: <>Ve a la <Link to="/login" className="text-blue-600 hover:underline font-semibold">página de inicio de sesión</Link> y haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un link para restablecerla.</>
    },

    // Descuentos y Promociones
    {
      category: 'Descuentos',
      question: '¿Tienen descuentos o cupones?',
      answer: '¡Sí! Regularmente ofrecemos:\n• 10% OFF en tu primera compra (suscríbete al newsletter)\n• Descuentos por volumen (compra 2+ productos)\n• Promociones especiales en fechas festivas\n• Códigos exclusivos para suscriptores'
    },
    {
      category: 'Descuentos',
      question: '¿Cómo uso un cupón de descuento?',
      answer: 'Durante el proceso de checkout, encontrarás un campo para ingresar tu código de cupón. Ingresa el código y haz clic en "Aplicar". El descuento se aplicará automáticamente a tu total.'
    },
    {
      category: 'Descuentos',
      question: '¿Puedo combinar múltiples cupones?',
      answer: 'No, solo puedes usar un cupón por pedido. Sin embargo, los cupones se pueden combinar con descuentos por volumen automáticos.'
    }
  ];

  const categories = ['Todos', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = activeCategory === 'Todos'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`ml-4 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed animate-slideDown">
                  {typeof faq.answer === 'string' ? (
                    faq.answer.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))
                  ) : (
                    faq.answer
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-black mb-3">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Nuestro equipo está aquí para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || '51917780708'}?text=Hola, tengo una pregunta`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat por WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enviar un Email
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-4">También puedes consultar:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Política de Privacidad</Link>
            <span>•</span>
            <Link to="/terms" className="text-blue-600 hover:underline font-semibold">Términos y Condiciones</Link>
            <span>•</span>
            <Link to="/returns" className="text-blue-600 hover:underline font-semibold">Política de Devoluciones</Link>
            <span>•</span>
            <Link to="/shipping" className="text-blue-600 hover:underline font-semibold">Información de Envíos</Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
