import React, { useState, useEffect } from 'react';
import { Menu, Avatar, Dropdown, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, BuildOutlined, MessageOutlined, CoffeeOutlined, UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import Logo from './Logo';
import AuthModal from '../pages/AuthModal';
import './Header.css';

const HeaderMenu = () => {
  const [userData, setUserData] = useState(null); // Состояние для хранения данных пользователя
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка наличия данных пользователя в localStorage при загрузке страницы
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Очистка данных пользователя из localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    setUserData(null);
    navigate('/');
  };

  const userMenu = (
    <Menu style={{ backgroundColor: '#001529' }}>
      <Menu.Item key="profile" style={{ color: 'white' }}>
        <Link to="/profile">
          <UserOutlined style={{ color: 'white' }} />
          <span style={{ marginLeft: '8px', color: 'white' }}>Профиль</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} style={{ color: 'red' }}>
        <LogoutOutlined style={{ color: 'red' }} />
        <span style={{ marginLeft: '8px', color: 'red' }}>Выйти</span>
      </Menu.Item>
    </Menu>
  );
  

  const baseUrl = 'http://185.250.46.218:1337';
  const defaultAvatarUrl = '/images/default-avatar.png';

  return (
    <div className="menu-container">
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']} className="menu">
        <Menu.Item key="logo" disabled>
          <Logo />
        </Menu.Item>
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">Главная</Link>
        </Menu.Item>
        <Menu.Item key="build" icon={<BuildOutlined />}>
          <Link to="/catalog">Каталог</Link>
        </Menu.Item>
        <Menu.Item key="coffee" icon={<CoffeeOutlined />}>
          <Link to="/forum">Форум</Link>
        </Menu.Item>
        {userData ? ( // Проверка наличия данных пользователя
        <Menu.Item key="user" style={{ float: 'right', marginLeft: 'auto' }}>
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight" >
            <Button type="link" style={{ padding: 0 }}>
              <Avatar src={userData.image_profile ? baseUrl + userData.image_profile.url : defaultAvatarUrl} />
              <span style={{ marginLeft: '8px', fontWeight: 'bold', color: 'white' }}>{userData.username}</span>
              <DownOutlined style={{ marginLeft: '8px', color: 'white' }} />
            </Button>
          </Dropdown>
        </Menu.Item>
        ) : (
          <Menu.Item key="login" disabled style={{ float: 'right', marginLeft: 'auto' }}>
            <AuthModal setUserData={setUserData} />
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

export default HeaderMenu;
