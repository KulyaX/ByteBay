import React from 'react';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Logo from './Logo';
import './Footer.css';
import { Button } from 'antd';
import FeedbackModal from '../pages/FeedbackModal';
import AboutUsModal from '../pages/AboutUsModal';

const Footer = () => {
  return (
    <div className="footer-container">
      <footer className="footer">
        <Logo />
        <div className="footer-links">
          <FeedbackModal>
            <Button type="link">Помощь</Button>
          </FeedbackModal>
          <AboutUsModal>
            <Button type="link">О нас</Button>
          </AboutUsModal>
          <Button href="https://vk.com/hotluman" type="link">Мы в ВК</Button>
          <Button href="https://t.me/kulyak" type="link">Мы в TG</Button>
        </div>
        <div className="footer-contacts">
          <h3>Контакты</h3>
          <div className="contact-item">
            <PhoneOutlined />
            <span>+7 923 282 73-35</span>
          </div>
          <div className="contact-item">
            <MailOutlined />
            <span>thelael5258@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
