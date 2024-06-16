import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LeftOutlined, RightOutlined, UserOutlined, CalendarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Rate, Carousel, message } from 'antd';
import axios from 'axios';
import './ProductPage.css';
import PurchaseModal from './PurchaseModal';

const ProductPage = () => {
  const { id } = useParams(); // Получаем параметр id из URL
  const [product, setProduct] = useState(null); // Состояние для хранения данных товара
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [licenseType, setLicenseType] = useState('');
  const [userId, setUserId] = useState(null);
  const [commissionParam, setCommissionParam] = useState(null);

  useEffect(() => {
    // Функция для загрузки данных товара с сервера
    const fetchProduct = async () => {
      try {
        const responseProduct = await axios.get(`https://backend.bytebay.ru/api/products/${id}?populate=*`);
        setProduct(responseProduct.data); // Обновляем состояние данных товара

        const responseReviews = await axios.get(`https://backend.bytebay.ru/api/reviews?populate=*&filters[product][id]=${id}`);
        setReviews(responseReviews.data.data);

        const responseParams = await axios.get('https://backend.bytebay.ru/api/platform-params?populate=*');
        const params = responseParams.data.data;
        const commission = params.find(param => param.attributes.signature === 'commission');
        setCommissionParam(commission);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct(); // Вызываем функцию загрузки данных при монтировании компонента
  }, [id]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
    }
  }, []);

  const handleBuyClick = (license) => {
    const isUserLoggedIn = localStorage.getItem('user') && localStorage.getItem('jwt');
    if (isUserLoggedIn) {
      setLicenseType(license);
      setModalVisible(true);
    } else {
      message.info('Пожалуйста, авторизуйтесь для совершения покупки');
    }
  };

  // Если данные товара еще не загружены, показываем заглушку или индикатор загрузки
  if (!product) {
    return <div>Loading...</div>;
  }

  // Преобразование массива объектов параграфов в строку
  const content = product.data.attributes.productDescription.map(paragraph => paragraph.children.map(child => child.text).join(' ')).join('\n\n');

  const baseUrl = 'https://backend.bytebay.ru';

  return (
    <div className='page-container'>
      <div className="product-page">
        <Link to="/catalog">
          <Button type="link" icon={<LeftOutlined />} className="back-button">
            Назад
          </Button>
        </Link>
        <h2 className="product-title">{product.data.attributes.productTitle}</h2>
        <div className="product-metadata">
          <Link to={`/profile/${product.data.attributes.users_permissions_user.data.id}`}>
            <Button type="link" icon={<UserOutlined />} className="metadata-item">
              {product.data.attributes.users_permissions_user.data.attributes.username}
            </Button>
          </Link>
          <span className="metadata-item">
            <CalendarOutlined /> {product.data.attributes.datePublication}
          </span>
          <span className="metadata-item">
            <div className="products-card-sales">{product.data.attributes.quantitySales} продаж</div>
          </span>
          <span className="metadata-item">
            <Rate value={product.data.attributes.productRate} disabled className="rating"/>
          </span>
        </div>
        <div className="product-info-container">
          <Carousel className="product-carousel" arrows infinite={false} prevArrow={<LeftOutlined />} nextArrow={<RightOutlined />}>
            {product.data.attributes.productImage.data.map(image => (
              <div key={image.id}>
                <img src={baseUrl + image.attributes.url} alt="Product" className="product-img" />
              </div>
            ))}
          </Carousel>
          <div className="license-block">
              <div className="license-block-item">
                <h2 className="license-title">Общая лицензия</h2>
                <p className="license-description">
                    Использование вами или одним клиентом в одном конечном продукте, за который конечные пользователи <b>не взимают плату</b>. Общая стоимость включает в себя стоимость товара и комиссию покупателя.
                </p>
                <div className="buy-button">
                    <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handleBuyClick('basic')}>Купить</Button>
                    <span className="price">{(product.data.attributes.basicPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</span>
                </div>
              </div>
              <div className="license-block-item">
                <h2 className="license-title">Расширенная лицензия</h2>
                <p className="license-description">
                    Использование вами или одним клиентом в одном конечном продукте, за который конечные пользователи <b>могут взимать плату</b>. Общая стоимость включает в себя стоимость товара и комиссию покупателя.
                </p>
                <div className="buy-button">
                    <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handleBuyClick('advanced')}>Купить</Button>
                    <span className="price">{(product.data.attributes.advancedPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</span>
                </div>
              </div>
          </div>
        </div>
        <div className="additional-info">
            <h2 className="block-title">О товаре</h2>
            <div className="subblock">
                <div className="subblock-item">
                    <h3>Выгрузка</h3>
                    <p>{product.data.attributes.method_upload.data.attributes.method}</p>
                </div>
                <div className="subblock-item">
                    <h3>Готовность</h3>
                    <p>{product.data.attributes.degree_completion.data.attributes.degree}</p>
                </div>
            </div>
            <div className="subblock">
                <div className="subblock-item">
                    <h3>Описание</h3>
                    <p>{content}</p>
                </div>
            </div>
        </div>
        <div className="reviews-container">
          <h2 className="block-title">Отзывы</h2>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map(review => {
              const user = review.attributes.users_permissions_user?.data;
              return (
                <div key={review.id} className="reviews">
                  {user ? (
                    <Link to={`/profile/${user.id}`}>
                      <Button type="link" icon={<UserOutlined />} className="user-message">
                        {user.attributes.username}
                      </Button>
                    </Link>
                  ) : (
                    <div className="user-message">Анонимный пользователь</div>
                  )}
                  <div className="message">{review.attributes.text_review}</div>
                  <div className="date-message">{new Date(review.attributes.created_date).toLocaleString()}</div>
                </div>
              );
            })
          ) : (
            <div className="reviews">Отзывов пока нет.</div>
          )}
        </div>
      </div>
      <PurchaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={product}
        licenseType={licenseType}
        userId={userId}
      />
    </div>
  );
};

export default ProductPage;
