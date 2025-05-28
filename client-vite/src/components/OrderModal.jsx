import React, { useState } from 'react';
import api from '../api/config';
import './OrderModal.scss';

function OrderModal({ isOpen, onClose, cart }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    novaPoshtaNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Завжди залишаємо +380 на початку
      let digits = value.replace(/\D/g, ''); // тільки цифри
      if (digits.startsWith('380')) {
        digits = digits.slice(3); // залишаємо тільки те, що після 380
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1); // якщо ввели з 0, наприклад 097..., прибираємо 0
      }
      digits = digits.slice(0, 10); // максимум 10 цифр
      setFormData(prev => ({
        ...prev,
        phone: '+380' + digits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const items = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      await api.post('/api/orders', {
        items,
        ...formData
      });
      alert('Замовлення успішно оформлено!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка при оформленні замовлення');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Оформлення замовлення</h2>
        <div className="cart-list">
          <h4>Ваше замовлення:</h4>
          <ul>
            {cart.map(item => (
              <li key={item.product._id}>
                {item.product.name} — {item.quantity} шт. <span style={{color:'#a8e632'}}>{item.product.price * item.quantity} грн</span>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <strong>Сума: </strong>
            {cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} грн
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ім'я</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Введіть ваше ім'я"
            />
          </div>

          <div className="form-group">
            <label>Прізвище</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Введіть ваше прізвище"
            />
          </div>

          <div className="form-group">
            <label>Номер телефону</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone.startsWith('+380') ? formData.phone : '+380'}
              onChange={handleChange}
              required
              maxLength={13} // +380 і 10 цифр
              placeholder="+380XXXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label>Місто/Село</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Введіть ваше місто або село"
            />
          </div>

          <div className="form-group">
            <label>Номер відділення Нової Пошти</label>
            <input
              type="text"
              name="novaPoshtaNumber"
              value={formData.novaPoshtaNumber}
              onChange={handleChange}
              required
              placeholder="Введіть номер відділення"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Обробка...' : 'Підтвердити замовлення'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderModal; 