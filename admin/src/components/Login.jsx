import React, { useState } from "react";
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from "react-toastify";
import '../style/Login.scss'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // ⭐ État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/admin`,  
        { email, password }
      );

      if (response.data.success) {
        setToken(response.data.token);
        toast.success("Login successful");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 404) {
        toast.error("Admin endpoint not found. Check server configuration.");
      } else if (error.response?.status === 401) {
        toast.error("Invalid credentials");
      } else {
        toast.error(error.response?.data?.message || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ⭐ Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="dark-gold-login">
      <div className="gold-card">
        <h1 className="gold-title">ADMIN PANEL</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="input-group">
            <label className="gold-label">EMAIL ADDRESS</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}  
              type="email" 
              placeholder="your@email.com" 
              required 
              className="gold-input"
              disabled={loading}
            />
          </div>
          
          {/* ⭐ Champ mot de passe avec emoji toggle */}
          <div className="input-group password-group">
            <label className="gold-label">PASSWORD</label>
            <div className="password-input-wrapper">
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}  
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password" 
                required 
                className="gold-input password-input"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="password-emoji" role="img" aria-label="toggle password">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="gold-button"
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
