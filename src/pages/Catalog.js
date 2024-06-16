import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Input, Select, message } from 'antd';
import axios from 'axios';
import './Catalog.css';
import { BuildOutlined, AppstoreAddOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Option } = Select;

const Catalog = () => {
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [methodUploads, setMethodUploads] = useState([]);
  const [degreeCompletions, setDegreeCompletions] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [commissionParam, setCommissionParam] = useState(null);
  
  // Для хранения выбранных значений фильтров
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedUploads, setSelectedUploads] = useState([]);
  const [selectedCompletions, setSelectedCompletions] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  
  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };
  
  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };
  
  const handleUploadsChange = (value) => {
    setSelectedUploads(value);
  };
  
  const handleCompletionsChange = (value) => {
    setSelectedCompletions(value);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const filterProducts = (product) => {
    // Фильтрация по категории
    if (selectedCategory && product.attributes.category_product.data.attributes.category !== selectedCategory) {
      return false;
    }

    // Фильтрация по цене
    const productPrice = parseFloat(product.attributes.basicPrice);
    if ((minPrice && productPrice < parseFloat(minPrice)) || (maxPrice && productPrice > parseFloat(maxPrice))) {
      return false;
    }

    // Фильтрация по выгрузке
    if (selectedUploads.length > 0 && !selectedUploads.includes(product.attributes.method_upload.data.attributes.method)) {
      return false;
    }

    // Фильтрация по готовности
    if (selectedCompletions.length > 0 && !selectedCompletions.includes(product.attributes.degree_completion.data.attributes.degree)) {
      return false;
    }

    // Фильтрация по имени товара
    if (searchValue && !product.attributes.productTitle.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('https://backend.bytebay.ru/api/category-products?populate=*');
        setCategories(categoriesResponse.data.data);

        // Fetch method uploads
        const methodUploadsResponse = await axios.get('https://backend.bytebay.ru/api/method-uploads?populate=*');
        setMethodUploads(methodUploadsResponse.data.data);

        // Fetch degree completions
        const degreeCompletionsResponse = await axios.get('https://backend.bytebay.ru/api/degree-completions?populate=*');
        setDegreeCompletions(degreeCompletionsResponse.data.data);

        // Fetch products data
        const productsResponse = await axios.get('https://backend.bytebay.ru/api/products?populate=*&filters[statePublication][$eq]=true');
        setProductsData(productsResponse?.data?.data);

        const responseParams = await axios.get('https://backend.bytebay.ru/api/platform-params?populate=*');
        const params = responseParams.data.data;
        const commission = params.find(param => param.attributes.signature === 'commission');
        setCommissionParam(commission);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSellButtonClick = () => {
    // Проверка авторизации пользователя
    const isUserLoggedIn = localStorage.getItem('user') && localStorage.getItem('jwt');
    if (isUserLoggedIn) {
      // Перенаправление на страницу AddProduct
      navigate('/catalog/add_product');
    } else {
      // Открытие модального окна авторизации
      message.info('Пожалуйста, авторизуйтесь для продажи товаров');
    }
  };

  return (
    <div className='page-container'>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#000C17' }}>
        <Content>
          <div className="catalog-page">
            <div className="page-header">
              <h2 className="page-title">Каталог</h2>
            </div>
            <div className="catalog-container">
              <div className="menu-inline-container">
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['all']} className="menu-inline">
                  <Button type="primary" ghost icon={<AppstoreAddOutlined />} className="button-sell" onClick={handleSellButtonClick}>
                    Выставить на продажу
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
              <div className="product-list-container">
                <div className="search-filter-container">
                  <Input placeholder="Поиск" className="search-input" prefix={<SearchOutlined />} onChange={handleSearchChange} />
                  <Button type="primary" icon={<FilterOutlined />} className="filter-button" style={{ width: '40px', height: '40px' }} onClick={() => setShowFilters(!showFilters)} />
                </div>
                {showFilters && (
                  <div className="filters-container">
                    <div className="filter">
                      <span className="filter-title">Цена от</span>
                      <Input type="number" className="price-input" placeholder="0" suffix="₽" onChange={handleMinPriceChange}/>
                    </div>
                    <div className="filter">
                      <span className="filter-title">Цена до</span>
                      <Input type="number" className="price-input" placeholder="0" suffix="₽" onChange={handleMaxPriceChange}/>
                    </div>
                    <div className="filter">
                      <span className="filter-title">Выгрузка</span>
                      <Select mode="multiple" className="select" placeholder="Выберите" style={{width: '160px'}} onChange={handleUploadsChange}>
                      {Array.isArray(methodUploads) && methodUploads.map(upload => (
                        <Option key={upload.id} value={upload.attributes.method}>{upload.attributes.method}</Option>
                      ))}
                      </Select>
                    </div>
                    <div className="filter">
                      <span className="filter-title">Готовность</span>
                      <Select mode="multiple" className="select" placeholder="Выберите" style={{width: '160px'}} onChange={handleCompletionsChange}>
                        {Array.isArray(degreeCompletions) && degreeCompletions.map(completion => (
                          <Option key={completion.id} value={completion.attributes.degree}>{completion.attributes.degree}</Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
                <div className="product-cards-container">
                {productsData
                  .filter(filterProducts)
                  .map(product => (
                    <ProductCard key={product.id} product={product} commissionParam={commissionParam} />
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

export default Catalog;

