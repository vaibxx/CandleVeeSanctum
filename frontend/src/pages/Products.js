import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from './LoadingSpinner';

export const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mood = searchParams.get('mood');
  const query = searchParams.get('q');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const filters = {};
        if (mood) filters.mood_category = mood;

        const response = await productsAPI.getAll(filters);
        setProducts(response.data.data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [mood, query]);

  if (isLoading) return <LoadingSpinner size="large" />;
  if (error) return <div className="container"><p>{error}</p></div>;

  return (
    <div className="container">
      <h1>{mood ? `${mood} Candles` : 'All Products'}</h1>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};