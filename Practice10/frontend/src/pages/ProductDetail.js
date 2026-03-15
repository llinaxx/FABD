import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to load product', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Загрузка...</div>;
  }

  if (!product) {
    return <div style={styles.loading}>Товар не найден</div>;
  }

  return (
    <div style={styles.container}>
      <Link to="/products" style={styles.backLink}>
        ← Назад к списку
      </Link>

      <div style={styles.card}>
        <h1>{product.title}</h1>
        <div style={styles.detail}>
          <strong>Категория:</strong> {product.category}
        </div>
        <div style={styles.detail}>
          <strong>Описание:</strong> {product.description}
        </div>
        <div style={styles.detail}>
          <strong>Цена:</strong> {product.price} ₽
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    backgroundColor: '#fdf8f2',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#8b7356',
    textDecoration: 'none',
    border: '1px solid #d4b89c',
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
  },
  card: {
    border: '2px solid #d4b89c',
    borderRadius: '16px',
    padding: '30px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(139, 115, 86, 0.1)',
  },
  detail: {
    margin: '15px 0',
    fontSize: '1.1rem',
    color: '#8b7356',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#8b7356',
  },
};

export default ProductDetail;