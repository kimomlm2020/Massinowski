import React, { useContext, useState, useEffect, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { toast } from 'react-toastify';
import '../style/PlaceOrder.scss';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'États-Unis' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'MA', name: 'Maroc' },
  { code: 'DZ', name: 'Algérie' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CD', name: 'Congo-Kinshasa' },
  { code: 'CG', name: 'Congo-Brazzaville' },
  { code: 'GA', name: 'Gabon' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MU', name: 'Maurice' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'AU', name: 'Australie' },
  { code: 'BR', name: 'Brésil' },
  { code: 'CN', name: 'Chine' },
  { code: 'IN', name: 'Inde' },
  { code: 'JP', name: 'Japon' },
  { code: 'MX', name: 'Mexique' },
  { code: 'RU', name: 'Russie' },
  { code: 'ZA', name: 'Afrique du Sud' },
  { code: 'KR', name: 'Corée du Sud' },
  { code: 'AE', name: 'Émirats arabes unis' },
  { code: 'SA', name: 'Arabie saoudite' },
  { code: 'QA', name: 'Qatar' },
  { code: 'TR', name: 'Turquie' }
];

const PlaceOrder = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [method, setMethod] = useState('paypal'); // Par défaut PayPal
  const [loading, setLoading] = useState(false);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  
  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'FR'
  });

  const { 
    cartItems, 
    getCartAmount, 
    currency, 
    backendUrl, 
    token, 
    setCartItems,
    clearCart,
    user 
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  
  const totalAmount = getCartAmount ? getCartAmount() : 0;

  useEffect(() => {
    if (user) {
      setAddressData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const getUserId = useCallback(() => {
    if (user && user._id) return user._id;
    if (user && user.id) return user.id;
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.userId || decoded.id || decoded.sub || decoded._id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }, [token, user]);

  // PayPal Payment Handler
  const handlePayPalPayment = useCallback(async () => {
    setLoading(true);
    
    const userId = getUserId();
    
    if (!userId) {
      toast.error('Authentication error. Please login again.');
      setLoading(false);
      navigate('/login');
      return false;
    }
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/paypal`,
        {
          userId: userId,
          items: cartItems,
          amount: totalAmount,
          address: addressData
        },
        { headers: { token } }
      );

      if (response.data?.success && response.data?.approval_url) {
        window.location.href = response.data.approval_url;
        return true;
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'PayPal payment failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, cartItems, totalAmount, addressData, getUserId, navigate]);

  // Bank Transfer Handler
  const handleBankTransfer = useCallback(async () => {
    setLoading(true);
    
    const userId = getUserId();
    
    if (!userId) {
      toast.error('Authentication error. Please login again.');
      setLoading(false);
      navigate('/login');
      return false;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/bank-transfer`,
        {
          userId: userId,
          items: cartItems,
          amount: totalAmount,
          address: addressData
        },
        { headers: { token } }
      );

      if (response.data?.success) {
        if (typeof clearCart === 'function') {
          clearCart();
        } else if (typeof setCartItems === 'function') {
          setCartItems([]);
        }
        localStorage.removeItem('cart');
        
        toast.success('✅ Order placed! Check your email for bank transfer details.', {
          autoClose: 8000,
          position: "top-center"
        });
        
        setConfirmationData({
          type: 'bank-transfer',
          order: response.data.order,
          message: 'Please check your email for complete bank transfer instructions.'
        });
        setShowConfirmation(true);
        
        return true;
      } else {
        throw new Error(response.data?.message || 'Unknown error');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Order failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, cartItems, totalAmount, addressData, clearCart, setCartItems, getUserId, navigate]);

  // COD Handler
  const handleCOD = useCallback(async () => {
    setLoading(true);
    
    const userId = getUserId();
    
    if (!userId) {
      toast.error('Authentication error. Please login again.');
      setLoading(false);
      navigate('/login');
      return false;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cod`,
        {
          userId: userId,
          items: cartItems,
          amount: totalAmount,
          address: addressData
        },
        { headers: { token } }
      );

      if (response.data?.success) {
        if (typeof clearCart === 'function') {
          clearCart();
        } else if (typeof setCartItems === 'function') {
          setCartItems([]);
        }
        localStorage.removeItem('cart');
        
        toast.success('✅ Order confirmed! You will pay on delivery.', {
          autoClose: 8000,
          position: "top-center"
        });
        
        setConfirmationData({
          type: 'cod',
          order: response.data.order,
          message: 'Our team will contact you within 24 hours to schedule delivery.'
        });
        setShowConfirmation(true);
        
        return true;
      } else {
        throw new Error(response.data?.message || 'Unknown error');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Order failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, cartItems, totalAmount, addressData, clearCart, setCartItems, getUserId, navigate]);

  const onSubmitHandler = useCallback(async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/programs');
      return;
    }

    const userId = getUserId();
    
    if (!userId) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    const validations = [
      { check: !addressData.email?.includes('@'), msg: 'Please enter a valid email' },
      { check: !addressData.firstName?.trim(), msg: 'Please enter your first name' },
      { check: !addressData.lastName?.trim(), msg: 'Please enter your last name' },
      { check: !addressData.street?.trim(), msg: 'Please enter your street address' },
      { check: !addressData.city?.trim(), msg: 'Please enter your city' },
      { check: !addressData.zipcode?.trim(), msg: 'Please enter your postal code' },
      { check: !addressData.country, msg: 'Please select your country' }
    ];

    for (const validation of validations) {
      if (validation.check) {
        toast.error(validation.msg);
        return;
      }
    }

    if (loading) return;

    let success = false;
    
    switch(method) {
      case 'paypal':
        success = await handlePayPalPayment();
        break;
      case 'bank-transfer':
        success = await handleBankTransfer();
        break;
      case 'cod':
        success = await handleCOD();
        break;
      default:
        toast.error('Please select a payment method');
        return;
    }
  }, [method, token, addressData, loading, cartItems, navigate, handlePayPalPayment, handleBankTransfer, handleCOD, getUserId]);

  const updateAddress = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  const ConfirmationPage = ({ data }) => {
    const isBankTransfer = data.type === 'bank-transfer';
    
    return (
      <div style={{
        maxWidth: '700px',
        margin: '60px auto',
        padding: '40px',
        background: '#000',
        border: '3px solid #D4AF37',
        borderRadius: '16px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          ✅
        </div>
        
        <h1 style={{ 
          color: '#D4AF37', 
          fontSize: '28px', 
          marginBottom: '15px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {isBankTransfer ? 'Order Placed Successfully!' : 'Order Confirmed!'}
        </h1>
        
        <p style={{ 
          color: '#fff', 
          fontSize: '18px', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          {isBankTransfer ? (
            <>
              Please complete your <strong style={{ color: '#D4AF37' }}>bank transfer</strong> to finalize your order.
              <br />
              <span style={{ color: '#888', fontSize: '16px' }}>
                Check your email: <strong style={{ color: '#D4AF37' }}>{addressData.email}</strong>
              </span>
            </>
          ) : (
            <>
              You chose <strong style={{ color: '#D4AF37' }}>Cash on Delivery</strong>.
              <br />
              <span style={{ color: '#888', fontSize: '16px' }}>
                Pay <strong style={{ color: '#D4AF37' }}>{currency}{data.order?.amount?.toFixed(2) || totalAmount}</strong> when your order arrives.
              </span>
            </>
          )}
        </p>
        
        <div style={{
          background: '#0a0a0a',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '30px',
          textAlign: 'left',
          border: '1px solid #333'
        }}>
          <h3 style={{ 
            color: '#D4AF37', 
            marginBottom: '20px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Order Details
          </h3>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Order Reference:</span>
            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {data.order?.reference || data.order?._id?.slice(-8) || 'N/A'}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Total Amount:</span>
            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '20px' }}>
              {currency}{data.order?.amount?.toFixed(2) || totalAmount}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Payment Method:</span>
            <span style={{ 
              background: isBankTransfer ? '#D4AF37' : '#4CAF50',
              color: '#000',
              padding: '5px 12px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {isBankTransfer ? '🏦 Bank Transfer' : '💵 Cash on Delivery'}
            </span>
          </div>
        </div>
        
        <div style={{
          background: isBankTransfer ? '#1a0a0a' : '#0a1a0a',
          borderLeft: `4px solid ${isBankTransfer ? '#D4AF37' : '#4CAF50'}`,
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left',
          borderRadius: '0 8px 8px 0'
        }}>
          <h4 style={{ 
            color: isBankTransfer ? '#D4AF37' : '#4CAF50',
            marginTop: 0,
            marginBottom: '10px'
          }}>
            {isBankTransfer ? '💡 Next Steps:' : '🚚 Delivery Info:'}
          </h4>
          <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
            {isBankTransfer ? (
              <>
                1. Check your email for bank details<br/>
                2. Transfer <strong style={{ color: '#D4AF37' }}>{currency}{data.order?.amount?.toFixed(2) || totalAmount}</strong> to our account<br/>
                3. Use reference: <strong style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{data.order?.reference || 'N/A'}</strong><br/>
                4. Your order will be activated within 24-48h
              </>
            ) : (
              <>
                • Our team will call you at <strong style={{ color: '#4CAF50' }}>{addressData.phone}</strong> within 24h<br/>
                • Prepare exact amount: <strong style={{ color: '#4CAF50' }}>{currency}{data.order?.amount?.toFixed(2) || totalAmount}</strong><br/>
                • Pay when you receive your order
              </>
            )}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/orders')}
            style={{
              background: 'transparent',
              color: '#D4AF37',
              border: '2px solid #D4AF37',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#D4AF37',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  if (loading && (method === 'bank-transfer' || method === 'cod' || method === 'paypal')) {
    return (
      <div className="app place-order-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="place-order-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #333',
            borderTop: '4px solid #D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '30px'
          }} />
          <h2 style={{ color: '#D4AF37', marginBottom: '15px' }}>
            Processing your order...
          </h2>
          <p style={{ color: '#888' }}>
            Please wait while we create your order
          </p>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  if (showConfirmation && confirmationData) {
    return (
      <div className="app place-order-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <ConfirmationPage data={confirmationData} />
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  return (
    <div className="app place-order-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <div className="place-order-container">
        <h1 className="page-title">Complete Your Order</h1>
        
        <div className="order-grid">
          <div className="delivery-info">
            <h2>Contact Information</h2>
            <form onSubmit={onSubmitHandler} noValidate>
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="First Name *"
                  value={addressData.firstName}
                  onChange={(e) => updateAddress('firstName', e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Last Name *"
                  value={addressData.lastName}
                  onChange={(e) => updateAddress('lastName', e.target.value)}
                  required
                />
              </div>
              
              <input 
                type="email" 
                placeholder="Email *"
                value={addressData.email}
                onChange={(e) => updateAddress('email', e.target.value)}
                required
              />
              
              <input 
                type="tel" 
                placeholder="Phone *"
                value={addressData.phone}
                onChange={(e) => updateAddress('phone', e.target.value)}
                required
              />

              <h3 className="section-subtitle">Shipping Address</h3>
              
              <input 
                type="text" 
                placeholder="Street Address *"
                value={addressData.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                required
              />
              
              <input 
                type="text" 
                placeholder="Apartment, Suite, Unit, etc. (Optional)"
                value={addressData.apartment}
                onChange={(e) => updateAddress('apartment', e.target.value)}
              />

              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="City *"
                  value={addressData.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="State / Province / Region"
                  value={addressData.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                />
              </div>

              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="ZIP / Postal Code *"
                  value={addressData.zipcode}
                  onChange={(e) => updateAddress('zipcode', e.target.value)}
                  required
                />
                
                <select
                  value={addressData.country}
                  onChange={(e) => updateAddress('country', e.target.value)}
                  required
                  className="country-select"
                >
                  <option value="">Select Country *</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="payment-methods">
                <h3>Payment Method</h3>
                
                {[
                  // ⭐ MÉTHODES ACTIVES EN PREMIER
                  { id: 'paypal', label: '🅿️ PayPal', sublabel: 'Fast & Secure Payment', disabled: false },
                  { id: 'bank-transfer', label: '🏦 Direct Bank/Wire Transfer', sublabel: 'International SWIFT/IBAN', disabled: false },
                  { id: 'cod', label: '💵 Cash on Delivery', sublabel: 'Available in select countries', disabled: false },
                  
                  // ⭐ MÉTHODES DÉSACTIVÉES (SOON)
                  { id: 'stripe', label: '💳 Credit/Debit Card', sublabel: 'Powered by Stripe', disabled: true },
                  { id: 'razorpay', label: '💳 Razorpay', sublabel: 'Indian Payment Gateway', disabled: true },
                  { id: 'crypto', label: '₿ Crypto Payment', sublabel: 'Coming soon', disabled: true }
                ].map(({ id, label, sublabel, disabled }) => (
                  <label 
                    key={id}
                    className={`payment-option ${method === id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value={id}
                      checked={method === id}
                      onChange={() => !disabled && setMethod(id)}
                      disabled={disabled}
                    />
                    <div className="payment-label">
                      <span className="main-label">{label}</span>
                      <span className="sub-label">{sublabel}</span>
                    </div>
                    {disabled && <small className="loading-text"> (Soon)</small>}
                  </label>
                ))}
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading || !cartItems?.length}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ${currency}${totalAmount}`
                )}
              </button>
            </form>
          </div>

          <div className="cart-total">
            <h2>Order Summary</h2>
            <div className="cart-items-summary">
              {cartItems?.map((item, index) => (
                <div key={item.id || index} className="summary-item">
                  <div className="item-info">
                    <span className="item-icon">{item.icon || '📋'}</span>
                    <div>
                      <p className="item-name">{item.name || 'Unknown'}</p>
                      <p className="item-details">{item.level || 'Standard'} • {item.duration || '/month'}</p>
                    </div>
                  </div>
                  <span className="item-price">{currency}{item.price || 0}</span>
                </div>
              ))}
            </div>
            
            <div className="total-row">
              <span>Subtotal ({cartItems?.length || 0} items)</span>
              <span>{currency}{totalAmount}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>{currency}{totalAmount}</span>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default PlaceOrder;