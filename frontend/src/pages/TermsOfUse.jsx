// TermsOfUse.jsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../style/LegalPages.scss";

const termsSections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: "By using our site and services, you fully agree to these terms of use. If you do not agree to these terms, please do not use our services."
  },
  {
    id: "services",
    title: "Description of Services",
    content: "Massinowski Coaching offers personalized training programs, online sports coaching, and nutrition advice. Results may vary depending on each client's commitment and physical condition."
  },
  {
    id: "payments",
    title: "Payments and Refunds",
    content: "Payments are due at the time of order. Refunds are available within 14 days if the program has not been accessed. Personalized programs are non-refundable once delivered."
  },
  {
    id: "responsibilities",
    title: "Client Responsibilities",
    content: "You agree to provide accurate information, follow safety instructions, consult a physician before starting any program, and respect payment deadlines."
  },
  {
    id: "intellectual",
    title: "Intellectual Property",
    content: "All programs, documents, and training methods are the exclusive property of Massinowski Coaching. Any unauthorized reproduction or distribution is strictly prohibited."
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: "Massinowski Coaching is not responsible for injuries occurring during training. Each client is responsible for their own safety and must adapt exercises to their physical condition."
  },
  {
    id: "modifications",
    title: "Modifications to Terms",
    content: "We reserve the right to modify these terms at any time. Users will be notified of significant changes through the website or by email."
  }
];

function TermsOfUse() {
  return (
    <div className="legal-page"> {/* Added missing wrapper */}
      <Navbar />

      <main className="legal-main">
        {/* Hero */}
        <section className="legal-hero">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1>Terms of Use</h1>
              <p className="last-updated">Last updated: December 15, 2024</p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="legal-content">
          <div className="container">
            <motion.div
              className="intro-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p>
                Welcome to Massinowski Coaching. By accessing or using our
                services, you agree to comply with the following terms and
                conditions. Please read them carefully.
              </p>
            </motion.div>

            <div className="legal-sections">
              {termsSections.map((section) => (
                <motion.div
                  key={section.id}
                  className="legal-section"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Medical Disclaimer */}
            <motion.div
              className="medical-disclaimer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="disclaimer-warning">
                <h3>⚠️ Important Medical Notice</h3>
                <p>
                  Always consult your physician before starting any exercise
                  program. These programs are intended for generally healthy
                  individuals. Massinowski Coaching declines all responsibility
                  for injuries resulting from misuse or improper execution of
                  exercises.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default TermsOfUse;
