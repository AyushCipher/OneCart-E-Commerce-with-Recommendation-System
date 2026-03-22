import { useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to track product views for recommendation system
 * @param {string} productId - The ID of the product being viewed
 * @param {string} userId - The ID of the user viewing the product
 */
export const useTrackProductView = (productId, userId) => {
  useEffect(() => {
    if (productId && userId) {
      const trackView = async () => {
        try {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/recommendations/track-view`,
            {
              userId,
              productId
            }
          );
        } catch (error) {
          console.log('Failed to track product view:', error.message);
        }
      };

      // Delay slightly to avoid tracking accidental views
      const timer = setTimeout(trackView, 1000);
      return () => clearTimeout(timer);
    }
  }, [productId, userId]);
};

/**
 * Custom hook to track product purchases for recommendation system
 * @param {string} userId - The ID of the user making the purchase
 * @param {array} productIds - Array of product IDs being purchased
 */
export const useTrackProductPurchase = (userId, productIds) => {
  const trackPurchase = async () => {
    if (userId && productIds && Array.isArray(productIds)) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/recommendations/track-purchase`,
          {
            userId,
            productIds
          }
        );
      } catch (error) {
        console.log('Failed to track product purchase:', error.message);
      }
    }
  };

  return trackPurchase;
};

export default useTrackProductView;
