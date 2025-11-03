// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { useI18n } from '../../context/I18nContext';

const Footer: React.FC = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '51917780708';

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Fondo animado futurista */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  iPhone Cases
                </h3>
                <p className="text-xs text-gray-400 font-medium">{t('footer.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-3">
              {[
                { nameKey: 'footer.home', url: '/' },
                { nameKey: 'footer.products', url: '/products' },
                { nameKey: 'footer.trackOrder', url: '/track' },
                { nameKey: 'footer.myAccount', url: '/login' }
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className="text-gray-400 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span>{t(item.nameKey)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('footer.contact')}
            </h4>
            <div className="space-y-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hola, me gustaría obtener más información sobre sus productos`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-green-500/30 flex items-center space-x-3"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/90 font-medium">{t('footer.whatsappContact')}</p>
                  <p className="text-xs text-white/70">{t('footer.quickResponse')}</p>
                </div>
              </a>
              <p className="text-gray-400 text-sm">
                {t('footer.schedule')}
              </p>
            </div>
          </div>
        </div>


        {/* Trust Badges - Simplified */}
        <div className="border-t border-white/10 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z', titleKey: 'footer.badges.securePurchase', descKey: 'footer.badges.securePurchaseDesc' },
              { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', titleKey: 'footer.badges.fastShipping', descKey: 'footer.badges.fastShippingDesc' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', titleKey: 'footer.badges.warranty', descKey: 'footer.badges.warrantyDesc' },
              { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', titleKey: 'footer.badges.support', descKey: 'footer.badges.supportDesc' }
            ].map((badge, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{t(badge.titleKey)}</p>
                <p className="text-gray-400 text-xs">{t(badge.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright - Clean & Simple */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} <span className="font-semibold text-gray-300">{t('footer.storeName')}</span>. {t('footer.allRightsReserved')}.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {t('footer.madeInPeru')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;