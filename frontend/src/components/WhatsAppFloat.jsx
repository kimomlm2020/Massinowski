// src/components/WhatsAppFloat.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

function WhatsAppFloat(props) {
  // Filter out non-DOM props that might cause warnings
  const { jsx, sx, style, className, ...rest } = props;
  
  const openWhatsApp = () => {
    const phoneNumber = "48530428877";
    const message = "Hello, I'm interested in your coaching programs!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      className={`whatsapp-float ${className || ''}`}
      style={style}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      onClick={openWhatsApp}
    >
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-tooltip">Contact me on WhatsApp</span>
    </motion.div>
  );
}

export default WhatsAppFloat;