import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

// Icons
import { FaFacebookF, FaInstagram, FaYoutube, FaUser } from "react-icons/fa";
import { Phone, Mail, Clock, MapPin, ArrowRight } from "lucide-react";

// Images
import logo from '../assets/images/Logo.avif';
import '../style/Footer.scss';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useContext(ShopContext);

  const handleFooterNavigation = (path, isAnchor = false) => {
    if (isAnchor) {
      if (location.pathname !== '/') {
        navigate('/');
        sessionStorage.setItem('scrollToAnchor', path);
      } else {
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  // Redirection intelligente : Profile si connecté, Login sinon
  const handleAuthNavigation = () => {
    if (token && user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const getCleanPhone = () => "+48530428877";
  const getDisplayPhone = () => "+48 530 428 877";
  const getCleanEmail = () => "contact@massinowski.com";

  const quickLinks = [
    { path: '#home', label: 'Home', isAnchor: true },
    { path: '#about', label: 'About', isAnchor: true },
    { path: '#testimonials', label: 'Testimonials', isAnchor: true },
    { path: '#contact', label: 'Contact', isAnchor: true }
  ];

  // PageLinks dynamique selon l'état de connexion
  const pageLinks = [
    { path: '/programs', label: 'Programs', isAnchor: false },
    { path: '/transformation', label: 'Transformations', isAnchor: false },
    { 
      path: token ? '/profile' : '/login', 
      label: token ? 'My Profile' : 'Login',
      isAnchor: false,
      isAuth: true,
      icon: token ? <FaUser /> : null
    },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, url: 'https://www.facebook.com/massinowski/?locale=fr_CA', label: 'Facebook' },
    { icon: <FaInstagram />, url: 'https://www.instagram.com/massinowski/', label: 'Instagram' },
    { icon: <FaYoutube />, url: 'https://www.youtube.com/@massinowski', label: 'YouTube' }
  ];

  return (
    <footer className="footer">
      {/* Section principale */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            
            {/* Colonne 1: Logo & Description */}
            <div className="footer-brand">
              <div className="logo-wrapper" onClick={() => navigate('/')}>
                <img src={logo} alt="Massinowski Coaching" className="logo-img" />
                <span className="logo-text">Massinowski</span>
              </div>
              <p className="brand-description">
                Every champion has a team behind them. Through personalized sports, 
                mental, and nutritional coaching, we redefine what's possible for your potential.
              </p>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Colonne 2: Quick Links */}
            <div className="footer-column">
              <h4 className="column-title">Quick Links</h4>
              <ul className="link-list">
                {quickLinks.map((item, index) => (
                  <li key={index}>
                    <button 
                      className="footer-link"
                      onClick={() => handleFooterNavigation(item.path, item.isAnchor)}
                    >
                      <ArrowRight className="link-arrow" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3: Pages */}
            <div className="footer-column">
              <h4 className="column-title">Pages</h4>
              <ul className="link-list">
                {pageLinks.map((item, index) => (
                  <li key={index}>
                    {item.isAuth ? (
                      // Bouton spécial pour Login/Profile
                      <button 
                        className={`footer-link auth-link ${token ? 'connected' : ''}`}
                        onClick={handleAuthNavigation}
                      >
                        <span className="link-content">
                          {item.icon && <span className="auth-icon">{item.icon}</span>}
                          {item.label}
                        </span>
                        {token && <span className="status-dot" />}
                      </button>
                    ) : (
                      <button 
                        className="footer-link"
                        onClick={() => handleFooterNavigation(item.path, item.isAnchor)}
                      >
                        <ArrowRight className="link-arrow" />
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 4: Contact */}
            <div className="footer-column">
              <h4 className="column-title">Contact</h4>
              <div className="contact-list">
                <a href={`tel:${getCleanPhone()}`} className="contact-item">
                  <div className="contact-icon-wrapper">
                    <Phone className="contact-icon" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Phone</span>
                    <span className="contact-value">{getDisplayPhone()}</span>
                  </div>
                </a>
                
                <a href={`mailto:${getCleanEmail()}`} className="contact-item">
                  <div className="contact-icon-wrapper">
                    <Mail className="contact-icon" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">{getCleanEmail()}</span>
                  </div>
                </a>
                
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <Clock className="contact-icon" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Hours</span>
                    <span className="contact-value">Mon-Sat: 9am-8pm</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <MapPin className="contact-icon" />
                  </div>
                  <div className="contact-info">
                    <span className="contact-label">Location</span>
                    <span className="contact-value">Warsaw, Poland</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} <span>Massinowski</span>. All rights reserved.
            </p>
            <div className="legal-links">
              {/* ✅ FIXED: Changed from /PrivacyPolicy to /privacy-policy */}
              <button onClick={() => navigate('/privacy-policy')}>
                Privacy Policy
              </button>
              <span className="separator">|</span>
              {/* ✅ FIXED: Changed from /TermsOfUse to /terms-of-use */}
              <button onClick={() => navigate('/terms-of-use')}>
                Terms of Use
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Décoration */}
      <div className="footer-glow" />
    </footer>
  );
}

export default Footer;