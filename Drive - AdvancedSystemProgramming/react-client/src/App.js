import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Register from './Register';
import Home from './Home';

// Contexts
export const ThemeContext = createContext();
export const AuthContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');


  // check storage immediately on load to set user state
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const displayName = localStorage.getItem('displayName');
    const profilePic = localStorage.getItem('profilePic');

    if (token && username) {
      return { 
        username, 
        displayName: displayName || username,  // Fallback to username if no displayName
        profilePic 
      };
    }
    return null; // Only returns null if nothing is in storage
  });

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.className = theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-white';
  }, [theme]);

  const logout = () => {
localStorage.removeItem('token'); 
    
    // Note: We DO NOT remove 'username', 'displayName', or 'profilePic'
    
    setUser(null); // This switches the view to the Login screen    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={theme === 'light' ? 'bg-light min-vh-100' : 'bg-dark text-white min-vh-100'}>
          <Router>
            <Routes>
              {/* Login Page: If already logged in, go to Home */}
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login />} 
              />
              
              {/* Register Page: If already logged in, go to Home */}
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register />} 
              />
              
              {/* Home Page: If NOT logged in, go to Login */}
              <Route 
                path="/" 
                element={user ? <Home /> : <Navigate to="/login" />} 
              />
            </Routes>
          </Router>
        </div>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;