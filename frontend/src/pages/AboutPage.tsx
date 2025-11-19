// frontend/src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black mb-6">Sobre Nosotros</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Protegiendo tu iPhone con estilo desde 2020
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Story */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Nuestra Historia</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              iPhone Cases Store nació en 2020 con una misión simple pero poderosa: <strong>hacer que la protección premium para tu iPhone sea accesible para todos</strong>. Comenzamos como un pequeño proyecto y nos hemos convertido en la tienda de confianza para miles de clientes en todo el mundo.
            </p>
            <p>
              Entendemos que tu iPhone es más que un teléfono, es tu herramienta de trabajo, tu cámara, tu conexión con el mundo. Por eso, nos dedicamos a ofrecer <strong>las mejores carcasas de protección</strong> que combinan durabilidad, estilo y funcionalidad.
            </p>
            <p>
              Cada producto que ofrecemos ha sido cuidadosamente seleccionado y probado para garantizar que cumpla con nuestros altos estándares de calidad. No vendemos solo carcasas; vendemos <strong>tranquilidad</strong>.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Calidad Garantizada</h3>
                  <p className="text-gray-700 text-sm">
                    Solo ofrecemos productos de la más alta calidad. Cada carcasa es probada para resistir caídas, rayones y el uso diario.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Precios Justos</h3>
                  <p className="text-gray-700 text-sm">
                    Trabajamos directamente con fabricantes para ofrecer los mejores precios sin intermediarios innecesarios.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-xl p-6 border-l-4 border-cyan-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Satisfacción 100%</h3>
                  <p className="text-gray-700 text-sm">
                    Garantía de 30 días en todos nuestros productos. Si no estás satisfecho, te devolvemos tu dinero.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-600">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Soporte Premium</h3>
                  <p className="text-gray-700 text-sm">
                    Nuestro equipo está disponible para ayudarte. Respuesta rápida por WhatsApp, email o chat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-black mb-6">¿Por Qué Elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-black mb-2">10K+</div>
              <p className="text-blue-100">Clientes Satisfechos</p>
            </div>
            <div className="text-center border-l border-r border-blue-400">
              <div className="text-5xl font-black mb-2">99%</div>
              <p className="text-blue-100">Tasa de Satisfacción</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">4.8/5</div>
              <p className="text-blue-100">Rating Promedio</p>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Nuestra Promesa</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Envío Seguro y Rápido</h3>
                <p className="text-gray-700">Envío con tracking completo. Tu pedido llega en perfectas condiciones.</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Pago 100% Seguro</h3>
                <p className="text-gray-700">Usamos las plataformas de pago más seguras con encriptación SSL.</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Soporte Post-Venta</h3>
                <p className="text-gray-700">No te dejamos solo después de la compra. Estamos aquí para ayudarte siempre.</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Productos Verificados</h3>
                <p className="text-gray-700">Cada producto pasa por controles de calidad rigurosos antes de enviarse.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Commitment */}
        <section className="bg-green-50 rounded-2xl shadow-md p-8 mb-8 border-2 border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-black text-gray-900 mb-3">Compromiso Ambiental</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nos preocupamos por el planeta. Trabajamos con proveedores que usan materiales reciclables y procesos de fabricación sostenibles. Nuestro empaque es 100% reciclable.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Materiales Reciclables</span>
                <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Empaque Eco-Friendly</span>
                <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Envíos Carbono Neutral</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-black mb-3">¿Listo para Proteger tu iPhone?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Únete a miles de clientes satisfechos que confían en nosotros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ver Productos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Contáctanos
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
