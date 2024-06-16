import React, { useState, useEffect } from 'react';
import { Modal, Button, message, Input, Rate } from 'antd';
import { ProductOutlined, ShoppingCartOutlined, FileDoneOutlined, DollarOutlined,
PhoneOutlined, UserOutlined, BankOutlined, CheckCircleOutlined, ReloadOutlined, LinkOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios';
import './PurchaseModal.css';

const { TextArea } = Input;

const PurchaseModal = ({ visible, onClose, product, licenseType, userId }) => {
  const [stage, setStage] = useState('agreement');
  const [order, setOrder] = useState(null);
  const [requisites, setRequisites] = useState(null);
  const [commissionParam, setCommissionParam] = useState(null);
  const [licenseParam, setLicenseParam] = useState(null);
  const [statusOrderParam, setStatusOrderParam] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchPlatformParams();
    if (stage === 'payment') {
      fetchRequisites();
    }
  }, [stage]);

  const fetchPlatformParams = async () => {
    try {
      const response = await axios.get('https://backend.bytebay.ru/api/platform-params?populate=*');
      const params = response.data.data;
      const commission = params.find(param => param.attributes.signature === 'commission');
      const statusOrder = params.filter(param => param.attributes.signature === 'statusOrder');
      const license = params.filter(param => param.attributes.signature === 'license');

      setCommissionParam(commission);
      setStatusOrderParam(statusOrder);
      setLicenseParam(license);
    } catch (error) {
      console.error('Error fetching platform parameters:', error);
    }
  };

  const fetchRequisites = async () => {
    try {
      const response = await axios.get('https://backend.bytebay.ru/api/requisites?populate=*');
      setRequisites(response.data.data);
    } catch (error) {
      console.error('Error fetching requisites:', error);
    }
  };

  const jwt = localStorage.getItem('jwt');
  const currentDate = new Date().toISOString();

  const handlePurchase = async () => {
    try {
      const price = licenseType === 'basic' ? parseFloat(product.data.attributes.basicPrice) : parseFloat(product.data.attributes.advancedPrice);
      const commission = (price * commissionParam.attributes.value) / 100;
      const creatingStatus = statusOrderParam.find(param => param.attributes.value === 'waiting user');
      const creatingLicense = licenseParam.find(param => param.attributes.value === licenseType);

      const newOrder = {
        data: {
          price: price,
          commission,
          product: product.data.id,
          users_permissions_user: userId,
          platform_params: [creatingLicense.id, creatingStatus.id],
          created_date: currentDate
        }
      };

      const response = await axios.post('https://backend.bytebay.ru/api/orders', newOrder, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });

      setOrder(response.data);
      setStage('payment');
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Ошибка при создании заказа');
    }
  };

  const handleConfirmByUser = async () => {
    try {
      const updatedStatus = statusOrderParam.find(param => param.attributes.value === 'waiting check');
      const creatingLicense = licenseParam.find(param => param.attributes.value === licenseType);
      const newOrderData = {
        data: {
          platform_params: [creatingLicense.id, updatedStatus.id]
        }
      };
  
      const responsePut = await axios.put(`https://backend.bytebay.ru/api/orders/${order.data.id}`, newOrderData, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });

      const responseGet = await axios.get(`https://backend.bytebay.ru/api/orders/${order.data.id}?populate=*`);
  
      message.info('Платеж проверяется оператором. Ожидайте...');
      setOrder(responseGet.data);
      setPaymentConfirmed(true);
    } catch (error) {
      console.error('Error confirming payment:', error);
      message.error('Ошибка при подтверждении оплаты');
    }
  };
  
  const handleReloadStatus = async () => {
    try {
      const response = await axios.get(`https://backend.bytebay.ru/api/orders/${order.data.id}?populate=*`);
      const statusOrder = response.data.data.attributes.platform_params.data.find(param => param.attributes.signature === 'statusOrder');

      if (statusOrder.attributes.value === 'paid') {
        setStage('paid');

        const newQuantitySales = parseFloat(product.data.attributes.quantitySales) + 1;

        await axios.put(`https://backend.bytebay.ru/api/products/${product.data.id}`, {
          data: {
            quantitySales: newQuantitySales
          }
        }, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });

        setOrder(response.data);
        message.success('Платеж подтвержден!');
      } else {
        message.info('Платеж проверяется оператором. Ожидайте...');
        setOrder(response.data);
      }
      
    } catch (error) {
      console.error('Error fetching order:', error);
      message.error('Ошибка при получении данных платежа');
    }
  };

  const handleCommentSubmit = async () => {
    try {
      await axios.post('https://backend.bytebay.ru/api/reviews', {
        data: {
          product: product.data.id,
          users_permissions_user: userId,
          text_review: comment,
          created_date: currentDate,
          order: order.data.id,
          estimate: rating
        }
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });

      const responseReviews = await axios.get(`https://backend.bytebay.ru/api/reviews?filters[product][id]=${product.data.id}`);
      const reviews = responseReviews.data.data;

      const totalRating = reviews.reduce((sum, review) => sum + review.attributes.estimate, 0);
      const averageRating = totalRating / reviews.length;

      await axios.put(`https://backend.bytebay.ru/api/products/${product.data.id}`, {
        data: {
          productRate: averageRating
        }
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });

      message.success('Отзыв успешно отправлен!');
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Ошибка при отправке отзыва');
    }
  };

  const handleClose = () => {
    setStage('agreement');
    setOrder(null);
    setRequisites(null);
    onClose();
  };

  return (
    <Modal
      title=""
      visible={visible}
      onCancel={handleClose}
      footer={null}
    >
      {stage === 'agreement' && (
        <div className="modal-content">
          <div className="modal-title">Подтверждение покупки</div>
          <div className="modal-text">
            <p><b><ProductOutlined /> Товар:</b> {product.data.attributes.productTitle}</p>
            <p><b><FileDoneOutlined /> Лицензия:</b> {licenseType === 'basic' ? 'Общая' : 'Расширенная'}</p>
            <p><b><DollarOutlined /> Стоимость:</b> {(licenseType === 'basic' ? product.data.attributes.basicPrice : product.data.attributes.advancedPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</p>
          </div>
          <Button icon={<ShoppingCartOutlined />} type="primary" style={{width: '100%'}} onClick={handlePurchase}>
            Подтвердить и оплатить
          </Button>
        </div>
      )}

      {stage === 'payment' && requisites && (
        <div className="modal-content">
          <div className="modal-title">Оплата</div>
          <div className="modal-text">
            <p><b><PhoneOutlined /> Номер телефона:</b> {requisites[0].attributes.phone}</p>
            <p><b><UserOutlined /> ФИО:</b> {requisites[0].attributes.fio}</p>
            <p><b><BankOutlined /> Банк:</b> {requisites[0].attributes.bank}</p>
            <p><b><DollarOutlined /> Сумма:</b> {(licenseType === 'basic' ? product.data.attributes.basicPrice : product.data.attributes.advancedPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</p>
          </div>
          {paymentConfirmed === false && (
            <Button icon={<CheckCircleOutlined />} type="primary" style={{width: '100%'}} onClick={handleConfirmByUser}>
              Я оплатил
            </Button>
          )}
          {paymentConfirmed === true && (
            <Button icon={<ReloadOutlined />} type="primary" ghost style={{width: '100%'}} onClick={handleReloadStatus}>
              Обновить
            </Button>
          )}
        </div>
      )}

      {stage === 'paid' && (
        <div className="modal-content">
          <div className="modal-title">Получение товара</div>
          <div className="modal-text">
            <p><b><ProductOutlined /> Товар:</b> {product.data.attributes.productTitle}</p>
            <p><b><FileDoneOutlined /> Лицензия:</b> {licenseType === 'basic' ? 'Общая' : 'Расширенная'}</p>
            <p><b><DollarOutlined /> Стоимость:</b> {(licenseType === 'basic' ? product.data.attributes.basicPrice : product.data.attributes.advancedPrice) * (1 + (commissionParam ? commissionParam.attributes.value : 0) / 100)} ₽</p>
          </div>
          <Button icon={<LinkOutlined />} type="primary" style={{width: '100%'}} href={product.data.attributes.linkUpload} target="_blank">
            Получить товар
          </Button>
          <div className="comment-section">
            <div className="modal-subtitle">Оставьте отзыв</div>
            <div className="set-rating">
              <Rate value={rating} onChange={setRating}/>
            </div>
            <TextArea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Введите ваш отзыв"
            />
            <Button type="primary" className="button-comment" onClick={handleCommentSubmit}>
              Отправить отзыв
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseModal;
