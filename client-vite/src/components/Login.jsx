// src/components/Login.jsx - сторінка входу
import React, { useState } from 'react';
import api from '../api/config';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForms.scss';

function Login({ setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Обробка відправки форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/users/login', { email, password });
      const { token, role } = response.data;
      // Зберігаємо токен і роль користувача
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setUserRole(role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Невідома помилка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Увійти</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Електронна пошта</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введіть вашу електронну пошту"
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введіть ваш пароль"
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Ще немає акаунту? <Link to="/register">Зареєструватися</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;