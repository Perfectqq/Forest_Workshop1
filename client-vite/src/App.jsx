// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import AdminProductList from './components/admin/AdminProductList';
import AdminUserPage from './components/admin/AdminUserPage';
import AdminOrdersPage from './components/admin/AdminOrdersPage';
import HomePage from './components/HomePage';
import axios from './config/axios';
import './App.scss';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        try {
          await axios.get('/api/users/verify-token');
          setUserRole(role);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setUserRole(null);
          navigate('/login');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUserRole(null);
    navigate('/login');
  };

  if (isLoading) {
    return <div>Завантаження...</div>;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="logo">Лісова Майстерня</Link>
        </div>
        
        <div className="navbar-links">
          {userRole === 'admin' ? (
            <>
              <NavLink to="/admin/AdminProductList">Товари</NavLink>
              <NavLink to="/admin/AdminUserPage">Користувачі</NavLink>
              <NavLink to="/admin/AdminOrdersPage">Замовлення</NavLink>
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Вихід
              </button>
            </>
          ) : (
            <>
              <NavLink to="/products">Товари</NavLink>
              {userRole ? (
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Вихід
                </button>
              ) : (
                <>
                  <NavLink to="/login">Увійти</NavLink>
                  <NavLink to="/register">Реєстрація</NavLink>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          
          {/* Адмін маршрути */}
          <Route
            path="/admin/AdminProductList"
            element={
              <ProtectedRoute role={userRole}>
                <AdminProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/AdminUserPage"
            element={
              <ProtectedRoute role={userRole}>
                <AdminUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/AdminOrdersPage"
            element={
              <ProtectedRoute role={userRole}>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/AdminProductList" />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 Лісова Майстерня. Всі права захищені.</p>
      </footer>
    </div>
  );
}

const ProtectedRoute = ({ children, role }) => {
  return role === 'admin' ? children : <Navigate to="/login" />;
};

const NavLink = ({ to, children }) => (
  <Link to={to} className="nav-link">
    {children}
  </Link>
);

export default App;