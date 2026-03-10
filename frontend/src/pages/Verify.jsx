import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../style/Verify.scss';

import { 
  FaStripe, 
  FaPaypal, 
  FaCreditCard, 
  FaUniversity, 
  FaMoneyBillWave,
  FaBitcoin,
  FaApplePay,
  FaGooglePay
} from 'react-icons/fa';

const Verify = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState('verifying');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [message, setMessage] = useState('Verifying your payment...');
  const [subMessage, setSubMessage] = useState('Please wait while we confirm your order');
  
  const { token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const verified = useRef(false);

  // ⭐ DÉTECTION DE LA MÉTHODE DE PAIEMENT
  useEffect(() => {
    const detectMethod = () => {
      // 1. Priorité au paramètre URL 'method'
      const urlMethod = searchParams.get('method');
      if (urlMethod) return urlMethod;
      
      // 2. Détection par paramètres spécifiques
      if (searchParams.get('token') || searchParams.get('PayerID')) return 'paypal';
      
      // 3. Détection par présence de paymentId (Stripe)
      if (searchParams.get('paymentId')) return 'stripe';
      
      // 4. Détection par path (fallback)
      const path = location.pathname.toLowerCase();
      if (path.includes('transfer') || path.includes('bank')) return 'transfer';
      if (path.includes('crypto')) return 'crypto';
      
      // 5. Défaut
      return 'card';
    };
    
    const detectedMethod = detectMethod();
    console.log('🔍 Payment method detected:', detectedMethod);
    setPaymentMethod(detectedMethod);
  }, [searchParams, location]);

  const getPaymentConfig = (method) => {
    const configs = {
      stripe: {
        icon: <FaStripe />,
        name: 'Stripe',
        color: '#635BFF',
        verifyEndpoint: '/api/order/verifyStripe'
      },
      paypal: {
        icon: <FaPaypal />,
        name: 'PayPal',
        color: '#003087',
        verifyEndpoint: '/api/order/verifyPaypal'
      },
      transfer: {
        icon: <FaUniversity />,
        name: 'Bank Transfer',
        color: '#00A650',
        verifyEndpoint: '/api/order/verifyTransfer'
      },
      crypto: {
        icon: <FaBitcoin />,
        name: 'Cryptocurrency',
        color: '#F7931A',
        verifyEndpoint: '/api/order/verifyCrypto'
      },
      card: {
        icon: <FaCreditCard />,
        name: 'Credit Card',
        color: '#f7ef8a',
        verifyEndpoint: '/api/order/verifyStripe'
      }
    };
    return configs[method] || configs.card;
  };

  useEffect(() => {
    if (verified.current || !paymentMethod) return;
    
    const verifyPayment = async () => {
      try {
        if (!token) {
          setStatus('error');
          setMessage('Authentication required');
          setSubMessage('Please login to continue');
          toast.error('Please login to verify payment');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // ⭐ RÉCUPÉRATION DES PARAMÈTRES
        const orderId = searchParams.get('orderId');
        const success = searchParams.get('success');
        const paypalOrderId = searchParams.get('token'); // PayPal
        const payerId = searchParams.get('PayerID'); // PayPal
        const paymentId = searchParams.get('paymentId'); // Stripe
        
        console.log('🔍 Verify Params:', { 
          orderId, 
          success, 
          paypalOrderId, 
          payerId, 
          paymentId,
          paymentMethod 
        });

        if (!orderId) {
          setStatus('error');
          setMessage('Order not found');
          setSubMessage('No order ID provided');
          toast.error('No order ID found');
          setTimeout(() => navigate('/cart'), 2000);
          return;
        }

        verified.current = true;
        const user = JSON.parse(localStorage.getItem('user'));
        const config = getPaymentConfig(paymentMethod);

        // Pour les virements bancaires
        if (paymentMethod === 'transfer' || paymentMethod === 'cash') {
          setStatus('pending');
          setMessage('Payment pending');
          setSubMessage('We will verify your payment within 24 hours');
          toast.info('Payment received! Pending verification.');
          setTimeout(() => navigate('/orders'), 3000);
          return;
        }

        // ⭐ CONSTRUCTION DU PAYLOAD SELON LA MÉTHODE
        const payload = { 
          success,
          orderId,
          userId: user?._id 
        };

        // Paramètres spécifiques par méthode
        if (paymentMethod === 'paypal') {
          payload.paypalOrderId = paypalOrderId;
          payload.payerId = payerId;
        } else if (paymentMethod === 'stripe') {
          payload.paymentId = paymentId;
        }

        console.log('📤 Sending verification to:', config.verifyEndpoint);
        console.log('📤 Payload:', payload);

        const response = await axios.post(
          `${backendUrl}${config.verifyEndpoint}`,
          payload,
          { headers: { token } }
        );

        if (response.data.success) {
          handleSuccess();
        } else {
          handleError(response.data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        handleError(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyPayment();
  }, [token, paymentMethod, searchParams, backendUrl, navigate]);

  const handleSuccess = () => {
    setStatus('success');
    setMessage('Payment successful!');
    setSubMessage('Your program is now active. Redirecting...');
    
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success('Payment successful! Your program is now active.');
    
    setTimeout(() => navigate('/orders'), 2000);
  };

  const handleError = (errorMsg) => {
    setStatus('error');
    setMessage('Payment failed');
    setSubMessage(errorMsg || 'Please try again or contact support');
    toast.error(errorMsg || 'Payment verification failed');
    
    setTimeout(() => navigate('/cart'), 3000);
  };

  const config = getPaymentConfig(paymentMethod);

  return (
    <div className={`verify-page verify-${status} method-${paymentMethod}`}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <main className="verify-main">
        <div className="verify-container">
          <div className="verify-content">
            {/* Badge méthode de paiement */}
            <div className="payment-method-badge" style={{ '--method-color': config.color }}>
              {config.icon}
              <span>{config.name}</span>
            </div>

            {/* Icône de statut */}
            <div className="verify-icon">
              {status === 'verifying' && (
                <div className="spinner">
                  <div className="spinner-inner"></div>
                </div>
              )}
              {status === 'success' && (
                <div className="status-icon success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="status-icon error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}
              {status === 'pending' && (
                <div className="status-icon pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Messages */}
            <h2 className="verify-title">{message}</h2>
            <p className="verify-subtitle">{subMessage}</p>
            
            {/* Détails de commande */}
            {searchParams.get('orderId') && (
              <div className="order-details">
                <span className="order-label">Order ID:</span>
                <span className="order-id">{searchParams.get('orderId').slice(0, 12)}...</span>
              </div>
            )}
            
            {/* Progress bar */}
            {status === 'verifying' && (
              <div className="verify-progress">
                <div className="progress-track">
                  <div className="progress-bar"></div>
                </div>
                <div className="progress-steps">
                  <span className="step active">Verifying</span>
                  <span className="step">Processing</span>
                  <span className="step">Complete</span>
                </div>
              </div>
            )}

            {/* Actions pour erreur */}
            {status === 'error' && (
              <div className="verify-actions">
                <button className="btn-retry" onClick={() => navigate('/cart')}>
                  Return to Cart
                </button>
                <button className="btn-support" onClick={() => window.open('https://wa.me/48530428877', '_blank')}>
                  Contact Support
                </button>
              </div>
            )}

            {/* Info pour pending */}
            {status === 'pending' && (
              <div className="pending-info">
                <p>You will receive an email confirmation once your payment is verified.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Verify;