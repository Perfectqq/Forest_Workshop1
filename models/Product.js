// models/Product.js - схема товару
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },     // Назва товару
  materials: String,                         // Матеріали
  sizes: String,                             // Розміри
  price: Number,                             // Ціна
  timeToMake: String,                        // Час виготовлення
  photoUrl: String,                           // Фото (URL або шлях)
});

module.exports = mongoose.model('Product', productSchema);
