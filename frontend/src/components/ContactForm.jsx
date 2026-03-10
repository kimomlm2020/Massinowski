// src/components/ContactForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // CONFIGURATION EMAILJS - VARIABLES .ENV
  // ==========================================
  
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_0leb6li";
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_BOOKING || "template_y38lr0l";
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "58mrKdIj-E-2T-bcO";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérification configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('❌ EmailJS configuration manquante:', {
        service: EMAILJS_SERVICE_ID,
        template: EMAILJS_TEMPLATE_ID,
        key: EMAILJS_PUBLIC_KEY
      });
      alert('Configuration EmailJS manquante. Vérifiez votre fichier .env');
      setIsLoading(false);
      return;
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    };

    console.log('📧 Envoi EmailJS:', {
      service: EMAILJS_SERVICE_ID,
      template: EMAILJS_TEMPLATE_ID,
      params: templateParams
    });

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('✅ EmailJS Success:', response);
      alert('Message sent successfully!');
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
    } catch (err) {
      console.error('❌ EmailJS Error:', err);
      console.error('Status:', err?.status);
      console.error('Text:', err?.text);
      alert('Error sending message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>Contact Me</h3>
      
      <div className="form-group">
        <input 
          type="text" 
          name="name"
          placeholder="Name" 
          value={formData.name}
          onChange={handleChange}
          required 
          disabled={isLoading}
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <input 
          type="tel" 
          name="phone"
          placeholder="Phone" 
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
        />
        <select 
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          <option value="">Subject</option>
          <option value="coaching-mental">Mental Coaching</option>
          <option value="coaching-sportif">Sports Coaching</option>
          <option value="nutrition">Nutrition</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <textarea 
        name="message"
        placeholder="Your message" 
        value={formData.message}
        onChange={handleChange}
        rows="5" 
        required
        disabled={isLoading}
      ></textarea>
      
      <motion.button
        type="submit"
        className="btn-primary"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </motion.button>
    </form>
  );
}

export default ContactForm;