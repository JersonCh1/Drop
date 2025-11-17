import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  price,
  currency = 'USD',
  availability = 'in stock',
  brand = 'iPhone Cases Store',
  category,
  noindex = false
}) => {
  // Valores por defecto - OPTIMIZADOS PARA ESPAÑA
  const defaultTitle = 'CASEPRO España - Carcasas iPhone Premium | Envío Gratis 24h';
  const defaultDescription = 'Carcasas profesionales para iPhone en España. Protección premium, diseños exclusivos y envío gratis en 24h. Garantía de satisfacción. ¡Compra ahora!';
  const defaultImage = '/images/og-image.jpg';
  const defaultUrl = typeof window !== 'undefined' ? window.location.href : 'https://casepro.es';
  const defaultKeywords = 'carcasas iphone españa, fundas iphone, carcasas iphone 15, fundas iphone baratas, protector iphone, accesorios iphone, carcasas iphone madrid, fundas iphone barcelona, case iphone, carcasas premium iphone';

  // Usar props o valores por defecto
  const finalTitle = title ? `${title} | CASEPRO España` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url || defaultUrl;
  const finalKeywords = keywords || defaultKeywords;

  // Nombre del sitio
  const siteName = 'CASEPRO España';

  // Structured Data for Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: 'https://casepro.es',
    logo: 'https://casepro.es/logo-casepro.svg',
    description: 'Tienda online de carcasas profesionales para iPhone en España',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34-XXX-XXX-XXX',
      contactType: 'Customer Service',
      areaServed: 'ES',
      availableLanguage: ['Spanish', 'English']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ES',
      addressRegion: 'España'
    },
    sameAs: [
      'https://facebook.com/caseproes',
      'https://instagram.com/caseproes',
      'https://twitter.com/caseproes'
    ]
  };

  // Structured Data for Product (if applicable)
  const productSchema = type === 'product' && price ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: finalDescription,
    image: finalImage,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    offers: {
      '@type': 'Offer',
      url: finalUrl,
      priceCurrency: currency,
      price: price,
      availability: `https://schema.org/${availability === 'in stock' ? 'InStock' : 'OutOfStock'}`,
      seller: {
        '@type': 'Organization',
        name: siteName
      }
    },
    ...(category && {
      category: category
    }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    }
  } : null;

  // Structured Data for Website
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: 'https://casepro.es',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://casepro.es/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Product-specific OG tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          {brand && <meta property="product:brand" content={brand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:creator" content="@tutienda" />

      {/* Additional SEO Tags */}
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="ES" />
      <meta name="geo.placename" content="España" />

      {/* Mobile */}
      <meta name="theme-color" content="#667eea" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}

      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
