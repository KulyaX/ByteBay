import React from 'react';
import './MainScreen.css';

const MainScreen = () => {
  return (
    <div className="main-container">
      <div className="content-container">
        <div className="text-container">
          <h1 className="title">ByteBay: Гавань для IT-специалистов</h1>
          <p className="paragraph">Мы создали эту платформу, чтобы облегчить ваш путь к успеху в мире IT.</p>
        </div>
        <div className="advantages-container">
          <div className="advantage-card">
            <span>Уникальное пространство</span>
          </div>
          <div className="advantage-card">
            <span>Поиск вдохновения</span>
          </div>
          <div className="advantage-card">
            <span>Обмен опытом</span>
          </div>
          <div className="advantage-card">
            <span>Продажа проектов и идей</span>
          </div>
        </div>
      </div>
      <div className="image-container">
        <img src="/images/main-image.png" alt="Main" />
      </div>
    </div>
  );
};

export default MainScreen;
