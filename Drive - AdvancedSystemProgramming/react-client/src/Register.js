import React, { useState, useContext, useRef, useEffect } from 'react'; // <--- Import useRef & useEffect
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { AuthContext } from './App';

export default function Register() {
        // State for form fields
    const [formData, setFormData] = useState({
        gmail: '',           
        name: '',            
        password: '',
        confirmPassword: '', 
        picture: ''          
    });
    const [preview, setPreview] = useState(null); 
    const [error, setError] = useState('');
    
    // Create the Ref for the first input
    const gmailInputRef = useRef(null);

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Focus the input when component mounts
    useEffect(() => {
        if (gmailInputRef.current) {
            gmailInputRef.current.focus();
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, picture: reader.result }); 
                setPreview(reader.result); 
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        if (!formData.gmail.includes('@')) return "Please enter a valid email address";
        if (formData.password.length < 4) return "Password must be at least 4 chars";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        if (!formData.picture) return "Please select a profile picture";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return setError(err);

        try {
            // Register
            await api.register({
                gmail: formData.gmail,
                name: formData.name,
                password: formData.password,
                image: formData.picture 
            });

            // Auto-Login
            const token = await api.login(formData.gmail, formData.password);
            
            // Save & Navigate
            localStorage.setItem('token', token);
            localStorage.setItem('username', formData.gmail);
            localStorage.setItem('displayName', formData.name);
            localStorage.setItem('profilePic', formData.picture);

            setUser({ 
                username: formData.gmail, 
                displayName: formData.name, 
                profilePic: formData.picture 
            });
            navigate('/');

        } catch (err) {
            console.error(err);
            setError("Registration failed. User may exist or image is too large.");
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '450px' }}>
            <div className="card shadow-sm p-4">
                <h2 className="text-center mb-4">Register</h2>
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    {/* Gmail Field */}
                    <div className="mb-3">
                        <label className="form-label">Gmail Address</label>
                        <input 
                            // Attach Ref here
                            ref={gmailInputRef}
                            type="email" 
                            className="form-control" 
                            placeholder="user@gmail.com"
                            value={formData.gmail}
                            onChange={e => setFormData({...formData, gmail: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Name Field */}
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Profile Picture Field */}
                    <div className="mb-4">
                        <label className="form-label">Profile Picture</label>
                        <input 
                            type="file" 
                            className="form-control" 
                            accept="image/*"
                            onChange={handleImageChange}
                            required 
                        />
                        {/* Image Preview */}
                        {preview && (
                            <div className="mt-2 text-center">
                                <img src={preview} alt="Preview" 
                                     style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Register</button>
                </form>

                <p className="mt-3 text-center">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}