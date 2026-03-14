import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../style/Login.scss';

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl, setUser } = useContext(ShopContext); 
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ⭐ Nouvel état pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);

      if (currentState === 'Sign Up') {
        if (!name) {
          toast.error('Please enter your name');
          return;
        }

        const response = await axios.post(backendUrl + '/api/user/register', { 
          name, 
          email, 
          password 
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          if (response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          toast.success('Registration successful!');
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { 
          email, 
          password 
        });

        if (response.data.success) {
          console.log('✅ Login success, navigating to /Profile');

          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          if (response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          toast.success('Login successful!');
          navigate('/');

        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(backendUrl + '/api/user/forgot-password', { 
        email: resetEmail 
      });

      if (response.data.success) {
        toast.success('Password reset link sent to your email!');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      console.log('Token detected, redirecting...');
      navigate('/');
    }
  }, [token, navigate]);

  // ⭐ Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showForgotPassword) {
    return (
      <div className="login-page">
        <form onSubmit={handleForgotPassword} className="login-form">
          <div className="form-header">
            <h1 className="form-title">Reset Password</h1>
            <p className="form-subtitle">
              Enter your email to receive a reset link
            </p>
          </div>

          <div className="form-group">
            <input
              onChange={(e) => setResetEmail(e.target.value)}
              value={resetEmail}
              type="email"
              placeholder="Email address"
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <span 
              className="back-to-login"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
              }}
            >
              ← Back to Login
            </span>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form onSubmit={onSubmitHandler} className="login-form">
        <div className="form-header">
          <h1 className="form-title">{currentState}</h1>
        </div>

        {currentState === "Sign Up" && (
          <div className="form-group">
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Full name"
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="form-group">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Email address"
            required
            className="form-input"
            disabled={isLoading}
          />
        </div>

        {/* ⭐ Champ mot de passe avec emoji */}
        <div className="form-group password-group">
          <div className="password-input-wrapper">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="form-input password-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="password-emoji" role="img" aria-label="toggle password">
                {showPassword ? '🙈' : '👁️'}
              </span>
            </button>
          </div>
        </div>

        <div className="form-actions">
          {currentState === "Login" && (
            <span 
              className="forgot-password"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot your password?
            </span>
          )}

          <span 
            className="toggle-state" 
            onClick={() => {
              setCurrentState(currentState === "Login" ? "Sign Up" : "Login");
              setName('');
              setEmail('');
              setPassword('');
              setShowPassword(false);
            }}
          >
            {currentState === "Login" ? "Create account" : "Login Here"}
          </span>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (currentState === "Login" ? "Sign In" : "Sign Up")}
        </button>

      </form>
    </div>
  );
};

export default Login;
