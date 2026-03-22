import axios from 'axios';

/**
 * Middleware to track product views
 * Automatically logs when a product is viewed
 */
const trackProductViewMiddleware = (recommendationServiceUrl = 'http://localhost:8000/api/recommendations') => {
  return async (req, res, next) => {
    try {
      // Check if this is a product detail request
      if (req.path.includes('/product/') || req.path.includes('/detail')) {
        const productId = req.params.id || req.body.productId;
        const userId = req.body.userId || req.query.userId;

        if (productId && userId) {
          // Track the view asynchronously (non-blocking)
          axios.post(`${recommendationServiceUrl}/track-view`, {
            userId,
            productId
          }).catch(err => console.log('View tracking failed:', err.message));
        }
      }
      next();
    } catch (error) {
      // Don't block request if tracking fails
      next();
    }
  };
};

export default trackProductViewMiddleware;
