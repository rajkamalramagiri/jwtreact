// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const getUser = () => {
     // Fetch user data using the token
     axios.get('http://localhost:5000/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setUserData(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching user data:', error.response.status);
        if (error.response.status === 403) {
          axios.post('http://localhost:5000/token', { refreshToken: localStorage.getItem('refreshToken') || null })
            .then(response => {
              const { accessToken } = response.data;
              console.log('responseaccess',accessToken)
              localStorage.setItem('accessToken', accessToken);
        setToken(accessToken);

              // getUser();
          })
        }
      });
  }

  useEffect(() => {
    if (token) {
      getUser();
    }
  }, [token]);

  const handleLogin = () => {
    // Simulate a login request, replace with your actual authentication logic
    axios.post('http://localhost:5000/login', { username, password })
      .then(response => {
        const { accessToken, refreshToken } = response.data;
        setToken(accessToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {token ? <Redirect to="/" /> : (
            <div>
              <h2>Login</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <label>
                  Username:
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <br />
                <label>
                  Password:
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Login</button>
              </form>
            </div>
          )}
        </Route>
        <Route path="/">
          {token ? (
            <div>
              <h2>Welcome, {userData ? userData.username : 'User'}!</h2>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={getUser}>Get User</button>
            </div>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
