import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Row, Col, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const baseUrl = 'http://localhost:1337';
  const defaultAvatarUrl = '/images/default-avatar.png';
  const { id } = useParams(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/users/${id}?populate=*`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/products?populate=*&filters[statePublication][$eq]=true&filters[users_permissions_user][id][$eq]=${id}`
        );
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchUserData();
    fetchProducts();
  }, [id]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="profile-page">
        <Link to="/">
          <Button type="link" icon={<LeftOutlined />} className="back-button">
            Назад
          </Button>
        </Link>
        <h2 className="profile-title">Профиль пользователя</h2>
        <div className="profile-header">
          <Row gutter={16} align="top">
            <Col>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={100}
                  src={userData.image_profile ? baseUrl + userData.image_profile.url : defaultAvatarUrl}
                />
              </div>
            </Col>
            <Col>
              <div className="profile-info">
                <div className="white-label">Имя пользователя:</div>
                <div>{userData.username}</div>
              </div>
              <div className="profile-info">
                <div className="white-label">Электронная почта:</div>
                <div>{userData.email}</div>
              </div>
            </Col>
            <Col>
              <div className="profile-info">
                <div className="white-label">Город:</div>
                <div>{userData.city}</div>
              </div>
              <div className="profile-info">
                <div className="white-label">Возраст:</div>
                <div>{userData.age}</div>
              </div>
              <div className="profile-info">
                <div className="white-label">О себе:</div>
                <div className="about-user">{userData.about_user}</div>
              </div>
            </Col>
            <Col>
              <div className="profile-info">
                <div className="white-label">Ссылка VK:</div>
                <a href={userData.social_vk} className="social-link">{userData.social_vk}</a>
              </div>
              <div className="profile-info">
                <div className="white-label">Ссылка Telegram:</div>
                <a href={userData.social_tg} className="social-link">{userData.social_tg}</a>
              </div>
              <div className="profile-info">
                <div className="white-label">Ссылка GitHub:</div>
                <a href={userData.social_git} className="social-link">{userData.social_git}</a>
              </div>
            </Col>
          </Row>
        </div>
        <div className="product-section">
          <h3 className="section-title">Опубликованные проекты</h3>
          <div className="products-container">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
