import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProductsSection.css';
import ProductCard from './ProductCard';

const ProductsSection = () => {
  const [productsData, setProductsData] = useState([]); // Хранение полученных данных
  const [commissionParam, setCommissionParam] = useState(null);

    // Функция для загрузки данных с сервера
  const fetchProductsData = async () => {
    try {
      const response = await axios.get('https://backend.bytebay.ru/api/products?populate=*'); // Выполняем GET-запрос к API
      setProductsData(response?.data?.data); // Обновляем состояние данных
    } catch (error) {
      console.error('Error fetching products data:', error);
    }
  };

  const fetchParams = async () => {
    try {
      const responseParams = await axios.get('https://backend.bytebay.ru/api/platform-params?populate=*');
      const params = responseParams.data.data;
      const commission = params.find(param => param.attributes.signature === 'commission');
      setCommissionParam(commission);
    } catch (error) {
      console.error('Error fetching params:', error);
    }
  };

  useEffect(() => {
    fetchProductsData(); // Загружаем данные при монтировании компонента
    fetchParams();
  }, []);

    // Функция для отображения только 4 товаров с самым большим рейтингом
  const topRatedProducts = productsData
    .filter(product => product.attributes.statePublication === true) // Фильтруем товары по состоянию публикации
    .sort((a, b) => b.attributes.productRate - a.attributes.productRate) // Сортируем товары по рейтингу в убывающем порядке
    .slice(0, 4); // Берем первые 4 товара

  return (
    <div className="products-section">
      <div className="section-header">
        <h2 className="section-title">Товары с наилучшим рейтингом</h2>
        <div className="button-container">
          <Link to="/catalog">
            <Button type="primary" ghost>Перейти в каталог</Button>
          </Link>
        </div>
      </div>
      <div className="products-container">
        {topRatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} commissionParam={commissionParam} />
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;