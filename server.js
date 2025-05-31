// server.js - Основний файл сервера
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Перевірка наявності необхідних змінних середовища
if (!process.env.MONGODB_URI) {
  console.error('❌ Помилка: MONGODB_URI не знайдено в змінних середовища');
  process.exit(1);
}

const app = express();
app.use(express.json());

// CORS налаштування для продакшену
app.use(cors({
  origin: '*', // Дозволяємо всі домени
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
console.log('CORS middleware applied with wildcard origin');

// Підключення до MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

console.log('📡 Спроба підключення до MongoDB Atlas...');
console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Успішно підключено до MongoDB Atlas');
  console.log(`📊 База даних: ${mongoose.connection.name}`);
  console.log(`🌐 Хост: ${mongoose.connection.host}`);
})
.catch(err => {
  console.error('❌ Помилка підключення до MongoDB:', err);
  process.exit(1);
});

// Додаткові слухачі подій підключення
mongoose.connection.on('error', err => {
  console.error('🔴 Помилка з\'єднання MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Відключено від MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Повторне підключення до MongoDB');
});

// API маршрути
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Редирект на фронтенд
app.get('/', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5000');
});

// Обслуговування статичних файлів
app.use(express.static(path.join(__dirname, 'client-vite/dist')));

// Віддача SPA для всіх інших маршрутів
app.get('*', (req, res) => {
  console.log('Catch-all route triggered for:', req.originalUrl);
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'client-vite/dist/index.html'));
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Щось пішло не так!' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
