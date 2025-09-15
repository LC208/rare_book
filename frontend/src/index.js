import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './hooks/useAuth';
import 'antd/dist/reset.css'; // сброс стилей

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <AuthProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#DE7625',       // основной цвет кнопок и ссылок
              colorBgContainer: '#f8f9fa',   // фон контейнеров
              colorText: '#212529',          // основной текст
              colorTextSecondary: '#6c757d', // вторичный текст
              colorError: '#ff4d4f',         // цвет ошибок
              borderRadius: 0, 
            },
          }}
        >
          <App />
        </ConfigProvider>
      </AuthProvider>
  </React.StrictMode>
);
