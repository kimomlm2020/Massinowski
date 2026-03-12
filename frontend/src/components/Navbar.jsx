// src/components/Navbar.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import '../style/Navbar.scss'

// Icons
import { 
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaUser
} from "react-icons/fa";

// Constants
const NAVBAR_HEIGHT = 100;
const DARK_PAGES = ['/privacy-policy', '/terms-of-use', '/shipping-policy', '/refund-policy'];

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  // CORRECTION: Fonction pour récupérer le token à jour
  const getToken = () => localStorage.getItem('token') || '';
  const [token, setToken] = useState(getToken());
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page should have dark navbar
  const isDarkPage = DARK_PAGES.includes(location.pathname);

  // Use context for cart (real-time)
  const { getCartCount, cartItems } = useContext(ShopContext);
  const [cartCount, setCartCount] = useState(0);

  // CORRECTION: Fonction pour synchroniser le token depuis localStorage
  const syncToken = useCallback(() => {
    const currentToken = getToken();
    setToken(currentToken);
  }, []);

  // Update cart count when cartItems change
  useEffect(() => {
    const count = getCartCount();
    setCartCount(count);
  }, [cartItems, getCartCount]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (visible) {
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    };
  }, [visible]);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // CORRECTION: Synchronisation du token - MULTI-MÉTHODES
  useEffect(() => {
    // Méthode 1: Écouter l'événement 'storage' (entre onglets)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        syncToken();
      }
    };
    
    // Méthode 2: Écouter un événement personnalisé 'authChange' (même onglet)
    const handleAuthChange = () => {
      syncToken();
    };
    
    // Méthode 3: Vérifier périodiquement le token (fallback)
    const intervalId = setInterval(() => {
      const currentToken = getToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000); // Vérifie toutes les secondes

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(intervalId);
    };
  }, [syncToken, token]);

  // CORRECTION: Synchroniser quand la route change (navigation)
  useEffect(() => {
    syncToken();
  }, [location.pathname, syncToken]);

  // Scroll to hero section
  const scrollToHero = () => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'home' } });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setVisible(false);
    setDropdownOpen(false);
  };

  // Scroll to specific section
  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - NAVBAR_HEIGHT;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
    setVisible(false);
    setDropdownOpen(false);
  };

  // Handle scroll from navigation state
  useEffect(() => {
    let timeoutId;
    
    if (location.pathname === '/') {
      const state = location.state;
      if (state?.scrollTo) {
        timeoutId = setTimeout(() => {
          if (state.scrollTo === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const element = document.getElementById(state.scrollTo);
            if (element) {
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - NAVBAR_HEIGHT;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }
          navigate('/', { replace: true, state: {} });
        }, 100);
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location, navigate]);

  // Sync cart across tabs and custom events
  useEffect(() => {
    const handleCartUpdate = () => {
      const count = getCartCount();
      setCartCount(count);
    };

    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [getCartCount]);

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  // Handle profile click
  const handleProfileClick = (e) => {
    e.stopPropagation();
    // CORRECTION: Synchroniser le token avant de vérifier
    const currentToken = getToken();
    if (currentToken && !token) {
      setToken(currentToken);
    }
    
    if (currentToken || token) {
      toggleDropdown(e);
    } else {
      navigate('/login');
    }
    setVisible(false);
  };

  // Navigate to profile
  const goToProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
    setVisible(false);
  };

  // Navigate to orders
  const goToOrders = () => {
    navigate('/orders');
    setDropdownOpen(false);
    setVisible(false);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setDropdownOpen(false);
    navigate('/login');
    setVisible(false);
    // Dispatch event pour notifier les autres composants
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setVisible(false);
  };

  // Fermer la dropdown quand on navigue ailleurs
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <div className={`navbar ${scrolled ? 'scrolled' : ''} ${isDarkPage ? 'navbar-dark-page' : ''}`}>
      <div className={`nav-container ${isDarkPage ? 'nav-container-dark' : ''}`}>
        {/* Logo */}
        <div className="logo-container">
          <Link to='/' onClick={scrollToHero}>
            <img src={assets.logo} className='navbar-logo' alt="massinowski" />
          </Link>
        </div>

        {/* Navigation Desktop */}
        <ul className='navbar-menu'>
          <li className='nav-link' onClick={scrollToHero}>
            <p>HOME</p>
            <hr className='nav-indicator' />
          </li>
          <li className='nav-link' onClick={() => scrollToSection('about')}>
            <p>ABOUT</p>
            <hr className='nav-indicator' />
          </li>
          <li className='nav-link' onClick={() => { navigate('/programs'); setDropdownOpen(false); }}>
            <p>PROGRAMS</p>
            <hr className='nav-indicator' />
          </li>
          <li className='nav-link' onClick={() => scrollToSection('testimonials')}>
            <p>TESTIMONIALS</p>
            <hr className='nav-indicator' />
          </li>
          <li className='nav-link' onClick={() => { navigate('/transformation'); setDropdownOpen(false); }}>
            <p>TRANSFORMATIONS</p>
            <hr className='nav-indicator' />
          </li>
          <li className='nav-link' onClick={() => scrollToSection('contact')}>
            <p>CONTACT</p>
            <hr className='nav-indicator' />
          </li>
        </ul>

        {/* Actions */}
        <div className='navbar-actions'>
          <div className='profile-group' ref={dropdownRef}>
            <button 
              type="button"
              className={`icon-btn user-btn ${dropdownOpen ? 'active' : ''}`} 
              onClick={handleProfileClick}
              aria-label={token ? "Profile menu" : "Login"}
              aria-expanded={dropdownOpen}
            >
              <FaUser />
            </button>
            
            {/* CORRECTION: Condition améliorée avec vérification localStorage */}
            {(token || getToken()) && dropdownOpen && (
              <div className='dropdown-menu' onClick={(e) => e.stopPropagation()}>
                <div className='dropdown-content'>
                  <button type="button" className='dropdown-item' onClick={goToProfile}>
                    My profile
                  </button>
                  <button type="button" className='dropdown-item' onClick={goToOrders}>
                    Orders
                  </button>
                  <button type="button" className='dropdown-item logout-item' onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link to='/cart' className='cart-link' aria-label="Cart">
            <button type="button" className='icon-btn cart-btn'>
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          </Link>

          {/* Menu Toggle Button */}
          <button 
            type="button"
            className={`menu-toggle-btn ${visible ? 'active' : ''}`} 
            onClick={() => setVisible(!visible)}
            aria-label="Toggle menu"
            aria-expanded={visible}
          >
            {visible ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <div className={`mobile-sidebar ${visible ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className='sidebar-content'>
          <div className='sidebar-logo-container'>
            <Link to='/' onClick={closeMobileMenu}>
              <img src={assets.logo} className='sidebar-logo' alt="massinowski" />
            </Link>
          </div>
          
          <button 
            type="button"
            className='close-btn' 
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
          
          <nav className='sidebar-nav'>
            <ul className='sidebar-nav-list'>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { scrollToHero(); }}>
                  HOME
                </button>
              </li>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { scrollToSection('about'); }}>
                  ABOUT
                </button>
              </li>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { navigate('/programs'); closeMobileMenu(); }}>
                  PROGRAMS
                </button>
              </li>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { scrollToSection('testimonials'); }}>
                  TESTIMONIALS
                </button>
              </li>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { navigate('/transformation'); closeMobileMenu(); }}>
                  TRANSFORMATIONS
                </button>
              </li>
              <li>
                <button type="button" className='sidebar-link' onClick={() => { scrollToSection('contact'); }}>
                  CONTACT
                </button>
              </li>
            </ul>
          </nav>
          
          <div className='sidebar-footer'>
            {!(token || getToken()) ? (
              <div className='auth-buttons'>
                <button type="button" onClick={() => { navigate('/login'); closeMobileMenu(); }} className='auth-btn login'>
                  LOGIN
                </button>
              </div>
            ) : (
              <div className='auth-buttons'>
                <button type="button" onClick={logout} className='auth-btn logout'>
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar;
