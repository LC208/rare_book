import React, { useState } from 'react';
import AuthForm from './AuthForm';
import axios from '../utils/axios';

const LoginForm = () => {
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const handleSubmit = async (data) => {
    try {
      const response = await axios.post('users/login/', data);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      setError(error.response.data);
    }
  };

  return (
    <AuthForm onSubmit={handleSubmit} formType="login" error={error} />
  );
};

export default LoginForm;