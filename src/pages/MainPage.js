import React from 'react';
import MainScreen from '../components/MainScreen';
import NewsSection from '../components/NewsSection';
import ProductsSection from '../components/ProductsSection';
import { Layout } from 'antd';
import './MainPage.css';

const { Content } = Layout;

const MainPage = () => {
  return (
    <div className='page-container'>
        <Layout style={{ minHeight: '100vh', backgroundColor: '#000C17' }}>
        <Content>
            <MainScreen />
            <NewsSection />
            <ProductsSection />
        </Content>
        </Layout>
    </div>
  );
};

export default MainPage;