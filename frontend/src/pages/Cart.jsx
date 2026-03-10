import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { toast } from 'react-toastify';
import '../style/Cart.scss';

const Cart = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { 
    cartItems, // ✅ UTILISER DIRECTEMENT DU CONTEXT
    removeFromCart, 
    currency, 
    isLoading,
    isInitialized
  } = useContext(ShopContext);

  // ✅ SUPPRESSION DU STATE LOCAL PROBLÉMATIQUE
  // Pas de useState pour localCart ! Utiliser cartItems directement

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    // ✅ PAS DE setLocalCart ici, le context met à jour automatiquement
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/place-order');
  };

  const handleBrowsePrograms = () => {
    navigate('/programs');
  };

  // ✅ FILTRAGE MÉMOÏSÉ des items valides
  const validCartItems = useMemo(() => {
    return cartItems.filter(item => 
      item && 
      item.type === 'program' && 
      (item.id || item.programId) && 
      Number(item.price) >= 0
    );
  }, [cartItems]);

  // Calculs dérivés
  const itemCount = useMemo(() => 
    validCartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [validCartItems]
  );

  const totalAmount = useMemo(() => 
    validCartItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = item.quantity || 1;
      return acc + (price * qty);
    }, 0),
    [validCartItems]
  );

  // ✅ CHARGEMENT initial
  if (!isInitialized || isLoading) {
    return (
      <div className="app cart-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ VIDE
  if (validCartItems.length === 0) {
    return (
      <div className="app cart-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        
        <div className="cart-empty">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="empty-content"
          >
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items yet</p>
            <motion.button
              className="btn-primary"
              onClick={handleBrowsePrograms}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Programs
            </motion.button>
          </motion.div>
        </div>
        
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  // ✅ AVEC ITEMS
  return (
    <div className="app cart-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <div className="cart-container">
        <div className="cart-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Cart
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </motion.p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <AnimatePresence mode="popLayout">
              {validCartItems.map((item, index) => (
                <motion.div
                  key={item.id || item.programId} // ✅ CLÉ STABLE
                  className="cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <div className="program-item">
                    <div className="item-icon">
                      {item.icon || '📋'}
                    </div>
                    
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      {(item.level || item.duration) && (
                        <p className="item-meta">
                          {item.level} • {item.duration}
                        </p>
                      )}
                      {item.features && item.features.length > 0 && (
                        <div className="item-features">
                          {item.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="feature-tag">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="item-price-section">
                      <span className="price">
                        {item.priceDisplay || `${currency}${item.price || 0}`}
                      </span>
                      <span className="quantity">Qty: {item.quantity || 1}</span>
                    </div>
                    
                    <motion.button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id || item.programId)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Remove item"
                    >
                      ×
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            className="cart-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span>{currency}{totalAmount}</span>
            </div>
            
            <div className="summary-row">
              <span>Service Fee</span>
              <span>{currency}0</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-price">{currency}{totalAmount}</span>
            </div>
            
            <motion.button
              className="btn-checkout"
              onClick={handleCheckout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Checkout
            </motion.button>
            
            <button 
              className="btn-continue"
              onClick={handleBrowsePrograms}
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Cart;