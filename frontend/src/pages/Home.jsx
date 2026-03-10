import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from "react-router-dom";
import '../style/App.scss'
// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import BookingForm from '../components/BookingForm';
import ContactForm from '../components/ContactForm';

// Data
import { statsData } from '../data/statsData';
import { transformationsData } from '../data/transformationsData';
import { testimonialsData } from '../data/testimonialsData';

// Images
import heroImage from "../assets/images/background_gm_optimized.avif";
import aboutImage from "../assets/images/coach_gm_optimized.avif";
import coachImage from "../assets/images/about_gm_optimized.avif";

// Icons
import { FaAward, FaUsers, FaChartLine, FaStar, FaWhatsapp, FaInstagram } from "react-icons/fa";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const openWhatsApp = () => {
    const phoneNumber = "48530428877";
    const message = "Hello, I'm interested in your coaching programs!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Scroll management
  useEffect(() => {
    const scrollToAnchor = sessionStorage.getItem('scrollToAnchor');
    if (scrollToAnchor) {
      setTimeout(() => {
        const element = document.querySelector(scrollToAnchor);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        sessionStorage.removeItem('scrollToAnchor');
      }, 500);
    }

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 800);
    }
  }, [location]);

  return (
    <div className="app">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="hero-overlay"></div>
        
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Massinowski Coaching
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Push your limits to <span className="highlight">reveal your potential</span>.
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              onClick={() => setShowBooking(true)}
            >
              Book a session Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              onClick={() => navigate('/programs')}
            >
              Discover Our Programs
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <div className="hero-stats">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <motion.div
            className="about-content"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="about-image">
              <img src={aboutImage || coachImage} alt="Coach Massinowski" />
              <div className="experience-badge">
                <FaAward />
                <span>10+ years experience</span>
              </div>
            </div>
            
            <div className="about-text">
              <h2>About Me</h2>
              <div className="about-description">
                <p>I am Massinowski, a passionate coach with over 10 years of experience in personalized coaching. My mission is to help you achieve your goals, whether they are athletic, mental or nutritional.</p>
                
                <div className="about-features">
                  <div className="feature-item">
                    <FaUsers className="feature-icon" />
                    <div>
                      <h4>Personalized Approach</h4>
                      <p>Programs adapted to your specific needs</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <FaChartLine className="feature-icon" />
                    <div>
                      <h4>Guaranteed Results</h4>
                      <p>Rigorous follow-up for lasting results</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <FaStar className="feature-icon" />
                    <div>
                      <h4>Excellence</h4>
                      <p>The best methods for your success</p>
                    </div>
                  </div>
                </div>
                
                <div className="about-cta">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={openWhatsApp}
                  >
                    Contact me on WhatsApp
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>    

      {/* Vision Section */}
      <section className="vision" id="vision">
        <div className="container">
          <motion.div
            className="vision-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2>My Vision</h2>
            <p>I believe in a holistic approach to wellness, combining physical, mental and nutrition for lasting transformations.</p>
            <div className="vision-principles">
              <div className="principle">
                <h4>Excellence</h4>
                <p>Push your limits and achieve excellence</p>
              </div>
              <div className="principle">
                <h4>Authenticity</h4>
                <p>Stay true to yourself in your journey</p>
              </div>
              <div className="principle">
                <h4>Transformation</h4>
                <p>Change your life step by step</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Testimonials</h2>
            <p>What my clients say about me</p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.author}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformations Section */}
      <TransformationsSection transformations={transformationsData} />

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <motion.div
            className="contact-content"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="contact-info">
              <h2>Contact Me</h2>
              <p>Ready to start your transformation?</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <FaWhatsapp />
                  <div>
                    <h4>WhatsApp</h4>
                    <p>Quick response within 24h</p>
                    <button onClick={openWhatsApp}>Send message</button>
                  </div>
                </div>
                
                <div className="contact-method">
                  <FaInstagram />
                  <div>
                    <h4>Instagram</h4>
                    <p>Follow my news</p>
                    <button onClick={() => window.open("https://instagram.com/massinowski", "_blank")}>
                      Follow me
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <>
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowBooking(false)}
            />
            
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close-btn"
                onClick={() => setShowBooking(false)}
                aria-label="Close modal"
              >
                ×
              </button>
              
              <div className="modal-content">
                <BookingForm onClose={() => setShowBooking(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Transformations Section Component
function TransformationsSection({ transformations }) {
  return (
    <section className="transformations" id="transformations">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Successful Transformations</h2>
          <p>Discover the impressive results of our clients thanks to our personalized training and nutrition system</p>
        </motion.div>

        <div className="transformations-grid">
          {transformations.map((transformation, index) => (
            <TransformationCard key={index} transformation={transformation} index={index} />
          ))}
        </div>

        <motion.div 
          className="results-banner"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="banner-content">
            <h3>Ready for your transformation?</h3>
            <p>Join 250+ clients who have already achieved their goals</p>
            <div className="banner-stats">
              <div className="banner-stat">
                <span className="number">98%</span>
                <span className="label">Satisfaction rate</span>
              </div>
              <div className="banner-stat">
                <span className="number">12kg</span>
                <span className="label">Average Weight Loss</span>
              </div>
              <div className="banner-stat">
                <span className="number">100%</span>
                <span className="label">Personalized Programs</span>
              </div>
            </div>
            <Link to="/transformation">
              <button className="cta-button">Start my transformation</button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TransformationCard({ transformation, index }) {
  return (
    <motion.div
      className="transformation-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="comparison-slider">
        <div className="before-after-container">
          <img 
            src={transformation.beforePhoto} 
            alt={`${transformation.author} before`}
            className="before-photo"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300/cccccc/969696?text=Before";
            }}
          />
          <img 
            src={transformation.afterPhoto} 
            alt={`${transformation.author} after`}
            className="after-photo"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300/cccccc/969696?text=After";
            }}
          />
          <div className="slider-handle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M15.5 12.8l-5.7 5.6c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l4.9-5-4.9-5c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l5.7 5.6c.4.5.4 1.1 0 1.6z"/>
            </svg>
          </div>
        </div>
        <div className="photo-labels">
          <span className="label-before">Before</span>
          <span className="label-after">After</span>
        </div>
      </div>

      <div className="transformation-details">
        <div className="results-stats">
          <div className="stat">
            <span className="stat-value">-{transformation.weightLost}kg</span>
            <span className="stat-label">Weight loss</span>
          </div>
          <div className="stat">
            <span className="stat-value">{transformation.duration}</span>
            <span className="stat-label">Duration</span>
          </div>
          <div className="stat">
            <span className="stat-value">+{transformation.muscleGain}%</span>
            <span className="stat-label">Muscle gain</span>
          </div>
        </div>

        <div className="testimonial-content">
          <p className="testimonial-text">"{transformation.testimonial}"</p>
          
          <div className="program-badges">
            <span className="program-badge training">{transformation.programType} Program</span>
            <span className="program-badge diet">{transformation.dietType} Diet</span>
          </div>

          <div className="client-info">
            <div className="client-avatar">
              <img 
                src={transformation.clientAvatar} 
                alt={transformation.author}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/60x60/cccccc/969696?text=Client";
                }}
              />
            </div>
            <div className="client-details">
              <strong>{transformation.author}</strong>
              <span>{transformation.age} years • {transformation.goal}</span>
              <div className="client-rating">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill={i < transformation.rating ? "#FFD700" : "#E0E0E0"}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Home;