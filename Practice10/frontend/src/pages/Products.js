import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function Products() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setFormData({ title: '', category: '', description: '', price: '' });
      setEditingProduct(null);
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Загрузка...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Товары</h1>
        <div>
          <span style={styles.userEmail}>{user?.email}</span>
          <button onClick={() => setShowForm(!showForm)} style={styles.button}>
            {showForm ? 'Отмена' : '+ Добавить'}
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h2>{editingProduct ? 'Редактировать' : 'Новый товар'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="title"
              placeholder="Название"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              name="category"
              placeholder="Категория"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <textarea
              name="description"
              placeholder="Описание"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={styles.textarea}
            />
            <input
              name="price"
              type="number"
              placeholder="Цена"
              value={formData.price}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>
              {editingProduct ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} style={styles.productCard}>
            <h3>{product.title}</h3>
            <p style={styles.category}>{product.category}</p>
            <p style={styles.description}>{product.description}</p>
            <p style={styles.price}>{product.price} ₽</p>
            <div style={styles.cardActions}>
              <button
                onClick={() => navigate(`/products/${product.id}`)}
                style={styles.viewButton}
              >
                Просмотр
              </button>
              <button
                onClick={() => handleEdit(product)}
                style={styles.editButton}
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                style={styles.deleteButton}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fdf8f2',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '2px solid #d4b89c',
    borderRadius: '16px',
  },
  userEmail: {
    marginRight: '15px',
    color: '#8b7356',
    fontWeight: '500',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'all 0.2s',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '30px',
    border: '2px solid #d4b89c',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #d4b89c',
    backgroundColor: '#fdf8f2',
    color: '#8b7356',
  },
  textarea: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #d4b89c',
    backgroundColor: '#fdf8f2',
    color: '#8b7356',
    minHeight: '80px',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  productCard: {
    border: '2px solid #d4b89c',
    borderRadius: '16px',
    padding: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(139, 115, 86, 0.1)',
  },
  category: {
    color: '#b7a287',
    fontSize: '0.9rem',
  },
  description: {
    margin: '10px 0',
    color: '#8b7356',
  },
  price: {
    fontWeight: 'bold',
    color: '#8b7356',
  },
  cardActions: {
    display: 'flex',
    gap: '5px',
    marginTop: '10px',
  },
  viewButton: {
    padding: '5px 10px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#ffffff',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#8b7356',
  },
};

export default Products;