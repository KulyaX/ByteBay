import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Input, message } from 'antd';
import axios from 'axios';
import './Forum.css';
import { BuildOutlined, AppstoreAddOutlined, SearchOutlined, MessageOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Content } = Layout;

const ForumPage = () => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const filterTopics = (topic) => {
    // Фильтрация по категории
    if (selectedCategory && topic.attributes.category_product.data.attributes.category !== selectedCategory) {
      return false;
    }

    // Фильтрация по названию темы
    if (searchValue && !topic.attributes.title.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('http://185.250.46.218:1337/api/category-products?populate=*');
        setCategories(categoriesResponse.data.data);

        // Fetch topics
        const topicsResponse = await axios.get('http://185.250.46.218:1337/api/topics?populate=*');
        setTopics(topicsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCreateTopicClick = () => {
    // Проверка авторизации пользователя
    const isUserLoggedIn = localStorage.getItem('user') && localStorage.getItem('jwt');
    if (isUserLoggedIn) {
      // Перенаправление на страницу создания новой темы
      navigate('/forum/create_topic');
    } else {
      // Открытие сообщения об авторизации
      message.info('Пожалуйста, авторизуйтесь для создания новой темы');
    }
  };

  return (
    <div className='page-container'>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#000C17' }}>
        <Content>
          <div className="forum-page">
            <div className="page-header">
              <h2 className="page-title">Форум</h2>
            </div>
            <div className="forum-container">
              <div className="menu-inline-container">
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['all']} className="menu-inline">
                  <Button type="primary" ghost icon={<AppstoreAddOutlined />} className="button-create-topic" onClick={handleCreateTopicClick}>
                    Создать тему
                  </Button>
                  <Menu.Item key="all" onClick={() => setSelectedCategory(null)} icon={<BuildOutlined />}>
                    Все категории
                  </Menu.Item>
                  {categories.map(category => (
                    <Menu.Item key={category.id} onClick={() => handleCategoryChange(category.attributes.category)} icon={<DynamicIcon iconName={category.attributes.iconName} />}>
                      {category.attributes.category}
                    </Menu.Item>
                  ))}
                </Menu>
              </div>
              <div className="topic-list-container">
                <div className="search-container">
                  <Input placeholder="Поиск" className="search-input" prefix={<SearchOutlined />} onChange={handleSearchChange} />
                </div>
                <div className="topic-cards-container">
                  {topics.filter(filterTopics).map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

const DynamicIcon = ({ iconName }) => {
  const [IconComponent, setIconComponent] = useState(null);

  useEffect(() => {
    const loadIcon = async () => {
      const icons = await import('@ant-design/icons');
      const Icon = icons[iconName];
      if (Icon) {
        setIconComponent(<Icon />);
      } else {
        console.error(`Icon ${iconName} not found`);
      }
    };

    loadIcon();
  }, [iconName]);

  return IconComponent;
};

const TopicCard = ({ topic }) => {
  const { title, created_date, users_permissions_user, forum_messages, category_product } = topic.attributes;

  return (
    <Link to={`/forum/${topic.id}`} key={topic.id} className="topic-card-link">
      <div className="topic-card">
        <div className="topic-header">
          <h3 className="topic-title">{title}</h3>
        </div>
        <div className="topic-info">
          <div className="topic-category">{category_product.data.attributes.category}</div>
          <div className="topic-author"><UserOutlined /> {users_permissions_user.data.attributes.username}</div>
          <div className="topic-date"><CalendarOutlined /> {new Date(created_date).toLocaleString()}</div>
          <div className="topic-message-count"><MessageOutlined /> {forum_messages.data.length}</div>
        </div>
      </div>
    </Link>
  );
};

export default ForumPage;
