import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import './AuthModal.css';
import axios from 'axios';

const AuthModal = ({ setUserData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [visible, setVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Состояние для переключения между формами

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: email,
        password: password,
      });
      if (response.data && response.data.user && response.data.jwt) {
        console.log('Login success:', response.data.user);
        console.log('User token:', response.data.jwt);
        setVisible(false); // Закрыть модальное окно после успешной аутентификации
        message.success('Вы успешно авторизовались!');
        
        // Получение полных данных пользователя с помощью дополнительного запроса
        const userDataResponse = await axios.get(`http://localhost:1337/api/users/${response.data.user.id}?populate=*`);
        if (userDataResponse.data) {
          console.log('Full user data:', userDataResponse.data);
          
          // Сохранение данных пользователя в localStorage
          localStorage.setItem('user', JSON.stringify(userDataResponse.data));
          localStorage.setItem('jwt', response.data.jwt);
          setUserData(userDataResponse.data); // Обновление состояния в родительском компоненте
        } else {
          console.error('Failed to fetch full user data');
          message.error('Ошибка при получении полных данных пользователя');
        }
      } else {
        console.error('Login failed:', 'No user data received');
        message.error('Ошибка входа: Неверные учетные данные');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error?.message);
      message.error('Ошибка входа: ' + error.response?.data?.error?.message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local/register', {
        username: username,
        email: email,
        password: password,
      });

      if (response.data && response.data.user && response.data.jwt) {
        console.log('Registration success:', response.data.user);
        console.log('User token:', response.data.jwt);
        setVisible(false); // Закрыть модальное окно после успешной регистрации
        message.success('Вы успешно зарегистрировались!');

        const userDataResponse = await axios.get(`http://localhost:1337/api/users/${response.data.user.id}?populate=*`);
        if (userDataResponse.data) {
          console.log('Full user data:', userDataResponse.data);

          localStorage.setItem('user', JSON.stringify(userDataResponse.data));
          localStorage.setItem('jwt', response.data.jwt);
          setUserData(userDataResponse.data); // Обновление состояния в родительском компоненте
        } else {
          console.error('Failed to fetch full user data');
          message.error('Ошибка при получении полных данных пользователя');
        }
      } else {
        console.error('Registration failed:', 'No user data received');
        message.error('Ошибка регистрации: Неверные учетные данные');
      }
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error?.message);
      message.error('Ошибка регистрации: ' + error.response?.data?.error?.message);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Вход / Регистрация
      </Button>
      <Modal className="modal-login" open={visible} onCancel={handleCancel} footer={null}>
        <div className="modal-content">
          <div className="modal-title">{isLogin ? 'Вход' : 'Регистрация'}</div>
          <div className="input-container">
            {!isLogin && (
              <Input
                className="input-field"
                prefix={<UserOutlined />}
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            <Input
              className="input-field"
              prefix={<MailOutlined />}
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input.Password
              className="input-field"
              prefix={<LockOutlined />}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="button-container">
            {isLogin ? (
              <Button className="button-signin" type="primary" onClick={handleLogin}>
                Войти
              </Button>
            ) : (
              <Button className="button-signup" type="primary" onClick={handleRegister}>
                Зарегистрироваться
              </Button>
            )}
            <Button className="button-toggle" type="link" onClick={toggleAuthMode}>
              {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuthModal;
