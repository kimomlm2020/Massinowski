// src/components/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

function BookingForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    goals: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // ==========================================
  // CONFIGURATION EMAILJS - MODIFIEZ CES VALEURS  // Option 1: Hardcodé (fonctionne immédiatement)
  // ==========================================
    // Option 2: Variables d'environnement (quand .env fonctionnera)
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_0leb6li";
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_BOOKING || "template_y38lr0l";
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "58mrKdIj-E-2T-bcO";

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const getProgramLabel = (programValue) => {
    const programs = {
      'mental': 'Mental Coaching',
      'sport': 'Sports Coaching',
      'nutrition': 'Nutrition'
    };
    return programs[programValue] || programValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    // Vérification configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('❌ EmailJS configuration manquante');
      setSubmitStatus('error');
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const templateParams = {
      to_name: formData.name,
      to_email: formData.email,
      from_name: 'Mass Coaching',
      reply_to: formData.email,
      phone: formData.phone,
      program: getProgramLabel(formData.program),
      goals: formData.goals,
      submission_date: dateStr
    };

    console.log('📧 Envoi EmailJS:', templateParams);

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('✅ EmailJS Success:', response);
      setSubmitStatus('success');
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (err) {
      console.error('❌ EmailJS Error:', err);
      console.error('Status:', err?.status);
      console.error('Message:', err?.message);
      console.error('Text:', err?.text);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLoading, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0',
          padding: '2.5rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          boxShadow: '0 25px 80px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.15)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.1, rotate: 90 } : {}}
          whileTap={!isLoading ? { scale: 0.9 } : {}}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            color: '#f7ef8a',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            opacity: isLoading ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          ×
        </motion.button>

        <h3 style={{
          color: '#f7ef8a',
          fontSize: '1.6rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
          borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
          paddingBottom: '1rem',
          marginTop: '0.5rem',
        }}>
          ✦ BOOK YOUR SESSION ✦
        </h3>
        
        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.9) 0%, rgba(42, 90, 42, 0.9) 100%)',
                border: '1px solid #f7ef8a',
                color: '#f7ef8a',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              ✓ Booking confirmed! Check your email.
            </motion.div>
          )}
          
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(58, 26, 26, 0.9) 0%, rgba(90, 42, 42, 0.9) 100%)',
                border: '1px solid #ff4444',
                color: '#ff6666',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              ✗ Something went wrong. Check console.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              color: '#f7ef8a', 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>
              Full Name *
            </label>
            <input 
              type="text" 
              name="name"
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={handleChange}
              required 
              disabled={isLoading}
              style={{
                backgroundColor: '#252525',
                border: '1px solid #3d3d3d',
                color: '#e0e0e0',
                padding: '14px 16px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              color: '#f7ef8a', 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>
              Email Address *
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={isLoading}
              style={{
                backgroundColor: '#252525',
                border: '1px solid #3d3d3d',
                color: '#e0e0e0',
                padding: '14px 16px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              color: '#f7ef8a', 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>
              Phone Number *
            </label>
            <input 
              type="tel" 
              name="phone"
              placeholder="Enter your phone" 
              value={formData.phone}
              onChange={handleChange}
              required 
              disabled={isLoading}
              style={{
                backgroundColor: '#252525',
                border: '1px solid #3d3d3d',
                color: '#e0e0e0',
                padding: '14px 16px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              color: '#f7ef8a', 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>
              Select Program *
            </label>
            <select 
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{
                backgroundColor: '#252525',
                border: '1px solid #3d3d3d',
                color: '#e0e0e0',
                padding: '14px 16px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '15px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFD700' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              <option value="">Choose a program</option>
              <option value="mental">🧠 Mental Coaching</option>
              <option value="sport">💪 Sports Coaching</option>
              <option value="nutrition">🥗 Nutrition</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: '#f7ef8a', 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>
              Your Goals & Expectations *
            </label>
            <textarea 
              name="goals"
              placeholder="Describe your goals, expectations, and what you'd like to achieve..." 
              value={formData.goals}
              onChange={handleChange}
              rows="4"
              required
              disabled={isLoading}
              style={{
                backgroundColor: '#252525',
                border: '1px solid #3d3d3d',
                color: '#e0e0e0',
                padding: '14px 16px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '15px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit',
                minHeight: '100px',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #f7ef8a, transparent)',
            margin: '1.5rem 0',
            opacity: 0.3,
          }} />

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 12px 30px rgba(255, 215, 0, 0.35)' } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            style={{
              background: 'linear-gradient(135deg, #e4c84d 0%, #f7ef8a 50%, #f7ef8a 100%)',
              color: '#1a1a1a',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: '100%',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span className="spinner" />
                PROCESSING...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2em' }}>✦</span>
                CONFIRM BOOKING
                <span style={{ fontSize: '1.2em' }}>✦</span>
              </span>
            )}
          </motion.button>

          <p style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
            lineHeight: '1.5',
          }}>
            ✦ You will receive a confirmation email with all details ✦
          </p>
        </form>

        <style>{`
          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #1a1a1a;
            border-top: 2px solid #FFD700;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          input:focus, select:focus, textarea:focus {
            border-color: #FFD700 !important;
            box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.15) !important;
            outline: none;
            background-color: #2a2a2a !important;
          }

          input:hover:not(:disabled), select:hover:not(:disabled), textarea:hover:not(:disabled) {
            border-color: #555 !important;
          }

          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }

          div::-webkit-scrollbar-thumb {
            background: rgba(255, 215, 0, 0.3);
            border-radius: 4px;
          }

          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 215, 0, 0.5);
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

export default BookingForm;