import React from 'react';
import { motion } from 'framer-motion';
import '../style/LegalPages.scss'

function TermsOfUse() {
  const termsSections = [
    {
      title: "Acceptance of Terms",
      content: "By using our site and services, you fully agree to these terms of use. If you do not agree to these terms, please do not use our services."
    },
    {
      title: "Description of Services",
      content: "Massinowski Coaching offers personalized training programs, online sports coaching, and nutrition advice. Results may vary depending on each client's commitment and physical condition."
    },
    {
      title: "Payments and Refunds",
      content: "Payments are due at the time of order. Refunds are available within 14 days if the program has not been accessed. Personalized programs are non-refundable once delivered."
    },
    {
      title: "Client Responsibilities",
      content: "You agree to: provide accurate information, follow safety instructions, consult a physician before starting, and respect payment deadlines."
    },
    {
      title: "Intellectual Property",
      content: "All programs, documents, and training methods are the exclusive property of Massinowski Coaching. Any unauthorized reproduction or distribution is prohibited."
    },
    {
      title: "Limitation of Liability",
      content: "We are not responsible for injuries occurring during training. Each client is responsible for their own safety and must adapt exercises to their physical condition."
    },
    {
      title: "Modifications to Terms",
      content: "We reserve the right to modify these terms at any time. Users will be notified of major changes by email."
    }
  ];

  return (
    <div className="app">
      <section className="terms-hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Terms of Use</h1>
            <p className="last-updated">
              Last updated: December 15, 2024
            </p>
          </motion.div>
        </div>
      </section>

      <section className="terms-content">
        <div className="container">
          <motion.div
            className="intro-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p>
              Welcome to Massinowski Coaching. By using our services, you agree to the following conditions. Please read them carefully.
            </p>
          </motion.div>

          <div className="terms-sections">
            {termsSections.map((section, index) => (
              <motion.div
                key={index}
                className="terms-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3>{section.title}</h3>
                <p>{section.content}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="medical-disclaimer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="disclaimer-warning">
              <h3>⚠️ Important Medical Notice</h3>
              <p>
                Consult your physician before starting any new exercise program. These programs are designed for healthy individuals. Massinowski Coaching disclaims any liability in case of injury.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfUse;