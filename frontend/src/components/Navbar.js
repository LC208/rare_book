import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerVisible(false);
  };


const menuLinks = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'flex-start' }}>
                {user && (
          user.is_staff && (
            <Link to="/dashboard" onClick={() => setDrawerVisible(false)} style={{ color: '#000' }}>
              Панель администратора
            </Link>
          )
        )
        }
    <Link to="/" onClick={() => setDrawerVisible(false)} style={{ color: '#000' }}>Главная</Link>
    {isAuthenticated ? (
      <>
        <Link to="/profile" onClick={() => setDrawerVisible(false)} style={{ color: '#000' }}>Профиль</Link>
        <Link
          type="link"
          onClick={handleLogout}
          style={{
            padding: 0,
            color: '#000',
            textAlign: 'left'
          }}
        >
          Выйти
        </Link>        

      </>
    ) : (
      <>
        <Link to="/login" onClick={() => setDrawerVisible(false)} style={{ color: '#000' }}>Вход</Link>
        <Link to="/register" onClick={() => setDrawerVisible(false)} style={{ color: '#000' }}>Регистрация</Link>
      </>
    )}


  </div>
);


  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Link>

      <ul className="nav-links">
        <li><Link to="/">Главная</Link></li>

        {isAuthenticated ? (
          <>
            <li><Link to="/profile">Профиль</Link></li>
            <li><Link to="/auction">Аукционы</Link></li>
            <li><Link type="link" onClick={handleLogout} style={{ padding: 0, color: '#fff' }}>Выйти</Link></li>

          </>
        ) : (
          <>
            <li><Link to="/login">Вход</Link></li>
            <li><Link to="/register">Регистрация</Link></li>
          </>
        )}

                             <li> {user && (
              user.is_staff && (
                <Link to="/dashboard" onClick={() => setDrawerVisible(false)} style={{ padding: 0, color: '#fff' }}>
                  Панель администратора
                </Link>
              )
            ) 
            }</li>
      </ul>

      <Button
        className="hamburger-button"
        type="text"
        icon={<MenuOutlined style={{ fontSize: 24, color: '#fff' }} />}
        onClick={() => setDrawerVisible(true)}
      />

      <Drawer
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 20 }}
        headerStyle={{ backgroundColor: '#DE7625', borderBottom: 'none' }}
      >
        {menuLinks}
      </Drawer>
    </nav>
  );
};

export default Navbar;
