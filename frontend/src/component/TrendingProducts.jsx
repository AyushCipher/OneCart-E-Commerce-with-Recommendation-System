import React from 'react';
import Title from './Title';
import Card from './Card';
import Loading from './Loading';
import { useTrendingProducts, useMLTracking } from '../hooks/useMLTracking';
import './RecommendedProducts.css';

const TrendingProducts = ({ 
  userId = null,
  limit = 8, 
  timeWindow = 7,
  category = null,
  title1 = "Trending",
  title2 = "Now"
}) => {
  const { products, loading, error } = useTrendingProducts({ 
    limit, 
    timeWindow, 
    category 
  });
  
  const { trackRecommendationClick } = useMLTracking(userId);

  const handleProductClick = (productId, index) => {
    if (userId) {
      trackRecommendationClick(productId, 'trending', index);
    }
  };

  if (loading) {
    return (
      <div className="recommended-container">
        <Title text1={title1} text2={title2} />
        <Loading />
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <div className="recommended-container">
      <Title text1={title1} text2={title2} />
      <div className="recommended-grid">
        {products.map((product, index) => (
          <div 
            key={product._id} 
            onClick={() => handleProductClick(product._id, index)}
          >
            <Card 
              id={product._id} 
              image={product.image1} 
              name={product.name} 
              price={product.price}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingProducts;
