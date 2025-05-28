// middleware/auth.js - проміжні функції для авторизації
const jwt = require('jsonwebtoken');

// Перевірка JWT-токена
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Токен не надано' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded; // додаємо дані користувача в запит
    next();
  } catch (err) {
    res.status(401).send({ message: 'Невалідний токен' });
  }
};

// Перевірка ролі адміністратора
function adminAuth(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Доступ заборонено: тільки адміністратор' });
  }
  next();
}
