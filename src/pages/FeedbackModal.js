import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, message } from 'antd';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './FeedbackModal.css';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const FeedbackModal = ({children}) => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [text_feedback, setText] = useState('');
  const [theme_feedback, setTheme] = useState(null);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.get('https://backend.bytebay.ru/api/theme-feedbacks');
        setThemes(response.data.data);
      } catch (error) {
        console.error('Failed to fetch themes:', error.message);
        message.error('Ошибка при получении тем');
      }
    };

    fetchThemes();
  }, []);

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://backend.bytebay.ru/api/feedbacks', {
        data: {
          email,
          text_feedback,
          theme_feedback,
        },
      });
      if (response.status === 200 || response.status === 201) {
        message.success('Ваше обращение успешно отправлено!');
        setVisible(false);
        setEmail('');
        setText('');
        setTheme(null);
      } else {
        message.error('Ошибка при отправке формы обратной связи');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error.message);
      message.error('Ошибка при отправке формы: ' + error.message);
    }
  };

  return (
    <div>
      <span onClick={showModal}>
        {children}
      </span>
      <Modal className="modal-feedback" open={visible} onCancel={handleCancel} footer={null}>
        <div className="modal-content">
          <div className="modal-title">Форма обратной связи</div>
          <div className="input-container">
            <Select
              showSearch
              className="select-theme"
              placeholder="Выберите тему"
              style={{width: '100%'}}
              value={theme_feedback}
              onChange={(value) => setTheme(value)}
            >
              {themes.map((themeItem) => (
                <Option key={themeItem.id} value={themeItem.id}>
                  {themeItem.attributes.theme}
                </Option>
              ))}
            </Select>
            <Input
              className="input-mail"
              prefix={<UserOutlined />}
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextArea
              className="input-description"
              prefix={<InfoCircleOutlined />}
              placeholder="Описание"
              value={text_feedback}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="button-container">
            <Button className="button-submit" type="primary" onClick={handleSubmit}>
              Отправить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackModal;
