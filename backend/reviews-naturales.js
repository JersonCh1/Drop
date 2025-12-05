// backend/reviews-naturales.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Nombres más únicos y peruanos
const NOMBRES = [
  'Karina M.', 'Piero L.', 'Xiomara R.', 'Gianella S.',
  'Brayan T.', 'Daysi P.', 'Jhonatan C.', 'Wendy F.',
  'Yolanda Q.', 'Renzo M.', 'Flor H.', 'Erick V.',
  'Nayeli G.', 'Kevin Z.', 'Lizbeth A.', 'Antony P.',
  'Thalia R.', 'Fabricio L.', 'Yanina M.', 'Jefferson S.'
];

// Reseñas REALES - con errores, cortas, naturales
const REVIEWS_REALES = [
  // 5 estrellas pero naturales
  { rating: 5, title: 'Muy buena', comment: 'llego rapido y es tal cual la foto, ya la estoy usando' },
  { rating: 5, title: 'Recomendado', comment: 'Buena calidad por el precio. Ya es la segunda que compro' },
  { rating: 5, title: 'Excelente', comment: 'Me gusto mucho, protege bien el telefono y no se resbala' },
  { rating: 5, title: 'Perfecta', comment: 'quedo justo como esperaba, el color es bonito' },
  { rating: 5, title: 'Buena compra', comment: 'Si protege bien, los botones responden normal' },
  { rating: 5, title: 'Me encanto', comment: 'se ve bonita y es resistente, llego en buen estado' },
  { rating: 5, title: 'Genial', comment: 'Super, ya la tengo puesta y va perfecto' },

  // 4 estrellas - con pequeñas quejas
  { rating: 4, title: 'Bien', comment: 'Esta bien pero el color es un poco diferente a la foto, igual me gusta' },
  { rating: 4, title: 'Buena', comment: 'Demoro un poco en llegar pero la calidad es buena' },
  { rating: 4, title: 'Ok', comment: 'cumple, los botones son medio duros pero supongo que se aflojaran' },
  { rating: 4, title: 'Conforme', comment: 'No es la gran cosa pero por el precio esta ok' },

  // 3 estrellas - más críticas
  { rating: 3, title: 'Regular', comment: 'sirve pero esperaba mejor calidad' },
  { rating: 3, title: 'Normal', comment: 'Es normal nomas, nada del otro mundo' }
];

// Reseñas específicas para MagSafe
const REVIEWS_MAGSAFE = [
  { rating: 5, title: 'Los imanes si sirven', comment: 'probe con mi cargador magsafe y si funciona bien, se pega fuerte' },
  { rating: 5, title: 'Buen MagSafe', comment: 'El magsafe jala perfecto, carga sin problemas' },
  { rating: 4, title: 'Funciona', comment: 'los imanes funcionan pero no son tan fuertes como esperaba' }
];

// Reseñas para transparente
const REVIEWS_TRANSPARENTE = [
  { rating: 5, title: 'Se ve el color del iphone', comment: 'compre la transparente para que se vea el color de mi iphone y si funciona, no esta amarilla' },
  { rating: 4, title: 'Buena transparente', comment: 'esta bien, se ve el telefono y protege' }
];

function detectProductType(name) {
  const n = name.toLowerCase();
  if (n.includes('magsafe')) return 'magsafe';
  if (n.includes('transparente') || n.includes('clear')) return 'transparente';
  return 'general';
}

function generateReviews(productType, productId) {
  const reviews = [];
  const numReviews = Math.random() < 0.3 ? 1 : (Math.random() < 0.7 ? 2 : 3); // Menos reseñas

  let pool = [...REVIEWS_REALES];

  if (productType === 'magsafe') {
    pool = [...REVIEWS_MAGSAFE, ...REVIEWS_REALES.filter(r => r.rating >= 4)];
  } else if (productType === 'transparente') {
    pool = [...REVIEWS_TRANSPARENTE, ...REVIEWS_REALES.filter(r => r.rating >= 4)];
  }

  const shuffledNames = [...NOMBRES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < numReviews; i++) {
    const template = pool[Math.floor(Math.random() * pool.length)];

    // Fecha aleatoria - últimos 4 meses
    const daysAgo = Math.floor(Math.random() * 120) + 5;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    reviews.push({
      productId,
      customerName: shuffledNames[i],
      customerEmail: null,
      userId: null,
      rating: template.rating,
      title: template.title,
      comment: template.comment,
      isVerified: Math.random() > 0.5, // 50% verificadas (más realista)
      isApproved: true,
      createdAt
    });
  }

  return reviews;
}

async function crearReviews() {
  console.log('\n✨ Creando reseñas NATURALES y REALES\n');

  try {
    const products = await prisma.product.findMany();

    // Solo 30-40% de productos tendrán reseñas (más realista)
    const productsToReview = products
      .filter(() => Math.random() > 0.65)
      .slice(0, Math.min(15, products.length));

    console.log(`📦 Agregando reseñas a ${productsToReview.length} productos (de ${products.length} totales)\n`);

    let totalCreated = 0;

    for (const product of productsToReview) {
      const type = detectProductType(product.name);
      const reviews = generateReviews(type, product.id);

      for (const review of reviews) {
        await prisma.review.create({ data: review });
        totalCreated++;
      }

      const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      console.log(`✅ ${product.name.substring(0, 40)}... - ${reviews.length} reseñas (${avgRating}⭐)`);
    }

    console.log(`\n✅ Total: ${totalCreated} reseñas creadas\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearReviews();
