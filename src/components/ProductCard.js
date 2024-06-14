import React from 'react';
import { Card, Rate } from 'antd';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, commissionParam }) => {
  const baseUrl = 'http://185.250.46.218:1337';
  
  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <Card
        key={product.id}
        className="products-card"
        cover={<img alt={product.attributes.productTitle} src={baseUrl+product.attributes.productImage.data[0].attributes.url} className="products-card-cover" />}
      >
        <div className="products-card-content">
          <h3 className="products-card-title">{product.attributes.productTitle}</h3>
          <div className="products-card-price">{(product.attributes.basicPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</div>
          <div className="products-card-metadata">
            <div className="products-card-sales">{product.attributes.quantitySales} продаж</div>
            <Rate value={product.attributes.productRate} disabled />
          </div>
          <div className="products-card-metadata">
            <span className="products-card-date">{product.attributes.datePublication}</span>
            <span className="products-card-author">{product.attributes.users_permissions_user.data.attributes.username}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;

