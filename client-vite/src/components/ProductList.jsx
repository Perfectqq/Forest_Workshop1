// src/components/ProductList.jsx - список товарів для покупця
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import OrderModal from './OrderModal';
import CartPanel from './CartPanel';
import { FaShoppingCart } from 'react-icons/fa';
import './ProductList.scss';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]); // масив товарів у кошику
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  // Завантаження товарів при монтуванні компонента
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
    }
  };

  // Додає товар у кошик або збільшує кількість
  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Спочатку увійдіть в систему');
      navigate('/login');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  // Змінює кількість товару у кошику
  const handleChangeQuantity = (productId, delta) => {
    setCart(prev => prev.map(item =>
      item.product._id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  // Видаляє товар з кошика
  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  // Відкриває модальне вікно оформлення замовлення
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('Кошик порожній');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCart([]); // очищаємо кошик після замовлення
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Наші товари</h2>
        <p>Виберіть унікальний виріб ручної роботи для вашого дому</p>
      </div>

      {/* Кнопка кошика */}
      <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
        <FaShoppingCart size={22} />
        {cart.length > 0 && <span className="cart-fab-count">{cart.length}</span>}
      </button>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            {product.photoUrl && (
              <img 
                src={product.photoUrl} 
                alt={product.name} 
                className="product-image"
              />
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <div className="product-details">
                <p><strong>Матеріали:</strong> {product.materials}</p>
                <p><strong>Розміри:</strong> {product.sizes}</p>
                <p><strong>Час виготовлення:</strong> {product.timeToMake}</p>
              </div>
              <div className="product-price">{product.price} грн</div>
              <button 
                className="buy-button"
                onClick={() => handleAddToCart(product)}
              >
                Додати в кошик
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Сучасний кошик (drawer) */}
      {isCartOpen && (
        <CartPanel
          cart={cart}
          onChangeQuantity={handleChangeQuantity}
          onRemove={handleRemoveFromCart}
          onOrder={handleOrder}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      {/* Модальне вікно оформлення замовлення */}
      {isModalOpen && (
        <OrderModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cart={cart}
        />
      )}
    </div>
  );
}

export default ProductList;
