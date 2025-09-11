import React, { useState } from 'react';
import axios from '../utils/axios';

const TokenRefresh = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('users/token-refresh/', {
        token: localStorage.getItem('token'),
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      setError(error.response.data);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit}>Refresh Token</button>
      {token && (
        <p>Token refreshed: {token}</p>
      )}
      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
    </div>
  );
};

export default TokenRefresh;