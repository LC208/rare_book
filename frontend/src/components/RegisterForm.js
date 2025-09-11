import React, { useState } from 'react';
import AuthForm from './AuthForm';
import axios from '../utils/axios';

const RegisterForm = () => {
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      const response = await axios.post('users/register/', data);
      console.log(response.data);
    } catch (error) {
      setError(error.response.data);
    }
  };

  return (
    <AuthForm onSubmit={handleSubmit} formType="register" error={error} />
  );
};

export default RegisterForm;