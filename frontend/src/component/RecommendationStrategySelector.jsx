import React, { useState, useEffect } from 'react';
import './RecommendationStrategySelector.css';

/**
 * Strategy Selector Component
 * Allows users to choose between different recommendation algorithms
 */
const RecommendationStrategySelector = ({ 
  currentStrategy, 
  onStrategyChange,
  showLabels = true,
  compact = false 
}) => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Default strategies (fallback if API fails)
  const defaultStrategies = [
    {
      id: 'hybrid',
      name: 'Smart Mix',
      description: 'Combines all strategies for best results',
      icon: '🎯'
    },
    {
      id: 'content',
      name: 'Based on Views',
      description: 'Similar to products you\'ve viewed',
      icon: '🔍'
    },
    {
      id: 'collaborative',
      name: 'People Like You',
      description: 'What similar users bought',
      icon: '👥'
    },
    {
      id: 'rating',
      name: 'Top Rated',
      description: 'Highly rated products for you',
      icon: '⭐'
    },
    {
      id: 'review-cf',
      name: 'Review Based',
      description: 'Based on similar reviewers',
      icon: '📝'
    },
    {
      id: 'trending',
      name: 'Trending',
      description: 'Popular right now',
      icon: '🔥'
    },
    {
      id: 'category',
      name: 'Your Categories',
      description: 'From your favorite categories',
      icon: '📦'
    }
  ];

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ml/strategies`);
      if (response.ok) {
        const data = await response.json();
        if (data.strategies && data.strategies.length > 0) {
          setStrategies(data.strategies);
        } else {
          setStrategies(defaultStrategies);
        }
      } else {
        setStrategies(defaultStrategies);
      }
    } catch (error) {
      console.log('Using default strategies');
      setStrategies(defaultStrategies);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyClick = (strategyId) => {
    if (onStrategyChange) {
      onStrategyChange(strategyId);
    }
  };

  if (loading) {
    return (
      <div className={`strategy-selector ${compact ? 'compact' : ''}`}>
        <div className="strategy-loading">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className={`strategy-selector ${compact ? 'compact' : ''}`}>
      {showLabels && (
        <div className="strategy-header">
          <h4>Recommendation Style</h4>
          <p>Choose how you want to discover products</p>
        </div>
      )}
      
      <div className="strategy-buttons">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            className={`strategy-btn ${currentStrategy === strategy.id ? 'active' : ''}`}
            onClick={() => handleStrategyClick(strategy.id)}
            title={strategy.description}
          >
            <span className="strategy-icon">{strategy.icon}</span>
            {!compact && <span className="strategy-name">{strategy.name}</span>}
          </button>
        ))}
      </div>

      {!compact && currentStrategy && (
        <div className="strategy-description">
          <span className="current-strategy-icon">
            {strategies.find(s => s.id === currentStrategy)?.icon}
          </span>
          <span className="current-strategy-text">
            {strategies.find(s => s.id === currentStrategy)?.description}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecommendationStrategySelector;
