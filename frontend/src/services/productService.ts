// frontend/src/services/productService.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  color: string | null;
  price: string;
  comparePrice?: string | null;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;  // camelCase
  category_name?: string;
  category_slug?: string;
  category?: { name: string; slug: string };
  brand: string | null;
  model: string | null;
  compatibility: string | string[];
  isActive: boolean;  // camelCase
  isFeatured: boolean;  // camelCase
  inStock: boolean;  // camelCase
  stockCount: number;  // camelCase
  images: ProductImage[];
  variants: ProductVariant[];
  avg_rating?: string | null;
  review_count?: string;
  createdAt: string;  // camelCase
  updatedAt: string;  // camelCase
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  model?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

class ProductService {
  /**
   * Obtener lista de productos con filtros
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.model) params.append('model', filters.model);
      if (filters.color) params.append('color', filters.color);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.featured) params.append('featured', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await axios.get<ProductsResponse>(
        `${API_URL}/products?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const response = await this.getProducts({
        featured: true,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  /**
   * Obtener producto por slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await axios.get<ProductDetailResponse>(
        `${API_URL}/products/${slug}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Buscar productos
   */
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.getProducts({
        search: query,
        limit
      });

      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(categorySlug: string, page: number = 1): Promise<ProductsResponse> {
    try {
      return await this.getProducts({
        category: categorySlug,
        page,
        limit: 20
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Obtener productos compatibles con un modelo de iPhone
   */
  async getProductsByModel(model: string, page: number = 1): Promise<ProductsResponse> {
    try {
      return await this.getProducts({
        model,
        page,
        limit: 20
      });
    } catch (error) {
      console.error('Error fetching products by model:', error);
      throw error;
    }
  }

  /**
   * Obtener imagen principal del producto
   */
  getMainImage(product: Product): string {
    const mainImage = product.images.find(img => img.isMain);
    if (mainImage) return mainImage.url;

    if (product.images.length > 0) return product.images[0].url;

    return 'https://placehold.co/400x400?text=No+Image';
  }

  /**
   * Formatear precio
   */
  formatPrice(price: string | number): string {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    return `$${priceNum.toFixed(2)}`;
  }

  /**
   * Obtener precio más bajo de variantes
   */
  getLowestPrice(product: Product): number {
    // Precio base como fallback
    const basePrice = typeof product.basePrice === 'number'
      ? product.basePrice
      : (typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : 0);

    // Si no hay variantes, devolver precio base
    if (!product.variants || product.variants.length === 0) {
      return basePrice;
    }

    // Obtener precios válidos de variantes activas
    const prices = product.variants
      .filter(v => v.isActive)
      .map(v => typeof v.price === 'number' ? v.price : parseFloat(v.price))
      .filter(price => !isNaN(price) && price > 0);

    // Si no hay precios válidos en variantes, usar precio base
    if (prices.length === 0) {
      return basePrice;
    }

    // Devolver el precio más bajo entre variantes y precio base
    return Math.min(...prices, basePrice);
  }

  /**
   * Verificar disponibilidad
   */
  isAvailable(product: Product): boolean {
    if (!product.isActive || !product.inStock) return false;

    if (product.variants.length === 0) {
      return product.stockCount > 0;
    }

    return product.variants.some(v => v.isActive && v.stockQuantity > 0);
  }

  /**
   * Obtener variantes disponibles
   */
  getAvailableVariants(product: Product): ProductVariant[] {
    return product.variants.filter(v => v.isActive && v.stockQuantity > 0);
  }

  /**
   * Obtener colores únicos disponibles
   */
  getAvailableColors(product: Product): string[] {
    const colors = product.variants
      .filter(v => v.isActive && v.color)
      .map(v => v.color as string);

    return [...new Set(colors)];
  }
}

const productService = new ProductService();
export default productService;
