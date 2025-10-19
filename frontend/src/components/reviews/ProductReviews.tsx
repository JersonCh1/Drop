import React, { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  customerName: string;
  isVerified: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    customerName: '',
    customerEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/reviews/product/${productId}?limit=10&sortBy=recent`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setSubmitMessage('Por favor ingresa tu nombre');
      return;
    }

    if (!formData.comment.trim()) {
      setSubmitMessage('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('¡Gracias por tu reseña! Será publicada después de moderación.');
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          customerName: '',
          customerEmail: ''
        });
        setShowForm(false);

        // Reload reviews after a delay
        setTimeout(() => {
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitMessage(result.message || 'Error al enviar la reseña');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('Error al enviar la reseña. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Reseñas de Clientes
          </h2>

          {/* Stats */}
          {stats && stats.totalReviews > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div>
                      <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="mt-2">
                        {renderStars(Math.round(stats.averageRating), 'lg')}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-gray-700 font-semibold text-lg">
                        {stats.totalReviews} {stats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Basado en opiniones verificadas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.distribution[rating as keyof typeof stats.distribution] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 w-10">
                          {rating}★
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        <div className="mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Escribir una Reseña</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Escribe tu Reseña</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Calificación *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`w-10 h-10 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-4 text-lg font-semibold text-gray-700">
                      {formData.rating} {formData.rating === 1 ? 'estrella' : 'estrellas'}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Título (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Resumen de tu experiencia"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Comentario *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={5}
                    placeholder="Cuéntanos sobre tu experiencia con este producto..."
                    required
                  />
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div className={`p-4 rounded-lg ${submitMessage.includes('Gracias') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {submitMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Reseña</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aún no hay reseñas
              </h3>
              <p className="text-gray-600">
                ¡Sé el primero en compartir tu opinión sobre este producto!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900">{review.customerName}</h4>
                      {review.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Compra verificada
                        </span>
                      )}
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {review.title && (
                  <h5 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h5>
                )}

                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
