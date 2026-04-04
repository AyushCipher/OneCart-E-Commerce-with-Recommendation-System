import React, { useEffect, useState, useCallback } from 'react';
import Title from './Title';
import Card from './Card';
import Loading from './Loading';
import RecommendationStrategySelector from './RecommendationStrategySelector';
import './RecommendedProducts.css';
import { useMLTracking } from '../hooks/useMLTracking';

const RecommendedProducts = ({ 
  userId, 
  strategy: initialStrategy = 'hybrid', 
  limit = 8,
  title1 = "Recommended",
  title2 = "For You",
  excludeIds = [],
  showStrategy = false,
  showStrategySelector = false,
  compactSelector = false
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState(initialStrategy);
  const [currentStrategy, setCurrentStrategy] = useState(initialStrategy);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  const { trackRecommendationClick } = useMLTracking(userId);

  // Strategy labels for display
  const strategyLabels = {
    'hybrid': 'Smart Mix',
    'content': 'Based on Views',
    'collaborative': 'People Like You',
    'user-user': 'Similar Users',
    'item-item': 'Similar Products',
    'rating': 'Top Rated',
    'review-cf': 'Review Based',
    'trending': 'Trending Now',
    'category': 'Your Categories',
    'cold-start': 'Popular Picks'
  };

  const fetchMLRecommendations = useCallback(async (strategyToUse) => {
    try {
      // Try ML API first
      const response = await fetch(`${backendUrl}/api/ml/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          strategy: strategyToUse,
          limit: limit + excludeIds.length, // Request extra to account for filtering
          excludeIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Client-side filtering as safety measure
          const excludeSet = new Set(excludeIds.map(id => id.toString()));
          const filteredData = data.data.filter(p => !excludeSet.has(p._id.toString()));
          setRecommendations(filteredData.slice(0, limit));
          setActiveStrategy(data.strategy || strategyToUse);
          return true;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`ML API error (${response.status}):`, errorData.message || response.statusText);
      }
      return false;
    } catch (err) {
      console.error('ML API request failed:', err.message);
      console.log('Falling back to legacy recommendations');
      return false;
    }
  }, [userId, limit, excludeIds, backendUrl]);

  const fetchLegacyRecommendations = useCallback(async (strategyToUse) => {
    if (!userId) return false;

    try {
      const response = await fetch(`${backendUrl}/api/recommendations/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          strategy: strategyToUse,
          limit: limit + excludeIds.length
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Client-side filtering as safety measure
          const excludeSet = new Set(excludeIds.map(id => id.toString()));
          const filteredData = data.data.filter(p => !excludeSet.has(p._id.toString()));
          setRecommendations(filteredData.slice(0, limit));
          setActiveStrategy('legacy-' + strategyToUse);
          return true;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Legacy API error (${response.status}):`, errorData.message || response.statusText);
      }
      return false;
    } catch (err) {
      console.error('Legacy API request failed:', err.message);
      return false;
    }
  }, [userId, limit, excludeIds, backendUrl]);

  const fetchColdStartRecommendations = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ml/cold-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setRecommendations(data.data);
          setActiveStrategy('cold-start');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Cold start recommendations failed:', err);
      return false;
    }
  }, [limit, backendUrl]);

  const fetchRecommendations = useCallback(async (strategyToUse) => {
    setLoading(true);
    setError(null);

    let success = false;

    // Try ML recommendations first if user is logged in
    if (userId) {
      success = await fetchMLRecommendations(strategyToUse);
      
      // Fallback to legacy if ML fails
      if (!success) {
        success = await fetchLegacyRecommendations(strategyToUse);
      }
    }

    // For non-logged in users or if all else fails, try cold start
    if (!success) {
      success = await fetchColdStartRecommendations();
    }

    if (!success) {
      setError('Could not load recommendations');
    }

    setLoading(false);
  }, [userId, fetchMLRecommendations, fetchLegacyRecommendations, fetchColdStartRecommendations]);

  // Refetch when strategy, userId, or excludeIds change
  const excludeIdsKey = excludeIds.join(',');
  useEffect(() => {
    fetchRecommendations(currentStrategy);
  }, [currentStrategy, userId, excludeIdsKey]);

  const handleStrategyChange = (newStrategy) => {
    setCurrentStrategy(newStrategy);
  };

  const handleProductClick = (productId, index) => {
    if (userId && activeStrategy) {
      trackRecommendationClick(productId, activeStrategy, index);
    }
  };

  if (loading) {
    return (
      <div className="recommended-container">
        <div className="recommended-title-section">
          <Title text1={title1} text2={title2} />
          <div className="recommended-title-underline"></div>
        </div>
        {showStrategySelector && (
          <RecommendationStrategySelector
            currentStrategy={currentStrategy}
            onStrategyChange={handleStrategyChange}
            compact={compactSelector}
            showLabels={!compactSelector}
          />
        )}
        <Loading />
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <div className="recommended-container">
      <div className="recommended-title-section">
        <Title text1={title1} text2={title2} />
        <div className="recommended-title-underline"></div>
      </div>
      
      {showStrategySelector && (
        <RecommendationStrategySelector
          currentStrategy={currentStrategy}
          onStrategyChange={handleStrategyChange}
          compact={compactSelector}
          showLabels={!compactSelector}
        />
      )}

      {showStrategy && activeStrategy && (
        <p className="strategy-badge">
          Strategy: {strategyLabels[activeStrategy] || activeStrategy}
        </p>
      )}
      
      <div className="recommended-grid">
        {recommendations.map((product, index) => (
          <div 
            key={product._id} 
            onClick={() => handleProductClick(product._id, index)}
          >
            <Card 
              id={product._id} 
              image={product.image1} 
              name={product.name} 
              price={product.price}
              rating={product.ratings}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
