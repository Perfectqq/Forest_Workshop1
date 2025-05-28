const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Створення нового замовлення (тільки для авторизованих користувачів)
router.post('/', auth, orderController.createOrder);

// Отримання замовлень користувача (тільки для авторизованих користувачів)
router.get('/my-orders', auth, orderController.getUserOrders);

// Отримання всіх замовлень (тільки для адмінів)
router.get('/all', auth, admin, orderController.getAllOrders);

// Оновлення статусу замовлення (тільки для адмінів)
router.patch('/:orderId/status', auth, admin, orderController.updateOrderStatus);

// Оновлення замовлення (PUT, для сумісності з фронтендом)
router.put('/:orderId', auth, admin, orderController.updateOrderStatus);

// Видалення замовлення (тільки для адміна)
router.delete('/:orderId', auth, admin, orderController.deleteOrder);

module.exports = router;
