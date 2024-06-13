import React, { useState } from 'react';
import { Modal } from 'antd';
import './AboutUsModal.css';

const AboutUsModal = ({children}) => {
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div>
      <span onClick={showModal}>
        {children}
      </span>
      <Modal
        className="modal-about"
        open={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="modal-content">
            <div className="modal-title">О нас</div>
            <div className="modal-text">
                <p>
                    <b>ByteBay</b> - это не просто платформа, это <b>сообщество</b>, созданное для IT-специалистов. Мы стремимся стать вашей надежной <b>гаванью</b> в океане информационных технологий.
                </p>
                <p>
                    <b>Наша цель</b> - обеспечить вас всем необходимым для <b>успешной карьеры</b> и <b>развития проектов</b>. Мы предоставляем <b>уникальную среду</b> для обмена знаниями, опытом и идеями. Здесь вы можете не только продавать и приобретать проекты, но и находить вдохновение, строить команды и достигать новых высот в своей профессиональной деятельности. Мы стремимся к тому, чтобы ByteBay был местом, где каждый IT-специалист чувствует себя как дома, где он может найти поддержку и возможность реализовать свои амбиции.
                </p>
                <p>
                    <b>Присоединяйтесь</b> к нашему сообществу уже сегодня и станьте частью этого захватывающего путешествия в мире IT!
                </p>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default AboutUsModal;
