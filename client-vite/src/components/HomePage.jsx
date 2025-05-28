import React from 'react';
import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="overlay">
          <h1>Лісова Майстерня</h1>
          <p>Ручна робота з душею. Вироби з дерева для вашого затишку.</p>
          <a href="/products" className="cta-button">Переглянути товари</a>
        </div>
      </section>

      <section className="features">
        <h2>Наші переваги</h2>
        <div className="grid">
          <div className="card">
            <img 
              src="https://i.pinimg.com/736x/54/5f/24/545f240f42452f5357e185977293c216.jpg"
              alt="Унікальний дизайн"
            />
            <h3>Унікальний дизайн</h3>
            <p>Кожен виріб створено вручну з урахуванням деталей та натуральних текстур дерева.</p>
          </div>
          <div className="card">
            <img 
              src="https://i.pinimg.com/736x/55/2c/a2/552ca2c97184f2f85a94682a99e45b48.jpg"
              alt="Натуральні матеріали"
            />
            <h3>Натуральні матеріали</h3>
            <p>Ми використовуємо лише екологічно чисту деревину з карпатських лісів.</p>
          </div>
          <div className="card">
            <img 
              src="https://i.pinimg.com/736x/aa/95/81/aa9581c8399516ba3e920b67ee0eec07.jpg"
              alt="Ручне різьблення"
            />
            <h3>Ручне різьблення</h3>
            <p>Кожен виріб створено вручну з увагою до деталей, що надає йому унікальності та тепла.</p>
          </div>
        </div>
      </section>

      <section className="gallery">
        <h2>Наші роботи</h2>
        <div className="images">
          <img 
            src="https://i.pinimg.com/736x/da/7d/59/da7d59ff4f26f899d8ccc96959cdf35f.jpg" 
            alt="Виріб 1" 
          />
          <img 
            src="https://i.pinimg.com/736x/4c/a3/c9/4ca3c9434a2e53e79064c7c4f6b915e3.jpg" 
            alt="Виріб 2" 
          />
          <img 
            src="https://i.pinimg.com/736x/3a/5e/fc/3a5efc467f96ac7be6f750f6a03d9351.jpg" 
            alt="Виріб 3" 
          />
        </div>
      </section>

      <section className="contact">
        <h2>Контакти</h2>
        <p>Зв'яжіться з нами через Instagram, Telegram або напишіть на email:</p>
        <ul>
          <li>📧 info@lisovamaysternya.com</li>
          <li>✈️ @lisova_masternya</li>
          <li>📱 +380 67 123 4567</li>
          <li>📍 Україна, м. Тернопіль</li>
          <li>Графік роботи: 09:00 - 18:00</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
