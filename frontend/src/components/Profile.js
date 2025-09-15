import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    axios.get('users/profile/')
      .then(response => setUser(response.data))
      .catch(error => setError(error.response.data));
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>{user.first_name} {user.last_name}</h1>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
      <button onClick={logout}>Выйти</button>
    </div>
  );
};

export default Profile;