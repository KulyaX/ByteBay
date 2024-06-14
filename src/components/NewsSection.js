import React, { useState, useEffect } from 'react';
import { Card, Button } from 'antd';
import './NewsSection.css';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Импортируем Link из react-router-dom для создания ссылок

const NewsSection = () => {
  const [visibleNewsCount, setVisibleNewsCount] = useState(4);
  const [newsData, setNewsData] = useState([]);

  const fetchNewsData = async () => {
    try {
      const response = await axios.get('http://185.250.46.218:1337/api/blogs?populate=*');
      setNewsData(response.data.data);
    } catch (error) {
      console.error('Error fetching news data:', error);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const handleShowMoreNews = () => {
    setVisibleNewsCount(visibleNewsCount + 4);
  };

  const baseUrl = 'http://185.250.46.218:1337';

  return (
    <div className="news-section">
      <h2 className="section-title">Новости</h2>
      <div className="news-container">
        {newsData.slice(0, visibleNewsCount).map((news) => (
          // Используем компонент Link из react-router-dom для создания ссылки на страницу с полной новостью
          <Link to={`/news/${news.id}`} key={news.id} className="news-card-link">
            <Card
              className="news-card"
              cover={<img alt={news.attributes.blogTitle} src={baseUrl + news.attributes.blogImage.data.attributes.url} style={{ width: '100%', height: '172px' }} />}
            >
              <div className="news-card-content">
                <h3 className="news-card-title">{news.attributes.blogTitle}</h3>
                <div className="news-card-metadata">
                  <span className="news-card-author">{news.attributes.blogAuthor}</span>
                  <span className="news-card-date">{news.attributes.datePublication}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {visibleNewsCount < newsData.length && (
        <div className="show-more-container">
          <Button type="primary" ghost onClick={handleShowMoreNews}>
            Показать еще
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
