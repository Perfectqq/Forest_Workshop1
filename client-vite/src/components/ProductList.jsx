// src/components/ProductList.jsx - список товарів для покупця
import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const navigate = useNavigate();

  // Завантаження товарів при монтуванні компонента
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
    }
  };

  // Фільтрація товарів
  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.materials.toLowerCase().includes(search) ||
      product.sizes.toLowerCase().includes(search)
    );
  });

  // Сортування товарів
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Пагінація
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

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

      {/* Елементи управління */}
      <div className="products-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук за назвою, матеріалами або розмірами..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="sort-options">
          <label>Сортувати за:</label>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name-asc">Назва (А-Я)</option>
            <option value="name-desc">Назва (Я-А)</option>
            <option value="price-asc">Ціна (зростаюча)</option>
            <option value="price-desc">Ціна (спадаюча)</option>
          </select>
        </div>
      </div>

      {/* Кнопка кошика */}
      <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
        <FaShoppingCart size={22} />
        {cart.length > 0 && <span className="cart-fab-count">{cart.length}</span>}
      </button>

      <div className="products-grid">
        {currentProducts.map((product) => (
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

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Попередня
          </button>
          <span className="page-info">
            Сторінка {currentPage} з {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Наступна
          </button>
        </div>
      )}

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
