// backend/src/utils/database.js
const { Client } = require('pg');

class DatabaseService {
  constructor() {
    this.connectionString = process.env.DATABASE_URL;
    this.sslConfig = {
      rejectUnauthorized: false
    };
  }

  async getClient() {
    const client = new Client({
      connectionString: this.connectionString,
      ssl: this.sslConfig
    });
    return client;
  }

  async initializeDatabase() {
    try {
      const client = await this.getClient();
      await client.connect();

      console.log('🗄️  Inicializando base de datos...');

      // Crear extensiones necesarias
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Crear tabla de usuarios
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'CUSTOMER',
          "isActive" BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de categorías
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          brand VARCHAR(100),
          model VARCHAR(100),
          compatibility TEXT[],
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          in_stock BOOLEAN DEFAULT true,
          stock_count INTEGER DEFAULT 0,
          meta_title VARCHAR(255),
          meta_description TEXT,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de variantes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(50),
          size VARCHAR(50),
          material VARCHAR(100),
          price DECIMAL(10,2) NOT NULL,
          compare_price DECIMAL(10,2),
          sku VARCHAR(100) UNIQUE NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          supplier_product_id VARCHAR(255),
          supplier_url TEXT,
          supplier_price DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de imágenes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          alt_text VARCHAR(255),
          position INTEGER DEFAULT 0,
          is_main BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de órdenes (actualizada)
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          shipping_cost DECIMAL(10,2) NOT NULL,
          tax DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'pending',
          stripe_payment_id VARCHAR(255),
          stripe_session_id VARCHAR(255),
          shipping_address TEXT NOT NULL,
          shipping_city VARCHAR(100) NOT NULL,
          shipping_state VARCHAR(100) NOT NULL,
          shipping_postal_code VARCHAR(20) NOT NULL,
          shipping_country VARCHAR(10) NOT NULL,
          notes TEXT,
          tracking_number VARCHAR(255),
          tracking_url TEXT,
          shipped_at TIMESTAMP,
          delivered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de items de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER DEFAULT 1,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          product_model VARCHAR(100),
          product_color VARCHAR(50),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de historial de estados de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_status_history (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de notificaciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_notifications (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          sent_at TIMESTAMP,
          status VARCHAR(20) DEFAULT 'PENDING',
          error TEXT,
          retry_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de carrito
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_id VARCHAR(255),
          product_id INTEGER DEFAULT 1,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de reviews
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          product_id INTEGER DEFAULT 1,
          customer_name VARCHAR(255),
          customer_email VARCHAR(255),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          is_verified BOOLEAN DEFAULT false,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de direcciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          company VARCHAR(255),
          address1 TEXT NOT NULL,
          address2 TEXT,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          country VARCHAR(10) NOT NULL,
          phone VARCHAR(50),
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de configuraciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          type VARCHAR(20) DEFAULT 'STRING',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de analytics
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          event VARCHAR(100) NOT NULL,
          data JSONB,
          session_id VARCHAR(255),
          user_id INTEGER,
          ip VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de cupones de descuento
      await client.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          type VARCHAR(20) NOT NULL, -- 'PERCENTAGE' o 'FIXED'
          value DECIMAL(10,2) NOT NULL,
          min_order_amount DECIMAL(10,2) DEFAULT 0,
          max_discount_amount DECIMAL(10,2),
          usage_limit INTEGER,
          used_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          starts_at TIMESTAMP,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de suscriptores del newsletter
      await client.query(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          source VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          subscribed_at TIMESTAMP DEFAULT NOW(),
          unsubscribed_at TIMESTAMP
        )
      `);

      // Crear índices para mejor rendimiento
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_type_event ON analytics(type, event)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON order_notifications(order_id)');

      await client.end();
      console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      const client = await this.getClient();
      await client.connect();

      console.log('🌱 Sembrando datos iniciales...');

      // Insertar categorías por defecto
      await client.query(`
        INSERT INTO categories (name, slug, description, is_active, sort_order)
        VALUES 
          ('Carcasas iPhone', 'carcasas-iphone', 'Carcasas protectoras para iPhone', true, 1),
          ('Cargadores', 'cargadores', 'Cargadores y cables para iPhone', true, 2),
          ('Accesorios', 'accesorios', 'Accesorios diversos para iPhone', true, 3),
          ('Protectores de Pantalla', 'protectores-pantalla', 'Protectores de pantalla y privacidad', true, 4),
          ('Auriculares', 'auriculares', 'Auriculares y accesorios de audio', true, 5)
        ON CONFLICT (slug) DO NOTHING
      `);

      // Obtener ID de categoría de carcasas
      const categoryResult = await client.query("SELECT id FROM categories WHERE slug = 'carcasas-iphone' LIMIT 1");
      const categoryId = categoryResult.rows[0]?.id;

      if (categoryId) {
        // Insertar productos por defecto
        const products = [
          {
            name: 'Carcasa iPhone Premium Transparente',
            slug: 'carcasa-iphone-premium-transparente',
            description: 'Carcasa transparente de alta calidad con protección militar. Fabricada con materiales resistentes que protegen tu iPhone sin comprometer el diseño original.',
            basePrice: 19.99,
            brand: 'Premium',
            model: 'Transparente',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12'],
            isActive: true,
            isFeatured: true,
            inStock: true,
            stockCount: 100,
            metaTitle: 'Carcasa iPhone Transparente Premium - Protección Total',
            metaDescription: 'Protege tu iPhone con nuestra carcasa transparente premium. Resistente, duradera y con envío gratis.'
          },
          {
            name: 'Carcasa iPhone Silicona Colores',
            slug: 'carcasa-iphone-silicona-colores',
            description: 'Carcasa de silicona suave al tacto, disponible en múltiples colores vibrantes. Protección completa con acceso a todos los puertos.',
            basePrice: 24.99,
            brand: 'Premium',
            model: 'Silicona',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12'],
            isActive: true,
            isFeatured: true,
            inStock: true,
            stockCount: 150,
            metaTitle: 'Carcasa iPhone Silicona - Múltiples Colores',
            metaDescription: 'Carcasa de silicona premium en colores vibrantes. Suave al tacto y máxima protección.'
          },
          {
            name: 'Carcasa iPhone Antimicrobiana',
            slug: 'carcasa-iphone-antimicrobiana',
            description: 'Carcasa con tecnología antimicrobiana que elimina el 99.9% de bacterias. Ideal para uso diario con máxima higiene.',
            basePrice: 34.99,
            brand: 'TechShield',
            model: 'Antimicrobial',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
            isActive: true,
            isFeatured: false,
            inStock: true,
            stockCount: 75,
            metaTitle: 'Carcasa iPhone Antimicrobiana - Protección e Higiene',
            metaDescription: 'Carcasa con tecnología antimicrobiana. Elimina bacterias y protege tu iPhone.'
          }
        ];

        for (const product of products) {
          const productResult = await client.query(`
            INSERT INTO products (
              name, slug, description, base_price, brand, model, 
              compatibility, is_active, is_featured, in_stock, 
              stock_count, category_id, meta_title, meta_description
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (slug) DO NOTHING
            RETURNING id
          `, [
            product.name,
            product.slug,
            product.description,
            product.basePrice,
            product.brand,
            product.model,
            product.compatibility,
            product.isActive,
            product.isFeatured,
            product.inStock,
            product.stockCount,
            categoryId,
            product.metaTitle,
            product.metaDescription
          ]);

          // Si el producto fue insertado, crear variantes
          if (productResult.rows.length > 0) {
            const productId = productResult.rows[0].id;
            const colors = ['Negro', 'Azul', 'Rosa', 'Transparente', 'Verde', 'Morado'];
            const models = ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12'];

            for (const model of models) {
              for (const color of colors) {
                // Saltar combinaciones que no tienen sentido
                if (product.slug.includes('transparente') && color !== 'Transparente') continue;
                if (product.slug.includes('antimicrobiana') && !['Negro', 'Azul', 'Verde'].includes(color)) continue;

                const sku = `${productId}-${model.replace(' ', '').toLowerCase()}-${color.toLowerCase()}`;
                let variantPrice = product.basePrice;
                
                // Ajustar precios por color especial
                if (['Verde', 'Morado'].includes(color)) variantPrice += 2;
                if (color === 'Rosa') variantPrice += 1;

                try {
                  await client.query(`
                    INSERT INTO product_variants (
                      product_id, name, color, price, sku, stock_quantity, is_active
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (sku) DO NOTHING
                  `, [
                    productId,
                    `${product.name} ${model} - ${color}`,
                    color,
                    variantPrice,
                    sku,
                    Math.floor(Math.random() * 50) + 10, // Stock aleatorio entre 10-60
                    true
                  ]);
                } catch (skuError) {
                  // SKU duplicado, continuar
                  continue;
                }
              }
            }
          }
        }
      }

      // Insertar configuraciones por defecto
      const defaultSettings = [
        { key: 'site_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'site_description', value: 'Carcasas iPhone de alta calidad con envío gratis', type: 'STRING' },
        { key: 'currency', value: 'USD', type: 'STRING' },
        { key: 'currency_symbol', value: 'console.log('🗄️  Inicializando base de datos...');

      // Crear tabla de items de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          product_model VARCHAR(100),
          product_color VARCHAR(50),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de historial de estados de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_status_history (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de notificaciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_notifications (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          sent_at TIMESTAMP,
          status VARCHAR(20) DEFAULT 'PENDING',
          error TEXT,
          retry_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de carrito
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_id VARCHAR(255),
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, product_id, variant_id),
          UNIQUE(session_id, product_id, variant_id)
        )
      `);

      // Crear tabla de reviews
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          customer_name VARCHAR(255),
          customer_email VARCHAR(255),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          is_verified BOOLEAN DEFAULT false,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de direcciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          company VARCHAR(255),
          address1 TEXT NOT NULL,
          address2 TEXT,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          country VARCHAR(10) NOT NULL,
          phone VARCHAR(50),
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de configuraciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          type VARCHAR(20) DEFAULT 'STRING',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de analytics
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          event VARCHAR(100) NOT NULL,
          data JSONB,
          session_id VARCHAR(255),
          user_id INTEGER,
          ip VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear índices para mejor rendimiento
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_type_event ON analytics(type, event)');

      await client.end();
      console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      const client = await this.getClient();
      await client.connect();

      console.log('🌱 Sembrando datos iniciales...');

      // Insertar categorías por defecto
      await client.query(`
        INSERT INTO categories (name, slug, description, is_active, sort_order)
        VALUES 
          ('Carcasas iPhone', 'carcasas-iphone', 'Carcasas protectoras para iPhone', true, 1),
          ('Cargadores', 'cargadores', 'Cargadores y cables para iPhone', true, 2),
          ('Accesorios', 'accesorios', 'Accesorios diversos para iPhone', true, 3)
        ON CONFLICT (slug) DO NOTHING
      `);

      // Obtener ID de categoría de carcasas
      const categoryResult = await client.query("SELECT id FROM categories WHERE slug = 'carcasas-iphone' LIMIT 1");
      const categoryId = categoryResult.rows[0]?.id;

      if (categoryId) {
        // Insertar productos por defecto
        const products = [
          {
            name: 'Carcasa iPhone Premium Transparente',
            slug: 'carcasa-iphone-premium-transparente',
            description: 'Carcasa transparente de alta calidad con protección militar',
            basePrice: 19.99,
            brand: 'Premium',
            model: 'Transparente',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
            isActive: true,
            isFeatured: true,
            inStock: true,
            stockCount: 100
          },
          {
            name: 'Carcasa iPhone Silicona Colores',
            slug: 'carcasa-iphone-silicona-colores',
            description: 'Carcasa de silicona suave en múltiples colores',
            basePrice: 24.99,
            brand: 'Premium',
            model: 'Silicona',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
            isActive: true,
            isFeatured: false,
            inStock: true,
            stockCount: 150
          }
        ];

        for (const product of products) {
          await client.query(`
            INSERT INTO products (
              name, slug, description, base_price, brand, model, 
              compatibility, is_active, is_featured, in_stock, 
              stock_count, category_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (slug) DO NOTHING
          `, [
            product.name,
            product.slug,
            product.description,
            product.basePrice,
            product.brand,
            product.model,
            product.compatibility,
            product.isActive,
            product.isFeatured,
            product.inStock,
            product.stockCount,
            categoryId
          ]);
        }

        // Crear variantes para los productos
        const productIds = await client.query('SELECT id FROM products ORDER BY id LIMIT 2');
        
        if (productIds.rows.length > 0) {
          const colors = ['Negro', 'Azul', 'Rosa', 'Transparente'];
          const models = ['iPhone 15', 'iPhone 14', 'iPhone 13'];

          for (const productRow of productIds.rows) {
            for (const model of models) {
              for (const color of colors) {
                const sku = `${productRow.id}-${model.replace(' ', '').toLowerCase()}-${color.toLowerCase()}`;
                const price = color === 'Transparente' ? 19.99 : 24.99;
                
                await client.query(`
                  INSERT INTO product_variants (
                    product_id, name, color, price, sku, stock_quantity, is_active
                  )
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                  ON CONFLICT (sku) DO NOTHING
                `, [
                  productRow.id,
                  `Carcasa ${model} - ${color}`,
                  color,
                  price,
                  sku,
                  50,
                  true
                ]);
              }
            }
          }
        }
      }

      // Insertar configuraciones por defecto
      const defaultSettings = [
        { key: 'site_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'site_description', value: 'Carcasas iPhone de alta calidad', type: 'STRING' },
        { key: 'currency', value: 'USD', type: 'STRING' },
        { key: 'tax_rate', value: '0', type: 'NUMBER' },
        { key: 'free_shipping_threshold', value: '50', type: 'NUMBER' },
        { key: 'default_shipping_cost', value: '5.99', type: 'NUMBER' },
        { key: 'stripe_enabled', value: 'true', type: 'BOOLEAN' },
        { key: 'email_notifications', value: 'true', type: 'BOOLEAN' },
        { key: 'whatsapp_notifications', value: 'false', type: 'BOOLEAN' },
        { key: 'admin_email', value: 'admin@example.com', type: 'STRING' },
        { key: 'support_email', value: 'support@example.com', type: 'STRING' },
        { key: 'company_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'company_address', value: '123 Main St, City, Country', type: 'STRING' }
      ];

      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO settings (key, value, type)
          VALUES ($1, $2, $3)
          ON CONFLICT (key) DO NOTHING
        `, [setting.key, setting.value, setting.type]);
      }

      await client.end();
      console.log('✅ Datos iniciales sembrados correctamente');

    } catch (error) {
      console.error('❌ Error al sembrar datos:', error);
      throw error;
    }
  }
}

const dbService = new DatabaseService();

module.exports = {
  initializeDatabase: () => dbService.initializeDatabase(),
  seedDatabase: () => dbService.seedDatabase(),
  getDbClient: () => dbService.getClient()
}; extensiones necesarias
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Crear tabla de usuarios
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'CUSTOMER',
          "isActive" BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de categorías
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          brand VARCHAR(100),
          model VARCHAR(100),
          compatibility TEXT[],
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          in_stock BOOLEAN DEFAULT true,
          stock_count INTEGER DEFAULT 0,
          meta_title VARCHAR(255),
          meta_description TEXT,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de variantes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(50),
          size VARCHAR(50),
          material VARCHAR(100),
          price DECIMAL(10,2) NOT NULL,
          compare_price DECIMAL(10,2),
          sku VARCHAR(100) UNIQUE NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          supplier_product_id VARCHAR(255),
          supplier_url TEXT,
          supplier_price DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de imágenes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          alt_text VARCHAR(255),
          position INTEGER DEFAULT 0,
          is_main BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de órdenes (actualizada)
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          shipping_cost DECIMAL(10,2) NOT NULL,
          tax DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'PENDING',
          stripe_payment_id VARCHAR(255),
          stripe_session_id VARCHAR(255),
          shipping_address TEXT NOT NULL,
          shipping_city VARCHAR(100) NOT NULL,
          shipping_state VARCHAR(100) NOT NULL,
          shipping_postal_code VARCHAR(20) NOT NULL,
          shipping_country VARCHAR(10) NOT NULL,
          notes TEXT,
          tracking_number VARCHAR(255),
          tracking_url TEXT,
          shipped_at TIMESTAMP,
          delivered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear, type: 'STRING' },
        { key: 'tax_rate', value: '0', type: 'NUMBER' },
        { key: 'free_shipping_threshold', value: '50', type: 'NUMBER' },
        { key: 'default_shipping_cost', value: '5.99', type: 'NUMBER' },
        { key: 'stripe_enabled', value: 'true', type: 'BOOLEAN' },
        { key: 'email_notifications', value: 'true', type: 'BOOLEAN' },
        { key: 'whatsapp_notifications', value: 'false', type: 'BOOLEAN' },
        { key: 'admin_email', value: process.env.ADMIN_EMAIL || 'admin@example.com', type: 'STRING' },
        { key: 'support_email', value: process.env.SUPPORT_EMAIL || 'support@example.com', type: 'STRING' },
        { key: 'company_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'company_address', value: '123 Main St, City, Country', type: 'STRING' },
        { key: 'facebook_url', value: 'https://facebook.com/iphonecasesstore', type: 'STRING' },
        { key: 'instagram_url', value: 'https://instagram.com/iphonecasesstore', type: 'STRING' },
        { key: 'twitter_url', value: 'https://twitter.com/iphonecasesstore', type: 'STRING' },
        { key: 'whatsapp_number', value: '+1234567890', type: 'STRING' },
        { key: 'analytics_enabled', value: 'true', type: 'BOOLEAN' },
        { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' }
      ];

      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO settings (key, value, type)
          VALUES ($1, $2, $3)
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW()
        `, [setting.key, setting.value, setting.type]);
      }

      // Insertar cupones de ejemplo
      const sampleCoupons = [
        {
          code: 'WELCOME10',
          type: 'PERCENTAGE',
          value: 10,
          minOrderAmount: 20,
          maxDiscountAmount: 50,
          usageLimit: 1000,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
        },
        {
          code: 'FREESHIP',
          type: 'FIXED',
          value: 5.99,
          minOrderAmount: 25,
          maxDiscountAmount: null,
          usageLimit: null,
          expiresAt: null
        }
      ];

      for (const coupon of sampleCoupons) {
        await client.query(`
          INSERT INTO coupons (code, type, value, min_order_amount, max_discount_amount, usage_limit, expires_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (code) DO NOTHING
        `, [
          coupon.code,
          coupon.type,
          coupon.value,
          coupon.minOrderAmount,
          coupon.maxDiscountAmount,
          coupon.usageLimit,
          coupon.expiresAt
        ]);
      }

      await client.end();
      console.log('✅ Datos iniciales sembrados correctamente');

    } catch (error) {
      console.error('❌ Error al sembrar datos:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const client = await this.getClient();
      await client.connect();
      
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      await client.end();
      
      return {
        success: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTableStats() {
    try {
      const client = await this.getClient();
      await client.connect();

      const tables = [
        'users', 'categories', 'products', 'product_variants', 'product_images',
        'orders', 'order_items', 'order_status_history', 'order_notifications',
        'cart_items', 'reviews', 'addresses', 'settings', 'analytics',
        'coupons', 'newsletter_subscribers'
      ];

      const stats = {};

      for (const table of tables) {
        try {
          const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = parseInt(result.rows[0].count);
        } catch (error) {
          stats[table] = 'N/A';
        }
      }

      await client.end();
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de tablas:', error);
      return {};
    }
  }

  async resetDatabase() {
    try {
      const client = await this.getClient();
      await client.connect();

      console.log('🔄 Reseteando base de datos...');

      // Lista de tablas en orden inverso para evitar problemas de FK
      const tables = [
        'analytics', 'newsletter_subscribers', 'coupons', 'settings',
        'addresses', 'reviews', 'cart_items', 'order_notifications',
        'order_status_history', 'order_items', 'orders', 'product_images',
        'product_variants', 'products', 'categories', 'users'
      ];

      for (const table of tables) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`🗑️  Tabla ${table} eliminada`);
        } catch (error) {
          console.log(`⚠️  Error eliminando tabla ${table}: ${error.message}`);
        }
      }

      await client.end();
      console.log('✅ Base de datos reseteada');

      // Reinicializar
      await this.initializeDatabase();
      await this.seedDatabase();

    } catch (error) {
      console.error('❌ Error reseteando base de datos:', error);
      throw error;
    }
  }
}

const dbService = new DatabaseService();

module.exports = {
  initializeDatabase: () => dbService.initializeDatabase(),
  seedDatabase: () => dbService.seedDatabase(),
  getDbClient: () => dbService.getClient(),
  testConnection: () => dbService.testConnection(),
  getTableStats: () => dbService.getTableStats(),
  resetDatabase: () => dbService.resetDatabase()
};console.log('🗄️  Inicializando base de datos...');

      // Crear tabla de items de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          product_model VARCHAR(100),
          product_color VARCHAR(50),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de historial de estados de orden
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_status_history (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de notificaciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_notifications (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          sent_at TIMESTAMP,
          status VARCHAR(20) DEFAULT 'PENDING',
          error TEXT,
          retry_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de carrito
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_id VARCHAR(255),
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, product_id, variant_id),
          UNIQUE(session_id, product_id, variant_id)
        )
      `);

      // Crear tabla de reviews
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          customer_name VARCHAR(255),
          customer_email VARCHAR(255),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          is_verified BOOLEAN DEFAULT false,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de direcciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          company VARCHAR(255),
          address1 TEXT NOT NULL,
          address2 TEXT,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          country VARCHAR(10) NOT NULL,
          phone VARCHAR(50),
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de configuraciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          type VARCHAR(20) DEFAULT 'STRING',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de analytics
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          event VARCHAR(100) NOT NULL,
          data JSONB,
          session_id VARCHAR(255),
          user_id INTEGER,
          ip VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear índices para mejor rendimiento
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_analytics_type_event ON analytics(type, event)');

      await client.end();
      console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      const client = await this.getClient();
      await client.connect();

      console.log('🌱 Sembrando datos iniciales...');

      // Insertar categorías por defecto
      await client.query(`
        INSERT INTO categories (name, slug, description, is_active, sort_order)
        VALUES 
          ('Carcasas iPhone', 'carcasas-iphone', 'Carcasas protectoras para iPhone', true, 1),
          ('Cargadores', 'cargadores', 'Cargadores y cables para iPhone', true, 2),
          ('Accesorios', 'accesorios', 'Accesorios diversos para iPhone', true, 3)
        ON CONFLICT (slug) DO NOTHING
      `);

      // Obtener ID de categoría de carcasas
      const categoryResult = await client.query("SELECT id FROM categories WHERE slug = 'carcasas-iphone' LIMIT 1");
      const categoryId = categoryResult.rows[0]?.id;

      if (categoryId) {
        // Insertar productos por defecto
        const products = [
          {
            name: 'Carcasa iPhone Premium Transparente',
            slug: 'carcasa-iphone-premium-transparente',
            description: 'Carcasa transparente de alta calidad con protección militar',
            basePrice: 19.99,
            brand: 'Premium',
            model: 'Transparente',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
            isActive: true,
            isFeatured: true,
            inStock: true,
            stockCount: 100
          },
          {
            name: 'Carcasa iPhone Silicona Colores',
            slug: 'carcasa-iphone-silicona-colores',
            description: 'Carcasa de silicona suave en múltiples colores',
            basePrice: 24.99,
            brand: 'Premium',
            model: 'Silicona',
            compatibility: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
            isActive: true,
            isFeatured: false,
            inStock: true,
            stockCount: 150
          }
        ];

        for (const product of products) {
          await client.query(`
            INSERT INTO products (
              name, slug, description, base_price, brand, model, 
              compatibility, is_active, is_featured, in_stock, 
              stock_count, category_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (slug) DO NOTHING
          `, [
            product.name,
            product.slug,
            product.description,
            product.basePrice,
            product.brand,
            product.model,
            product.compatibility,
            product.isActive,
            product.isFeatured,
            product.inStock,
            product.stockCount,
            categoryId
          ]);
        }

        // Crear variantes para los productos
        const productIds = await client.query('SELECT id FROM products ORDER BY id LIMIT 2');
        
        if (productIds.rows.length > 0) {
          const colors = ['Negro', 'Azul', 'Rosa', 'Transparente'];
          const models = ['iPhone 15', 'iPhone 14', 'iPhone 13'];

          for (const productRow of productIds.rows) {
            for (const model of models) {
              for (const color of colors) {
                const sku = `${productRow.id}-${model.replace(' ', '').toLowerCase()}-${color.toLowerCase()}`;
                const price = color === 'Transparente' ? 19.99 : 24.99;
                
                await client.query(`
                  INSERT INTO product_variants (
                    product_id, name, color, price, sku, stock_quantity, is_active
                  )
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                  ON CONFLICT (sku) DO NOTHING
                `, [
                  productRow.id,
                  `Carcasa ${model} - ${color}`,
                  color,
                  price,
                  sku,
                  50,
                  true
                ]);
              }
            }
          }
        }
      }

      // Insertar configuraciones por defecto
      const defaultSettings = [
        { key: 'site_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'site_description', value: 'Carcasas iPhone de alta calidad', type: 'STRING' },
        { key: 'currency', value: 'USD', type: 'STRING' },
        { key: 'tax_rate', value: '0', type: 'NUMBER' },
        { key: 'free_shipping_threshold', value: '50', type: 'NUMBER' },
        { key: 'default_shipping_cost', value: '5.99', type: 'NUMBER' },
        { key: 'stripe_enabled', value: 'true', type: 'BOOLEAN' },
        { key: 'email_notifications', value: 'true', type: 'BOOLEAN' },
        { key: 'whatsapp_notifications', value: 'false', type: 'BOOLEAN' },
        { key: 'admin_email', value: 'admin@example.com', type: 'STRING' },
        { key: 'support_email', value: 'support@example.com', type: 'STRING' },
        { key: 'company_name', value: 'iPhone Cases Store', type: 'STRING' },
        { key: 'company_address', value: '123 Main St, City, Country', type: 'STRING' }
      ];

      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO settings (key, value, type)
          VALUES ($1, $2, $3)
          ON CONFLICT (key) DO NOTHING
        `, [setting.key, setting.value, setting.type]);
      }

      await client.end();
      console.log('✅ Datos iniciales sembrados correctamente');

    } catch (error) {
      console.error('❌ Error al sembrar datos:', error);
      throw error;
    }
  }
}

const dbService = new DatabaseService();

module.exports = {
  initializeDatabase: () => dbService.initializeDatabase(),
  seedDatabase: () => dbService.seedDatabase(),
  getDbClient: () => dbService.getClient()
}; extensiones necesarias
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Crear tabla de usuarios
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'CUSTOMER',
          "isActive" BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de categorías
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          brand VARCHAR(100),
          model VARCHAR(100),
          compatibility TEXT[],
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          in_stock BOOLEAN DEFAULT true,
          stock_count INTEGER DEFAULT 0,
          meta_title VARCHAR(255),
          meta_description TEXT,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de variantes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          color VARCHAR(50),
          size VARCHAR(50),
          material VARCHAR(100),
          price DECIMAL(10,2) NOT NULL,
          compare_price DECIMAL(10,2),
          sku VARCHAR(100) UNIQUE NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          supplier_product_id VARCHAR(255),
          supplier_url TEXT,
          supplier_price DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de imágenes de productos
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          alt_text VARCHAR(255),
          position INTEGER DEFAULT 0,
          is_main BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear tabla de órdenes (actualizada)
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          shipping_cost DECIMAL(10,2) NOT NULL,
          tax DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'PENDING',
          stripe_payment_id VARCHAR(255),
          stripe_session_id VARCHAR(255),
          shipping_address TEXT NOT NULL,
          shipping_city VARCHAR(100) NOT NULL,
          shipping_state VARCHAR(100) NOT NULL,
          shipping_postal_code VARCHAR(20) NOT NULL,
          shipping_country VARCHAR(10) NOT NULL,
          notes TEXT,
          tracking_number VARCHAR(255),
          tracking_url TEXT,
          shipped_at TIMESTAMP,
          delivered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Crear