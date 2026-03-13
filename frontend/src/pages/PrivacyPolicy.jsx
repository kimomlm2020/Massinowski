// PrivacyPolicy.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../style/LegalPages.scss';

function PrivacyPolicy() {
  const privacySections = [
    {
      title: "Information Collection",
      content: "We collect information that you provide directly to us during registration, booking, or purchase of our programs: name, email, phone, fitness goals, and payment information."
    },
    {
      title: "Data Usage",
      content: "Your data allows us to: personalize your training program, contact you for follow-up, process your payments, and improve our services."
    },
    {
      title: "Data Protection",
      content: "We implement advanced security measures including SSL encryption, secure storage, and restricted access to your personal information."
    },
    {
      title: "Data Sharing",
      content: "We do not sell or rent your data to third parties. Only our certified coaches have access to it for your personalized support."
    },
    {
      title: "Cookies and Tracking",
      content: "We use essential cookies for site functionality and analytical cookies to improve your user experience."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, modify, or delete your personal data. Contact us at any time to exercise these rights."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="legal-page">
      <Navbar />
      
      <main className="legal-main">
        {/* Hero Section */}
        <section className="legal-hero">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1>Privacy Policy</h1>
              <p className="last-updated">Last updated: December 15, 2024</p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="legal-content">
          <div className="container">
            <motion.div
              className="intro-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p>
                At Massinowski Coaching, your privacy is our priority. This policy explains how we collect, use, and protect your information.
              </p>
            </motion.div>

            <motion.div 
              className="legal-sections numbered-sections"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {privacySections.map((section, index) => (
                <motion.div
                  key={index}
                  className="legal-section"
                  variants={itemVariants}
                >
                  <div className="section-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="section-content">
                    <h3>{section.title}</h3>
                    <p>{section.content}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="contact-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>Questions and Contact</h3>
              <p>For any questions regarding this privacy policy, contact us:</p>
              <div className="contact-methods">
                <a href="mailto:contact@massinowski.com" className="contact-link">
                  <span className="icon">📧</span>
                  contact@massinowski.com
                </a>
                <a href="tel:+48530428877" className="contact-link">
                  <span className="icon">📱</span>
                  +48 530 428 877
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
