import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data.data.product);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (isLoading) return <LoadingSpinner size="large" />;
  if (!product) return <div className="container"><p>Product not found</p></div>;

  return (
    <div className="container">
      <div className="product-detail">
        <h1>{product.name}</h1>
        <p>${product.price}</p>
        <p>{product.description}</p>
      </div>
    </div>
  );
};