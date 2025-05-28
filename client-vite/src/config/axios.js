import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Функція для перевірки терміну дії токена
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    return true;
  }
};

// Функція для оновлення токена
const refreshToken = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/refresh-token', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (err) {
    // Якщо не вдалося оновити токен, видаляємо дані користувача
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
    return null;
  }
};

// Додаємо токен до кожного запиту
instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Перевіряємо термін дії токена
      if (isTokenExpired(token)) {
        // Якщо токен закінчився, пробуємо оновити його
        const newToken = await refreshToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обробка помилок відповідей
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Якщо отримали помилку авторизації, пробуємо оновити токен
      const newToken = await refreshToken();
      if (newToken) {
        // Повторюємо запит з новим токеном
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return instance(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 