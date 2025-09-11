import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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
    </div>
  );
};

export default Profile;