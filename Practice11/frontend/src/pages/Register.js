import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Регистрация</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="first_name"
          placeholder="Имя"
          value={formData.first_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Фамилия"
          value={formData.last_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Зарегистрироваться
        </button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '2px solid #d4b89c',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(139, 115, 86, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #d4b89c',
    backgroundColor: '#fdf8f2',
    color: '#8b7356',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '12px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  error: {
    color: '#d4b89c',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default Register;