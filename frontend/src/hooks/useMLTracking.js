import { useEffect, useCallback, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID stored in sessionStorage
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ml_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('ml_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Get device type
 */
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

/**
 * Get current page type based on URL
 */
const getPageType = () => {
  const path = window.location.pathname;
  if (path === '/' || path === '/home') return 'home';
  if (path.includes('/product/')) return 'product';
  if (path.includes('/collection')) return 'collection';
  if (path.includes('/cart')) return 'cart';
  if (path.includes('/orders')) return 'orders';
  if (path.includes('/search')) return 'search';
  return 'other';
};

/**
 * Custom hook for comprehensive ML event tracking
 * @param {string} userId - The authenticated user's ID
 * @returns {Object} - Tracking methods
 */
export const useMLTracking = (userId) => {
  const sessionId = useRef(getSessionId());
  const sessionStartTracked = useRef(false);

  // Track session start on mount
  useEffect(() => {
    if (userId && !sessionStartTracked.current) {
      trackSessionStart();
      sessionStartTracked.current = true;
    }
  }, [userId]);

  /**
   * Track session start
   */
  const trackSessionStart = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/api/ml/track/session`, {
        userId,
        sessionId: sessionId.current,
        deviceInfo: {
          type: getDeviceType(),
          screen: `${window.innerWidth}x${window.innerHeight}`,
        },
        referrer: document.referrer,
      });
    } catch (error) {
      console.log('Failed to track session start:', error.message);
    }
  }, [userId]);

  /**
   * Track product view with rich metadata
   */
  const trackProductView = useCallback(async (productId, productData = {}) => {
    if (!productId) return;
    
    try {
      await axios.post(`${API_BASE}/api/ml/track/view`, {
        userId,
        productId,
        sessionId: sessionId.current,
        source: getPageType(),
        productData: {
          category: productData.category,
          subCategory: productData.subCategory,
          price: productData.price,
          name: productData.name,
        },
        deviceType: getDeviceType(),
        referrer: document.referrer,
      });
    } catch (error) {
      console.log('Failed to track product view:', error.message);
    }
  }, [userId]);

  /**
   * Track search query
   */
  const trackSearch = useCallback(async (query, resultsCount = 0, filters = {}) => {
    if (!query) return;

    try {
      await axios.post(`${API_BASE}/api/ml/track/search`, {
        userId,
        sessionId: sessionId.current,
        query,
        resultsCount,
        filters,
      });
    } catch (error) {
      console.log('Failed to track search:', error.message);
    }
  }, [userId]);

  /**
   * Track add to cart
   */
  const trackAddToCart = useCallback(async (productId, productData = {}, quantity = 1) => {
    if (!productId) return;

    try {
      await axios.post(`${API_BASE}/api/ml/track/cart/add`, {
        userId,
        productId,
        sessionId: sessionId.current,
        quantity,
        productData: {
          price: productData.price,
          size: productData.size,
          category: productData.category,
        },
        source: getPageType(),
      });
    } catch (error) {
      console.log('Failed to track add to cart:', error.message);
    }
  }, [userId]);

  /**
   * Track purchase
   */
  const trackPurchase = useCallback(async (orderData) => {
    if (!orderData?.items?.length) return;

    try {
      await axios.post(`${API_BASE}/api/ml/track/purchase`, {
        userId,
        sessionId: sessionId.current,
        items: orderData.items.map(item => ({
          productId: item.productId || item._id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
      });
    } catch (error) {
      console.log('Failed to track purchase:', error.message);
    }
  }, [userId]);

  /**
   * Track recommendation click
   */
  const trackRecommendationClick = useCallback(async (productId, recommendationType, position) => {
    if (!productId) return;

    try {
      await axios.post(`${API_BASE}/api/ml/track/recommendation-click`, {
        userId,
        productId,
        sessionId: sessionId.current,
        recommendationType,
        position,
        source: getPageType(),
      });
    } catch (error) {
      console.log('Failed to track recommendation click:', error.message);
    }
  }, [userId]);

  /**
   * Track time spent on a product page
   */
  const trackTimeOnPage = useCallback(async (productId, timeSpent) => {
    if (!productId || timeSpent < 1) return;

    try {
      await axios.post(`${API_BASE}/api/ml/track/time-on-page`, {
        userId,
        productId,
        sessionId: sessionId.current,
        timeSpent: Math.round(timeSpent),
      });
    } catch (error) {
      console.log('Failed to track time on page:', error.message);
    }
  }, [userId]);

  return {
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackPurchase,
    trackRecommendationClick,
    trackTimeOnPage,
    trackSessionStart,
    sessionId: sessionId.current,
  };
};

/**
 * Hook to track product view with automatic time tracking
 * @param {string} productId - Product ID
 * @param {string} userId - User ID
 * @param {Object} productData - Product metadata
 */
export const useProductViewTracking = (productId, userId, productData = {}) => {
  const startTime = useRef(Date.now());
  const { trackProductView, trackTimeOnPage } = useMLTracking(userId);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (productId && userId && !hasTracked.current) {
      // Track view after 1 second (avoid accidental views)
      const timer = setTimeout(() => {
        trackProductView(productId, productData);
        hasTracked.current = true;
      }, 1000);

      return () => {
        clearTimeout(timer);
        // Track time on page when leaving
        const timeSpent = (Date.now() - startTime.current) / 1000;
        if (hasTracked.current && timeSpent > 2) {
          trackTimeOnPage(productId, timeSpent);
        }
      };
    }
  }, [productId, userId, productData, trackProductView, trackTimeOnPage]);
};

/**
 * Hook to fetch ML recommendations
 * @param {string} userId - User ID
 * @param {Object} options - Fetch options
 * @returns {Object} - Recommendations data and loading state
 */
export const useMLRecommendations = (userId, options = {}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    limit = 10,
    excludeIds = [],
    strategy = 'hybrid',
    category = null,
    autoFetch = true,
  } = options;

  const fetchRecommendations = useCallback(async () => {
    if (!userId) {
      // Fetch cold start recommendations for anonymous users
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/ml/cold-start`, {
          params: { limit, category },
        });
        setRecommendations(response.data.recommendations || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/ml/recommendations`, {
        params: {
          userId,
          limit,
          excludeIds: excludeIds.join(','),
          strategy,
          category,
        },
      });
      setRecommendations(response.data.recommendations || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, excludeIds.join(','), strategy, category]);

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [autoFetch, fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  };
};

/**
 * Hook to fetch similar products
 * @param {string} productId - Product ID
 * @param {Object} options - Fetch options
 * @returns {Object} - Similar products data
 */
export const useSimilarProducts = (productId, options = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { limit = 6, autoFetch = true } = options;

  const fetchSimilarProducts = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/ml/similar/${productId}`, {
        params: { limit },
      });
      setProducts(response.data.products || response.data.similarProducts || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [productId, limit]);

  useEffect(() => {
    if (autoFetch && productId) {
      fetchSimilarProducts();
    }
  }, [autoFetch, productId, fetchSimilarProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchSimilarProducts,
  };
};

/**
 * Hook to fetch trending products
 * @param {Object} options - Fetch options
 * @returns {Object} - Trending products data
 */
export const useTrendingProducts = (options = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { limit = 10, timeWindow = 7, category = null, autoFetch = true } = options;

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/ml/trending`, {
        params: { limit, timeWindow, category },
      });
      setProducts(response.data.products || response.data.trendingProducts || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit, timeWindow, category]);

  useEffect(() => {
    if (autoFetch) {
      fetchTrendingProducts();
    }
  }, [autoFetch, fetchTrendingProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchTrendingProducts,
  };
};

export default useMLTracking;
