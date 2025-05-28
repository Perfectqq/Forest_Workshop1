const Order = require('../models/Order');
const User = require('../models/User');

// Створення нового замовлення
exports.createOrder = async (req, res) => {
  try {
    const { items, firstName, lastName, phone, city, novaPoshtaNumber } = req.body;
    const email = req.user.email;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Відсутні товари для замовлення" });
    }
    // Створюємо нове замовлення
    const order = new Order({
      user: req.user._id || req.user.id,
      items,
      firstName,
      lastName,
      email,
      phone,
      city,
      novaPoshtaNumber
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Замовлення успішно створено',
      order
    });
  } catch (error) {
    console.error('Помилка при створенні замовлення:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні замовлення'
    });
  }
};

// Отримання всіх замовлень користувача
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Помилка при отриманні замовлень:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні замовлень'
    });
  }
};

// Отримання всіх замовлень (для адміна)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Помилка при отриманні всіх замовлень:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні всіх замовлень'
    });
  }
};

// Оновлення статусу замовлення (для адміна)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateFields = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Замовлення не знайдено'
      });
    }

    // Оновлюємо всі поля, які прийшли в запиті
    Object.keys(updateFields).forEach(key => {
      order[key] = updateFields[key];
    });

    await order.save();

    res.json({
      success: true,
      message: 'Замовлення оновлено',
      order
    });
  } catch (error) {
    console.error('Помилка при оновленні замовлення:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при оновленні замовлення'
    });
  }
};

// Видалення замовлення (тільки для адміна)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Замовлення не знайдено' });
    }
    res.json({ success: true, message: 'Замовлення видалено' });
  } catch (error) {
    console.error('Помилка при видаленні замовлення:', error);
    res.status(500).json({ success: false, message: 'Помилка при видаленні замовлення' });
  }
};
