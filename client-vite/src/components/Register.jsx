// src/components/Register.jsx - сторінка реєстрації
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './AuthForms.scss';

function Register() {
  const [name, setName] = useState('');
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
      await axios.post(`${API_BASE_URL}/api/users/register`, { name, email, password });
      alert('Реєстрація успішна! Тепер ви можете увійти.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Невідома помилка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Зареєструватися</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ім'я</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Введіть ваше ім'я"
            />
          </div>
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
            {isLoading ? 'Завантаження...' : 'Зареєструватися'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Вже є акаунт? <Link to="/login">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
