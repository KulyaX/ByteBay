import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Input, Select, message } from 'antd';
import './AddTopic.css';

const { Option } = Select;

const AddTopic = () => {
  const [categories, setCategories] = useState([]);

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:1337/api/category-products?populate=*');
        setCategories(categoriesResponse.data.data);

        // Получаем информацию о пользователе из localStorage
        const userData = JSON.parse(localStorage.getItem('user'));

        // Извлекаем только id пользователя и сохраняем его в состоянии
        if (userData && userData.id) {
          setUserId(userData.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const token = localStorage.getItem('jwt');
  
  const handleSubmit = async () => {
    try {
      
      const topicData = {
        title: title,
        description: description,
        category_product: {
          id: category,
        },
        users_permissions_user: {
          id: userId,
        },
        created_date: currentDate
      };
  
      const response = await axios.post('http://localhost:1337/api/topics', { data: topicData }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log('Data successfully submitted:', response.data);
      message.success('Тема успешно опубликована на форуме!');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };
  
  const currentDate = new Date().toISOString();

  return (
    <div className='page-container'>
      <div className="add-topic-page">
        <Link to="/forum">
          <Button type="link" icon={<LeftOutlined />} className="back-button">
            Назад
          </Button>
        </Link>
        <h2 className="add-title">Создание темы</h2>
        <div className="form-container">
          <div className="form-field">
            <span className="label">Категория</span>
            <Select className="select-field" placeholder="Выберите категорию" onChange={setCategory}>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.attributes.category}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <span className="label">Заголовок</span>
            <Input className="input-field" placeholder="Введите заголовок" onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-field">
            <span className="label">Описание</span>
            <Input.TextArea className="input-field" placeholder="Опишите свой вопрос или предложение" onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="publication-container">
            <Button type="primary" className="publication-button" onClick={handleSubmit}>
              Опубликовать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTopic;
