import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import './AdminOrdersPage.scss';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editedOrder, setEditedOrder] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newOrder, setNewOrder] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    novaPoshtaNumber: '',
    items: [{ product: '', quantity: 1 }],
    status: 'Очікує'
  });

  const statusOptions = ['Очікує', 'В процесі', 'Відправлено', 'Доставлено', 'Скасовано'];

  // Завантаження даних
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const usersRes = await axios.get('/api/users');
      const productsRes = await axios.get('/api/products');
      const ordersRes = await axios.get('/api/orders/all');
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Помилка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!showAddModal) return;
    const onEsc = e => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showAddModal]);

  // Фільтрація, сортування та пагінація
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(search) ||
      order.user?.name?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search) ||
      order.contactPhone?.includes(search)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date-asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'total-desc':
        return b.total - a.total;
      case 'total-asc':
        return a.total - b.total;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  // Редагування замовлення
  const handleEditClick = (order) => {
    setEditOrderId(order._id);
    setEditedOrder({
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      city: order.city,
      novaPoshtaNumber: order.novaPoshtaNumber,
      items: order.items.map(item => ({
        product: item.product?._id || '',
        quantity: item.quantity
      })),
      status: order.status
    });
  };

  // Оновлення quantity для item у формі редагування
  const handleEditItemQuantity = (index, value) => {
    setEditedOrder(prev => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, quantity: value } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const handleCancelEdit = () => {
    setEditOrderId(null);
    setEditedOrder({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      const orderItems = editedOrder.items.map(item => {
        const product = products.find(p => p._id === item.product);
        return {
          product: item.product,
          quantity: item.quantity
        };
      });
      const orderData = {
        firstName: editedOrder.firstName,
        lastName: editedOrder.lastName,
        email: editedOrder.email,
        phone: editedOrder.phone,
        city: editedOrder.city,
        novaPoshtaNumber: editedOrder.novaPoshtaNumber,
        items: orderItems,
        status: editedOrder.status
      };
      await axios.put(`/api/orders/${editOrderId}`, orderData);
      await fetchOrders();
      handleCancelEdit();
    } catch (err) {
      setError('Помилка при оновленні замовлення');
      console.error(err);
    }
  };

  // Додавання замовлення
  const handleAddOrder = async () => {
    try {
      const orderItems = newOrder.items.map(item => {
        const product = products.find(p => p._id === item.product);
        return {
          product: item.product,
          quantity: item.quantity
        };
      });

      const orderData = {
        firstName: newOrder.firstName,
        lastName: newOrder.lastName,
        email: newOrder.email,
        phone: newOrder.phone,
        city: newOrder.city,
        novaPoshtaNumber: newOrder.novaPoshtaNumber,
        items: orderItems,
        status: newOrder.status
      };

      await axios.post('/api/orders', orderData);
      await fetchOrders();
      setShowAddModal(false);
      setNewOrder({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        novaPoshtaNumber: '',
        items: [{ product: '', quantity: 1 }],
        status: 'Очікує'
      });
    } catch (err) {
      setError('Помилка при додаванні замовлення');
      console.error(err);
    }
  };

  // Видалення замовлення
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це замовлення?')) return;
    
    try {
      await axios.delete(`/api/orders/${orderId}`);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert('Замовлення успішно видалено');
    } catch (err) {
      setError('Не вдалося видалити замовлення: ' + 
        (err.response?.data?.message || err.message));
      console.error('Помилка видалення:', err);
    }
  };

  // Оновлення статусу
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError('Помилка при оновленні статусу');
      console.error(err);
    }
  };

  // Додавання товару в форму
  const handleAddProductField = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product: '', quantity: 1 }]
    });
  };

  // Видалення товару з форми
  const handleRemoveProductField = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h2>Управління замовленнями</h2>
        <button 
          className="add-order-btn"
          onClick={() => setShowAddModal(true)}
        >
          Додати замовлення
        </button>
      </div>

      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук за номером, клієнтом або статусом..."
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
            <option value="date-desc">Дата (новіші)</option>
            <option value="date-asc">Дата (старіші)</option>
            <option value="total-desc">Сума (більша)</option>
            <option value="total-asc">Сума (менша)</option>
            <option value="status">Статус</option>
          </select>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Номер</th>
              <th>Клієнт</th>
              <th>Дата</th>
              <th>Товари</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={order._id}>
                <td>{indexOfFirstOrder + index + 1}</td>
                <td className="order-number">{order._id}</td>
                <td>
                  {editOrderId === order._id ? (
                    <>
                      <div className="edit-fields">
                        <div className="form-group">
                          <input
                            type="text"
                            name="firstName"
                            value={editedOrder.firstName}
                            onChange={handleEditChange}
                            placeholder="Ім'я"
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={editedOrder.lastName}
                            onChange={handleEditChange}
                            placeholder="Прізвище"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="email"
                            name="email"
                            value={editedOrder.email}
                            onChange={handleEditChange}
                            placeholder="Email"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            name="phone"
                            value={editedOrder.phone}
                            onChange={handleEditChange}
                            placeholder="Телефон"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            name="city"
                            value={editedOrder.city}
                            onChange={handleEditChange}
                            placeholder="Місто"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            name="novaPoshtaNumber"
                            value={editedOrder.novaPoshtaNumber}
                            onChange={handleEditChange}
                            placeholder="Номер відділення НП"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="user-info">
                        <div className="name">{order.firstName} {order.lastName}</div>
                        <div className="email">{order.email}</div>
                      </div>
                      <div className="contact">
                        <div>Телефон: {order.phone}</div>
                        <div>Місто: {order.city}</div>
                        <div>НП: {order.novaPoshtaNumber}</div>
                      </div>
                    </>
                  )}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</td>
                <td>
                  {editOrderId === order._id ? (
                    editedOrder.items.map((item, index) => (
                      <div key={index} className="product-row">
                        <select
                          value={item.product}
                          onChange={(e) => {
                            const updatedItems = [...editedOrder.items];
                            updatedItems[index].product = e.target.value;
                            setEditedOrder({...editedOrder, items: updatedItems});
                          }}
                        >
                          <option value="">Виберіть товар</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} ({product.price} грн)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...editedOrder.items];
                            updatedItems[index].quantity = parseInt(e.target.value) || 1;
                            setEditedOrder({...editedOrder, items: updatedItems});
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    order.items.map(item => (
                      <div key={item._id} className="order-item">
                        <div className="product-name">{item.product ? item.product.name : <span style={{color:'red'}}>Товар видалено</span>}</div>
                        <div className="product-quantity">× {item.quantity}</div>
                        <div className="product-price">
                          {(item.product?.price || 0)} грн
                          <span className="item-total">
                            ({((item.product?.price || 0) * item.quantity).toFixed(2)} грн)
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </td>
                <td>
                  {(() => {
                    const total = order.items.reduce((sum, item) => {
                      const price = item.product?.price || 0;
                      const quantity = item.quantity || 0;
                      return sum + (price * quantity);
                    }, 0);
                    return `${total.toFixed(2)} грн`;
                  })()}
                </td>
                <td>
                  {editOrderId === order._id ? (
                    <select
                      name="status"
                      value={editedOrder.status}
                      onChange={handleEditChange}
                      className="status-select"
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="status-select"
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="actions">
                  {editOrderId === order._id ? (
                    <>
                      <button 
                        className="save-btn"
                        onClick={handleUpdate}
                      >
                        Зберегти
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        Скасувати
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(order)}
                      >
                        Редагувати
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        Видалити
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length > ordersPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span>Сторінка {currentPage} з {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowAddModal(false); }}>
          <div className="modal">
            <h3>Додати нове замовлення</h3>
            
            <div className="form-group">
              <label>Ім'я:</label>
              <input
                type="text"
                value={newOrder.firstName}
                onChange={(e) => setNewOrder({...newOrder, firstName: e.target.value})}
                placeholder="Введіть ім'я"
              />
            </div>

            <div className="form-group">
              <label>Прізвище:</label>
              <input
                type="text"
                value={newOrder.lastName}
                onChange={(e) => setNewOrder({...newOrder, lastName: e.target.value})}
                placeholder="Введіть прізвище"
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newOrder.email}
                onChange={(e) => setNewOrder({...newOrder, email: e.target.value})}
                placeholder="Введіть email"
              />
            </div>

            <div className="form-group">
              <label>Телефон:</label>
              <input
                type="text"
                value={newOrder.phone}
                onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                placeholder="+380XXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Місто:</label>
              <input
                type="text"
                value={newOrder.city}
                onChange={(e) => setNewOrder({...newOrder, city: e.target.value})}
                placeholder="Введіть місто"
              />
            </div>

            <div className="form-group">
              <label>Номер відділення Нової Пошти:</label>
              <input
                type="text"
                value={newOrder.novaPoshtaNumber}
                onChange={(e) => setNewOrder({...newOrder, novaPoshtaNumber: e.target.value})}
                placeholder="Введіть номер відділення"
              />
            </div>

            <div className="form-group">
              <label>Товари:</label>
              {newOrder.items.map((item, index) => (
                <div key={index} className="product-row">
                  <select
                    value={item.product}
                    onChange={(e) => {
                      const updatedItems = [...newOrder.items];
                      updatedItems[index].product = e.target.value;
                      setNewOrder({...newOrder, items: updatedItems});
                    }}
                  >
                    <option value="">Виберіть товар</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.price} грн)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updatedItems = [...newOrder.items];
                      updatedItems[index].quantity = parseInt(e.target.value) || 1;
                      setNewOrder({...newOrder, items: updatedItems});
                    }}
                  />
                  <button 
                    onClick={() => handleRemoveProductField(index)}
                    disabled={newOrder.items.length <= 1}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddProductField}
                className="add-product-btn"
              >
                Додати товар
              </button>
            </div>

            <div className="form-group">
              <label>Статус:</label>
              <select
                value={newOrder.status}
                onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowAddModal(false)}
                className="cancel-btn"
              >
                Скасувати
              </button>
              <button 
                onClick={handleAddOrder}
                className="save-btn"
                disabled={!newOrder.firstName || !newOrder.lastName || !newOrder.email || 
                         !newOrder.phone || !newOrder.city || !newOrder.novaPoshtaNumber || 
                         newOrder.items.some(item => !item.product)}
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;