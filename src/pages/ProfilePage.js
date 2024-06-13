import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, Row, Col, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './ProfilePage.css';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);
  const [avatarPreviewImage, setAvatarPreviewImage] = useState('');
  const baseUrl = 'http://localhost:1337';
  const defaultAvatarUrl = '/images/default-avatar.png';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(
            `http://localhost:1337/api/products?populate=*&filters[statePublication][$eq]=true&filters[users_permissions_user][id][$eq]=${userData.id}`
          );
          setProducts(response.data.data);
        } catch (error) {
          console.error('Error fetching products', error);
        }
      };
      fetchProducts();
    }
  }, [userData]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      await axios.put(
        `${baseUrl}/api/users/${userData.id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const response = await axios.get(
        `${baseUrl}/api/users/${userData.id}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setUserData(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error updating user data', error);
    }
    setLoading(false);
  };

  const handleAvatarChange = ({ file }) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreviewImage(reader.result);
        setAvatarPreviewVisible(true);
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file object', file);
    }
  };

  const handleUploadAvatar = async () => {
    if (avatarFile) {
      const token = localStorage.getItem('jwt');
      const formData = new FormData();
      formData.append('files', avatarFile);
      try {
        // Загрузка изображения
        const uploadResponse = await axios.post(`${baseUrl}/api/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        console.log('Upload response:', uploadResponse);
        
        const newAvatarId = uploadResponse.data[0].id;
        console.log('ID image:', newAvatarId);
  
        // Обновление пользователя с новым ID изображения
        const updateResponse = await axios.put(
          `${baseUrl}/api/users/${userData.id}`,
          {
            image_profile: newAvatarId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('User update response:', updateResponse);
  
        // Обновление состояния пользователя
        const updatedUser = { ...userData, image_profile: { id: newAvatarId, url: uploadResponse.data[0].url } };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
  
        // Закрытие модального окна и уведомление пользователя
        setAvatarPreviewVisible(false);
        message.success('Аватарка успешно обновлена');
      } catch (error) {
        console.error('Error uploading avatar', error);
        message.error('Failed to upload avatar');
      }
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="page-header">
          <h2 className="page-title">Профиль</h2>
        </div>
        <div className="profile-header">
          <Row gutter={16} align="middle">
            <Col>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={100}
                  src={userData.image_profile ? baseUrl + userData.image_profile.url : defaultAvatarUrl}
                />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                >
                  <Button
                    icon={<UploadOutlined />}
                    type='primary'
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      right: '-10px',
                      borderRadius: '50%',
                      padding: '0',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </Upload>
              </div>
            </Col>
            <Col>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={userData}
                    onFinish={handleFinish}
                >
                    <Form.Item name="username" label="Имя пользователя" className="white-label">
                        <Input placeholder="Введите имя пользователя" />
                    </Form.Item>
                </Form>
            </Col>
            <Col>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={userData}
                    onFinish={handleFinish}
                >
                    <Form.Item name="email" label="Электронная почта" className="white-label">
                        <Input placeholder="Введите e-mail" />
                    </Form.Item>
                </Form>
            </Col>
          </Row>
        </div>
        <Modal
          visible={avatarPreviewVisible}
          footer={[
            <Button key="cancel" onClick={() => setAvatarPreviewVisible(false)}>
              Отменить
            </Button>,
            <Button key="upload" type="primary" onClick={handleUploadAvatar}>
              Сохранить
            </Button>,
          ]}
          onCancel={() => setAvatarPreviewVisible(false)}
        >
          <div className="preview-title">Предварительный просмотр изображения</div>
          <img className="preview-image" alt="avatar" style={{ width: '100%', borderRadius: '8px' }} src={avatarPreviewImage} />
        </Modal>
        <Form
          form={form}
          layout="vertical"
          initialValues={userData}
          onFinish={handleFinish}
          className="profile-form"
        >
          <div className="form-section">
            <h3 className="section-title">Личная информация</h3>
            <Form.Item name="city" label="Город" className="white-label">
              <Input placeholder="Введите свой город" />
            </Form.Item>
            <Form.Item name="age" label="Возраст" className="white-label">
              <Input placeholder="Введите свой возраст" />
            </Form.Item>
            <Form.Item name="about_user" label="О себе" className="white-label">
              <Input.TextArea rows={4} placeholder="Расскажите немного о себе" />
            </Form.Item>
          </div>
          <div className="form-section">
            <h3 className="section-title">Социальные сети</h3>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="social_vk" label="Ссылка VK" className="white-label">
                  <Input placeholder="URL" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="social_tg" label="Ссылка Telegram" className="white-label">
                  <Input placeholder="URL" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="social_git" label="Ссылка GitHub" className="white-label">
                  <Input placeholder="URL" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <Form.Item className="update-button">
            <Button type="primary" htmlType="submit" loading={loading} style={{width: '300px'}}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
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

export default ProfilePage;
