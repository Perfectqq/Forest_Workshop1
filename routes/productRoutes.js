// routes/productRoutes.js - маршрути товарів
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

// Отримати всі товари (для всіх користувачів)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    console.error('Error in /api/products:', err);
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Додати новий товар (тільки для адміністратора)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, materials, sizes, price, timeToMake, photoUrl } = req.body;
    const newProduct = new Product({ name, materials, sizes, price, timeToMake, photoUrl });
    await newProduct.save();
    res.status(201).send({ message: 'Товар додано' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Оновити товар (тільки для адміністратора)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, materials, sizes, price, timeToMake, photoUrl } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, materials, sizes, price, timeToMake, photoUrl },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).send({ message: 'Товар не знайдено' });
    }
    res.send({ message: 'Товар оновлено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

// Видалити товар (тільки для адміністратора)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ message: 'Товар не знайдено' });
    }
    res.send({ message: 'Товар видалено' });
  } catch (err) {
    res.status(500).send({ message: 'Серверна помилка' });
  }
});

module.exports = router;
