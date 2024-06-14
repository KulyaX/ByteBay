import React from 'react';
import { Image } from 'antd';

const Logo = () => {
  return (
    <Image src="/images/logo.png" alt="Логотип" width={200} height={50} preview={false} />
  );
};

export default Logo;
