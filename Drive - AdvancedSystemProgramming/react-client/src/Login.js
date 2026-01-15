import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { AuthContext } from './App';

export default function Login() {
    // Initialize state from localStorage (if it exists)
    const savedUsername = localStorage.getItem('username') || '';
    const savedPic = localStorage.getItem('profilePic');
    const savedName = localStorage.getItem('displayName');

    const [username, setUsername] = useState(savedUsername);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const usernameInputRef = useRef(null); // Ref for username
    const passwordInputRef = useRef(null); // Ref for password

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // If we already have the username, focus the PASSWORD box instead
        if (savedUsername && passwordInputRef.current) {
            passwordInputRef.current.focus();
        } else if (usernameInputRef.current) { // Focus USERNAME box
            usernameInputRef.current.focus();
        }
    }, [savedUsername]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await api.login(username, password);
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);

            // Fetch the NEW user's details from the server
            const userData = await api.getUser(token);

            // Update localStorage with the NEW user's data
            localStorage.setItem('displayName', userData.name || username);
            localStorage.setItem('profilePic', userData.image || '');

            // Set user state with the NEW user's data
            setUser({
                username,
                displayName: userData.name || username,
                profilePic: userData.image || null
            });

            navigate('/');
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <div className="card shadow p-4">
                
                {/* Welcome Back Section */}
                {savedPic && (
                    <div className="text-center mb-3">
                        <img 
                            src={savedPic} 
                            alt="Profile" 
                            className="rounded-circle border"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                        <h5 className="mt-2">Welcome back, {savedName || username}!</h5>
                    </div>
                )}
                
                {!savedPic && <h2 className="text-center mb-4">Login</h2>}

                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input 
                            ref={usernameInputRef} 
                            type="text" 
                            className="form-control" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            ref={passwordInputRef} // Attached ref here
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Sign In</button>
                </form>
                
                <p className="mt-3 text-center">
                    New here? <Link to="/register">Register</Link>
                    <br/>
                    {/* A button to "Forget me" */}
                    {savedUsername && (
                        <small 
                            className="text-muted" 
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                                localStorage.removeItem('username');
                                localStorage.removeItem('profilePic');
                                localStorage.removeItem('displayName');
                                window.location.reload(); // Refresh to clear state
                            }}
                        >
                            Forget me
                        </small>
                    )}
                </p>
            </div>
        </div>
    );
}