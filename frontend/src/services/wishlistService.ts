// frontend/src/services/wishlistService.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  basePrice: number;
  lowestPrice: number;
  image: string | null;
  inStock: boolean;
  isFeatured: boolean;
  addedAt: string;
}

class WishlistService {
  // Get auth token
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get user's wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const response = await axios.get(`${API_URL}/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.wishlist;
  }

  // Add product to wishlist
  async addToWishlist(productId: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para añadir a favoritos');
    }

    await axios.post(
      `${API_URL}/wishlist/add`,
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Remove product from wishlist
  async removeFromWishlist(productId: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    await axios.delete(`${API_URL}/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Check if product is in wishlist
  async checkInWishlist(productId: string): Promise<boolean> {
    const token = this.getAuthToken();
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get(`${API_URL}/wishlist/check/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.inWishlist;
    } catch (error) {
      return false;
    }
  }

  // Get wishlist count
  async getWishlistCount(): Promise<number> {
    const token = this.getAuthToken();
    if (!token) {
      return 0;
    }

    try {
      const response = await axios.get(`${API_URL}/wishlist/count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.count;
    } catch (error) {
      return 0;
    }
  }
}

export default new WishlistService();
