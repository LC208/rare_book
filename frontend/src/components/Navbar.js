import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // твой хук для авторизации
import logo from '../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Link>

      <ul style={styles.navLinks}>
        <li>
          <Link to="/" style={styles.link}>Главная</Link>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <Link to="/profile" style={styles.link}>Профиль</Link>
            </li>
            <li>
              <button onClick={handleLogout} style={styles.logoutButton}>Выйти</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" style={styles.link}>Вход</Link>
            </li>
            <li>
              <Link to="/register" style={styles.link}>Регистрация</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#DE7625',
    height: 60,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: 20,
    margin: 0,
    padding: 0,
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  logoutButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Navbar;