import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import './AdminProductList.scss';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    materials: '',
    sizes: '',
    timeToMake: '',
    photoUrl: ''
  });

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Помилка при завантаженні товарів:', error);
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
  const filteredProducts = products.filter(product => {
    const name = product?.name?.toString()?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aName = a?.name?.toString() || "";
    const bName = b?.name?.toString() || "";
    const aPrice = Number(a?.price) || 0;
    const bPrice = Number(b?.price) || 0;

    switch (sortOption) {
      case 'name-asc':
        return aName.localeCompare(bName);
      case 'name-desc':
        return bName.localeCompare(aName);
      case 'price-asc':
        return aPrice - bPrice;
      case 'price-desc':
        return bPrice - aPrice;
      default:
        return 0;
    }
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handleEditClick = (product) => {
    setEditProductId(product._id);
    setEditedProduct({
      name: product.name || "",
      price: product.price || 0,
      materials: product.materials || "",
      sizes: product.sizes || "",
      timeToMake: product.timeToMake || "",
      photoUrl: product.photoUrl || ""
    });
  };

  const handleCancelEdit = () => {
    setEditProductId(null);
    setEditedProduct({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/api/products/${editProductId}`, editedProduct);
      await fetchProducts();
      handleCancelEdit();
    } catch (error) {
      console.error('Помилка при оновленні товару:', error);
      setError('Не вдалося оновити товар');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      await fetchProducts();
      if (currentProducts.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      console.error('Помилка при видаленні товару:', error);
      setError('Не вдалося видалити товар');
    }
  };

  if (loading) {
    return <div className="loading">Завантаження даних...</div>;
  }

  if (error && products.length === 0) {
    return <div className="error">{error}</div>;
  }

  const handleAddProduct = async () => {
    try {
      await api.post('/api/products', newProduct);
      await fetchProducts();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: 0,
        materials: '',
        sizes: '',
        timeToMake: '',
        photoUrl: ''
      });
    } catch (error) {
      console.error('Помилка при додаванні товару:', error);
      setError('Не вдалося додати товар');
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  // Додаємо функцію для перевірки валідності форми
  const isFormValid = () => {
    return (
      newProduct.name.trim() !== '' &&
      newProduct.price > 0 &&
      newProduct.materials.trim() !== '' &&
      newProduct.sizes.trim() !== '' &&
      newProduct.timeToMake.trim() !== ''
    );
  };
  return (
    <div className="admin-products">
      <div className="admin-header">
        <h2>Список товарів</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddModal(true)}
        >
          Додати товар
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук товарів...(назва)"
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

      <div className="products-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Фото</th>
              <th>Назва</th>
              <th>Ціна</th>
              <th>Матеріали</th>
              <th>Розміри</th>
              <th>Час виготовлення</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product, index) => (
              <tr key={product._id}>
                <td>{indexOfFirstProduct + index + 1}</td>
                <td>
                  {product.photoUrl ? (
                    <img 
                      src={product.photoUrl} 
                      alt={product.name} 
                      className="product-photo"
                    />
                  ) : (
                    <div className="no-photo">Немає фото</div>
                  )}
                </td>
                <td>
                  {editProductId === product._id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedProduct.name}
                      onChange={handleChange}
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td>
                  {editProductId === product._id ? (
                    <input
                      type="number"
                      name="price"
                      value={editedProduct.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    `${product.price} грн`
                  )}
                </td>
                <td>
                  {editProductId === product._id ? (
                    <input
                      type="text"
                      name="materials"
                      value={editedProduct.materials}
                      onChange={handleChange}
                    />
                  ) : (
                    product.materials
                  )}
                </td>
                <td>
                  {editProductId === product._id ? (
                    <input
                      type="text"
                      name="sizes"
                      value={editedProduct.sizes}
                      onChange={handleChange}
                    />
                  ) : (
                    product.sizes
                  )}
                </td>
                <td>
                  {editProductId === product._id ? (
                    <input
                      type="text"
                      name="timeToMake"
                      value={editedProduct.timeToMake}
                      onChange={handleChange}
                    />
                  ) : (
                    product.timeToMake
                  )}
                </td>
                <td className="actions">
                  {editProductId === product._id ? (
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
                        onClick={() => handleEditClick(product)}
                      >
                        Редагувати
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
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

      {filteredProducts.length > productsPerPage && (
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
            <h3>Додати новий товар</h3>
            
            <div className="form-group">
              <label>Назва:</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                placeholder="Введіть назву товару"
                required
              />
            </div>

            <div className="form-group">
              <label>Ціна:</label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleNewProductChange}
                placeholder="Введіть ціну"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Матеріали:</label>
              <input
                type="text"
                name="materials"
                value={newProduct.materials}
                onChange={handleNewProductChange}
                placeholder="Введіть матеріали"
                required
              />
            </div>

            <div className="form-group">
              <label>Розміри:</label>
              <input
                type="text"
                name="sizes"
                value={newProduct.sizes}
                onChange={handleNewProductChange}
                placeholder="Введіть розміри"
                required
              />
            </div>

            <div className="form-group">
              <label>Час виготовлення:</label>
              <input
                type="text"
                name="timeToMake"
                value={newProduct.timeToMake}
                onChange={handleNewProductChange}
                placeholder="Введіть час виготовлення"
                required
              />
            </div>

            <div className="form-group">
              <label>URL фото:</label>
              <input
                type="text"
                name="photoUrl"
                value={newProduct.photoUrl}
                onChange={handleNewProductChange}
                placeholder="Введіть URL фото"
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowAddModal(false)}
                className="cancel-btn"
              >
                Скасувати
              </button>
              <button 
                onClick={handleAddProduct}
                className="save-btn"
                disabled={!isFormValid()}
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

export default AdminProductList;