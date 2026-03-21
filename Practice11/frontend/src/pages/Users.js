import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function Users() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    password: '',
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/products');
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users', error);
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

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      password: '',
    });
    setShowCreateForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      password: '',
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        await api.createUser(formData);
      }
      setEditingUser(null);
      setShowCreateForm(false);
      setFormData({ email: '', first_name: '', last_name: '', role: 'user', password: '' });
      loadUsers();
    } catch (error) {
      console.error('Failed to save user', error);
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Заблокировать пользователя?')) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
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
        <h1>Управление пользователями</h1>
        <div>
          <span style={styles.userEmail}>{user?.email} ({user?.role})</span>
          <button onClick={() => navigate('/products')} style={styles.button}>
            Товары
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>

      {/* Кнопка создания нового пользователя */}
      <div style={styles.toolbar}>
        <button onClick={handleCreate} style={styles.createButton}>
          + Создать пользователя
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div style={styles.formContainer}>
          <h2>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              name="first_name"
              placeholder="Имя"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              name="last_name"
              placeholder="Фамилия"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="user">Пользователь</option>
              <option value="seller">Продавец</option>
            </select>
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
              style={styles.input}
            />
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingUser ? 'Сохранить' : 'Создать'}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} style={styles.cancelButton}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список пользователей */}
      <div style={styles.usersGrid}>
        {users.map((u) => (
          <div key={u.id} style={styles.userCard}>
            <div style={styles.userInfo}>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Имя:</strong> {u.first_name} {u.last_name}</p>
              <p><strong>Роль:</strong> 
                <span style={getRoleStyle(u.role)}>{u.role}</span>
              </p>
            </div>
            <div style={styles.cardActions}>
              <button
                onClick={() => handleEdit(u)}
                style={styles.editButton}
              >
                Редактировать
              </button>
              {u.id !== user?.id && (
                <button
                  onClick={() => handleDelete(u.id)}
                  style={styles.deleteButton}
                >
                  Блокировать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const getRoleStyle = (role) => {
  switch (role) {
    case 'admin':
      return { color: '#d4b89c', fontWeight: 'bold' };
    case 'seller':
      return { color: '#8b7356', fontWeight: 'bold' };
    default:
      return { color: '#b7a287' };
  }
};

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
    marginBottom: '20px',
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
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  toolbar: {
    marginBottom: '20px',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
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
  select: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #d4b89c',
    backgroundColor: '#fdf8f2',
    color: '#8b7356',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#f5e6d3',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    flex: 1,
  },
  cancelButton: {
    padding: '10px',
    backgroundColor: '#ffffff',
    color: '#8b7356',
    border: '1px solid #d4b89c',
    borderRadius: '12px',
    cursor: 'pointer',
    flex: 1,
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  userCard: {
    border: '2px solid #d4b89c',
    borderRadius: '16px',
    padding: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(139, 115, 86, 0.1)',
  },
  userInfo: {
    marginBottom: '15px',
  },
  cardActions: {
    display: 'flex',
    gap: '5px',
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

export default Users;