import React, { useEffect, useState } from 'react';
import api from '../../api/config';
import './AdminUserPage.scss';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const roleOptions = ['customer', 'admin'];

  // Завантаження даних
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Помилка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Фільтрація, сортування та пагінація
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'email-asc':
        return a.email.localeCompare(b.email);
      case 'email-desc':
        return b.email.localeCompare(a.email);
      case 'role':
        return a.role.localeCompare(b.role);
      default:
        return 0;
    }
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Редагування користувача
  const handleEditClick = (user) => {
    setEditUserId(user._id);
    setEditedUser({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditedUser({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/users/${editUserId}`, editedUser);
      const updatedUsers = users.map(user => 
        user._id === editUserId ? { ...user, ...editedUser } : user
      );
      setUsers(updatedUsers);
      handleCancelEdit();
    } catch (err) {
      setError('Помилка при оновленні користувача');
      console.error(err);
    }
  };

  // Додавання користувача
  const handleAddUser = async () => {
    try {
      const res = await api.post('/users', newUser);
      setUsers([...users, res.data]);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'customer'
      });
    } catch (err) {
      setError('Помилка при додаванні користувача');
      console.error(err);
    }
  };

  // Видалення користувача
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього користувача?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      alert('Користувача успішно видалено');
    } catch (err) {
      setError('Не вдалося видалити користувача: ' + 
        (err.response?.data?.message || err.message));
      console.error('Помилка видалення:', err);
    }
  };

  // Оновлення ролі
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Помилка при оновленні ролі');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!showAddModal) return;
    const onEsc = e => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showAddModal]);

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-users">
      <div className="admin-header">
        <h2>Управління користувачами</h2>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddModal(true)}
        >
          Додати користувача
        </button>
      </div>

      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук за ім'ям або email"
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
            <option value="name-asc">Ім'я (А-Я)</option>
            <option value="name-desc">Ім'я (Я-А)</option>
            <option value="email-asc">Email (А-Я)</option>
            <option value="email-desc">Email (Я-А)</option>
            <option value="role">Роль</option>
          </select>
        </div>
      </div>

      <div className="users-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Ім'я</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{indexOfFirstUser + index + 1}</td>
                <td>
                  {editUserId === user._id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editUserId === user._id ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleEditChange}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editUserId === user._id ? (
                    <select
                      name="role"
                      value={editedUser.role}
                      onChange={handleEditChange}
                      className="role-select"
                    >
                      {roleOptions.map(option => (
                        <option key={option} value={option}>
                          {option === 'admin' ? 'Адміністратор' : 'Користувач'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                      className="role-select"
                    >
                      {roleOptions.map(option => (
                        <option key={option} value={option}>
                          {option === 'admin' ? 'Адміністратор' : 'Користувач'}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="actions">
                  {editUserId === user._id ? (
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
                        onClick={() => handleEditClick(user)}
                      >
                        Редагувати
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user._id)}
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

      {filteredUsers.length > usersPerPage && (
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
            <h3>Додати нового користувача</h3>
            
            <div className="form-group">
              <label>Ім'я:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Введіть ім'я"
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Введіть email"
              />
            </div>

            <div className="form-group">
              <label>Пароль:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Введіть пароль"
              />
            </div>

            <div className="form-group">
              <label>Роль:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                {roleOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'admin' ? 'Адміністратор' : 'Користувач'}
                  </option>
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
                onClick={handleAddUser}
                className="save-btn"
                disabled={!newUser.name || !newUser.email || !newUser.password}
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

export default AdminUserPage;