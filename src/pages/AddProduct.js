import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LeftOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tooltip, Upload, Modal, message } from 'antd';
import './AddProduct.css';

const { Option } = Select;

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [methodUploads, setMethodUploads] = useState([]);
  const [degreeCompletions, setDegreeCompletions] = useState([]);

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [methodUploadId, setMethodUploadId] = useState('');
  const [link, setLink] = useState('');
  const [degreeCompletionId, setDegreeCompletionId] = useState('');
  const [basicPrice, setBasicPrice] = useState('');
  const [advancedPrice, setAdvancedPrice] = useState('');
  const [userId, setUserId] = useState('');

  // Состояние для хранения загруженных файлов
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  // Функция для обработки изменений в загружаемых файлах
  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Функция для преобразования изображения в base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Функция для открытия предпросмотра изображения
  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Функция для закрытия предпросмотра изображения
  const handleCancelPreview = () => setPreviewVisible(false);

  // Функция для удаления файла из списка загруженных файлов
  const handleRemove = file => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
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
      const uploadedImageIds = [];
  
      // Загрузка изображений на сервер
      for (let i = 0; i < fileList.length; i++) {
        const formData = new FormData();
        formData.append('files', fileList[i].originFileObj);
  
        const response = await axios.post('https://backend.bytebay.ru/api/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        // Сохраняем id загруженного изображения
        const imageId = response.data[0].id;
        uploadedImageIds.push(imageId);
      }
  
      // После успешной загрузки изображений создаем товар с привязкой к изображениям
      const productData = {
        productTitle: title,
        productDescription: [{
          type: 'paragraph',
          children: [{
            type: 'text',
            text: description,
          }],
        }],
        linkUpload: link,
        basicPrice,
        advancedPrice,
        method_upload: {
          id: methodUploadId,
        },
        degree_completion: {
          id: degreeCompletionId,
        },
        category_product: {
          id: category,
        },
        users_permissions_user: {
          id: userId,
        },
        datePublication: currentDate(),
        productImage: uploadedImageIds // Добавляем ids загруженных изображений
      };
  
      const response = await axios.post('https://backend.bytebay.ru/api/products', { data: productData }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log('Data successfully submitted:', response.data);
      message.success('Товар отправлен на проверку. После проверки товар будет опубликован!');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };
  
  const currentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // добавляем ведущий ноль для месяцев < 10
    const day = String(today.getDate()).padStart(2, '0'); // добавляем ведущий ноль для чисел < 10
    return `${year}-${month}-${day}`;
  };

  return (
    <div className='page-container'>
      <div className="add-product-page">
        <Link to="/catalog">
          <Button type="link" icon={<LeftOutlined />} className="back-button">
            Назад
          </Button>
        </Link>
        <h2 className="add-title">Публикация товара</h2>
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
            <span className="label">Название товара</span>
            <Input className="input-field" placeholder="Введите название" onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-field">
            <span className="label">Описание</span>
            <Input.TextArea className="input-field" placeholder="Опишите продаваемый товар" onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="method-container">
            <div className="form-field">
              <span className="label">Выгрузка</span>
              <Select className="select-field" placeholder="Выберите способ выгрузки" onChange={setMethodUploadId}>
                {methodUploads.map(upload => (
                  <Option key={upload.id} value={upload.id}>
                    {upload.attributes.method}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="form-field" style={{ flexGrow: 1 }}>
              <span className="label">Ссылка</span>
              <Input className="input-field" placeholder="URL" onChange={e => setLink(e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <span className="label">Готовность</span>
            <Select className="select-field" placeholder="Выберите степень готовности" onChange={setDegreeCompletionId}>
              {degreeCompletions.map(completion => (
                <Option key={completion.id} value={completion.id}>
                  {completion.attributes.degree}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <span className="label">Загрузка фото</span>
            <Upload
              fileList={fileList}
              onChange={handleChange}
              onPreview={handlePreview}
              onRemove={handleRemove}
              beforeUpload={() => false} // Отменяем автоматическую загрузку
              listType="picture-card" // Отображаем превью фото в виде карточек
            >
              {fileList.length >= 8 ? null : (
                <div className="button-upload">
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Выбрать фото</div>
                </div>
              )}
            </Upload>
            <Modal
              visible={previewVisible}
              footer={null}
              onCancel={handleCancelPreview}
            >
              <img alt="Превью" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
          <div className="price-container">
            <div className="form-field">
              <span className="label">
                Стоимость общей лицензии
                <Tooltip title="Использование вами или одним клиентом в одном конечном продукте, за который конечные пользователи не взимают плату. Общая стоимость включает в себя стоимость товара и комиссию покупателя.">
                  <QuestionCircleOutlined className="info-icon" />
                </Tooltip>
              </span>
              <Input type="number" className="input-field" placeholder="0" suffix="₽" onChange={e => setBasicPrice(e.target.value)} />
            </div>
            <div className="form-field">
              <span className="label">
                Стоимость расширенной лиценции
                <Tooltip title="Использование вами или одним клиентом в одном конечном продукте, за который конечные пользователи могут взимать плату. Общая стоимость включает в себя стоимость товара и комиссию покупателя.">
                  <QuestionCircleOutlined className="info-icon" />
                </Tooltip>
              </span>
              <Input type="number" className="input-field" placeholder="0" suffix="₽" onChange={e => setAdvancedPrice(e.target.value)} />
            </div>
            <Button type="primary" className="publication-button" onClick={handleSubmit}>
              Опубликовать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
