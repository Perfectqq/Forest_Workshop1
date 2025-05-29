// routes/userRoutes.js - маршрути користувачів
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

// Реєстрація нового користувача (покупець)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Перевірка, чи не зайнята електронна пошта
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Користувач із таким email вже існує' });
    }
    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Створення нового користувача з роллю 'buyer'
    const newUser = new User({ name, email, password: hashedPassword, role: 'buyer' });
    await newUser.save();
    res.status(201).send({ message: 'Реєстрація успішна' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Логін користувача (покупець або адміністратор)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Знаходимо користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Користувача не знайдено' });
    }
    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Неправильний пароль' });
    }
    // Створення JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );
    res.send({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Отримати всіх користувачів (тільки для адміністратора)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // не повертаємо пароль
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Створити нового користувача (тільки для адміністратора)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Перевірка, чи не зайнята електронна пошта
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Користувач із таким email вже існує' });
    }
    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).send({ message: 'Користувача створено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Оновлення користувача (тільки для адміністратора)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    // Оновлення даних користувача (змінюємо тільки ім'я, email, роль)
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send({ message: 'Користувача не знайдено' });
    }
    res.send({ message: 'Користувача оновлено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Видалення користувача (тільки для адміністратора)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).send({ message: 'Користувача не знайдено' });
    }
    res.send({ message: 'Користувача видалено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Оновлення токена
router.post('/refresh-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'Користувача не знайдено' });
    }

    // Створюємо новий токен
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.send({ token });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Перевірка токена
router.get('/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'Користувача не знайдено' });
    }
    res.send({ valid: true, role: user.role });
  } catch (err) {
    res.status(401).send({ message: 'Невалідний токен' });
  }
});

// Оновити роль користувача (тільки для адміністратора)
router.patch('/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send({ message: 'Користувача не знайдено' });
    }
    res.send({ message: 'Роль оновлено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

module.exports = router;
