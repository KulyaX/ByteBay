import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LeftOutlined, UserOutlined, CalendarOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import axios from 'axios';
import './TopicPage.css';

const TopicPage = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTopicAndMessages = async () => {
      try {
        const topicResponse = await axios.get(`https://backend.bytebay.ru/api/topics/${id}?populate=*`);
        setTopic(topicResponse.data);

        const messagesResponse = await axios.get(`https://backend.bytebay.ru/api/forum-messages?populate=*&filters[topic][id]=${id}`);
        const sortedMessages = messagesResponse.data.data.sort((a, b) => a.id - b.id);
        setMessages(sortedMessages);

        const userData = JSON.parse(localStorage.getItem('user'));
        const jwt = localStorage.getItem('jwt');
        if (userData && jwt) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching topic and messages:', error);
      }
    };

    fetchTopicAndMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      const jwt = localStorage.getItem('jwt');
      const currentDate = new Date().toISOString();

      const response = await axios.post('https://backend.bytebay.ru/api/forum-messages', {
        data: {
          text_message: newMessage,
          topic: id,
          users_permissions_users: user.id,
          created_date: currentDate,
        }
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });

      const newMessageData = {
        id: response.data.data.id,
        attributes: {
          text_message: newMessage,
          created_date: currentDate,
          users_permissions_users: {
            data: [{
              id: user.id,
              attributes: {
                username: user.username
              }
            }]
          }
        }
      };

      setMessages([...messages, newMessageData]);
      setNewMessage('');
      message.success('Сообщение успешно отправлено!');
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Произошла ошибка. Попробуйте авторизоваться или обратиться в службу поддержки');
    }
  };

  const handleInputClick = () => {
    if (!isAuthenticated) {
      message.info('Пожалуйста, авторизуйтесь для отправки сообщений.');
    }
  };

  return (
    <div className='page-container'>
      <div className="topic-page">
        <Link to="/forum">
          <Button type="link" icon={<LeftOutlined />} className="back-button">
            Назад
          </Button>
        </Link>
        {topic && (
          <>
            <h2 className="topic-title">{topic.data.attributes.title}</h2>
            <div className="topic-info">
              <div className="topic-category">{topic.data.attributes.category_product.data.attributes.category}</div>
              <Link to={`/profile/${topic.data.attributes.users_permissions_user.data.id}`}>
                <Button type="link" icon={<UserOutlined />} className="topic-author">
                  {topic.data.attributes.users_permissions_user.data.attributes.username}
                </Button>
              </Link>
              <div className="topic-date"><CalendarOutlined /> {new Date(topic.data.attributes.created_date).toLocaleString()}</div>
              <div className="topic-message-count"><MessageOutlined /> {topic.data.attributes.forum_messages.data.length}</div>
            </div>
          </>
        )}
        <div className="message-container">
          {topic && topic.data.attributes.description && (
            <div className="topic-text">
              <Link to={`/profile/${topic.data.attributes.users_permissions_user.data.id}`}>
                <Button type="link" icon={<UserOutlined />} className="user-message">
                  {topic.data.attributes.users_permissions_user.data.attributes.username} | Автор темы
                </Button>
              </Link>
              <div className="message">{topic.data.attributes.description}</div>
              <div className="date-message">{new Date(topic.data.attributes.created_date).toLocaleString()}</div>
            </div>
          )}
          {messages.map(message => (
            <div key={message.id} className="messages">
              <Link to={`/profile/${message.attributes.users_permissions_users.data[0].id}`}>
                <Button type="link" icon={<UserOutlined />} className="user-message">
                  {message.attributes.users_permissions_users.data[0].attributes.username}
                </Button>
              </Link>
              <div className="message">{message.attributes.text_message}</div>
              <div className="date-message">{new Date(message.attributes.created_date).toLocaleString()}</div>
            </div>
          ))}
          <div className="send-container">
            <Input
              className="input-message"
              placeholder="Напишите ответ"
              size="large"
              style={{ width: "100%" }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onClick={handleInputClick}
            />
            <Button
              className="button-send"
              type="primary"
              icon={<SendOutlined />}
              size="large"
              onClick={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
