import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import Catalog from './pages/Catalog';
import Forum from './pages/Forum';
import NewsPage from './pages/NewsPage';
import ProductPage from './pages/ProductPage';
import AddProduct from './pages/AddProduct';
import TopicPage from './pages/TopicPage';
import AddTopic from './pages/AddTopic';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<TopicPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<UserProfilePage />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/catalog/add_product" element={<AddProduct />} />
          <Route path="/forum/create_topic" element={< AddTopic/>} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
