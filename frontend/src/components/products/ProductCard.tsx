// frontend/src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📱</span>
              </div>
              <h3 className="text-xl font-bold">iPhone Cases Store</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Carcasas iPhone de alta calidad con diseños únicos. Protege tu dispositivo 
              con estilo y recibe envío gratis en todo el mundo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Inicio</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-white transition-colors">Productos</a></li>
              <li><a href="/track" className="text-gray-400 hover:text-white transition-colors">Rastrear Orden</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Atención al Cliente</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="/returns" className="text-gray-400 hover:text-white transition-colors">Devoluciones</a></li>
              <li><a href="/shipping" className="text-gray-400 hover:text-white transition-colors">Envíos</a></li>
              <li><a href="/warranty" className="text-gray-400 hover:text-white transition-colors">Garantía</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">soporte@iphonecases.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">WhatsApp</p>
                <p className="text-white">+51 999 888 777</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Horario</p>
                <p className="text-white">24/7 Soporte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} iPhone Cases Store. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </a>
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;