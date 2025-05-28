import React from 'react';
import './CartPanel.scss';

const CartPanel = ({ cart, onChangeQuantity, onRemove, onOrder, onClose }) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="cart-panel-modern">
      <button className="cart-panel-close" onClick={onClose} title="Закрити">×</button>
      <h3>Кошик</h3>
      <div className="cart-list">
        {cart.length === 0 ? (
          <div className="cart-empty">Кошик порожній</div>
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.product._id}>
              {item.product.photoUrl && (
                <img src={item.product.photoUrl} alt={item.product.name} className="cart-item-photo" />
              )}
              <div className="cart-item-info">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-price">{item.product.price} грн</div>
                <div className="cart-item-qty">
                  <button onClick={() => onChangeQuantity(item.product._id, -1)} disabled={item.quantity === 1}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onChangeQuantity(item.product._id, 1)}>+</button>
                </div>
                <div className="cart-item-sum">{(item.product.price * item.quantity).toFixed(2)} грн</div>
              </div>
              <button className="cart-item-remove" onClick={() => onRemove(item.product._id)} title="Видалити">🗑</button>
            </div>
          ))
        )}
      </div>
      <div className="cart-total-row">
        <span>Сума:</span>
        <span className="cart-total-sum">{total.toFixed(2)} грн</span>
      </div>
      <button className="cart-order-btn" onClick={onOrder} disabled={cart.length === 0}>
        Оформити замовлення
      </button>
    </div>
  );
};

export default CartPanel; 