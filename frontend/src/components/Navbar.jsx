// ============================================
// NAVBAR.JSX - VERSION CORRIGÉE POUR MOBILE SCROLL
// ============================================

import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import "../style/Navbar.scss";

import {
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaUser,
  FaUserCircle,
  FaShoppingBag,
  FaSignOutAlt,
  FaChevronDown
} from "react-icons/fa";

const NAV_LINKS = [
  { label: "Home", path: "home", type: "anchor" },
  { label: "About", path: "about", type: "anchor" },
  { label: "Programs", path: "/programs", type: "page" },
  { label: "Testimonials", path: "testimonials", type: "anchor" },
  { label: "Transformations", path: "/transformation", type: "page" },
  { label: "Contact", path: "contact", type: "anchor" }
];

const Navbar = () => {
  const { getCartCount } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(100); // Hauteur dynamique

  const token = localStorage.getItem("token");

  const isDarkPage = [
    "/privacy-policy",
    "/terms-of-use",
    "/shipping-policy",
    "/refund-policy"
  ].includes(location.pathname);

  // CORRECTION: Mettre à jour la hauteur de la navbar dynamiquement
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = navbarRef.current;
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
        // Mettre à jour aussi la variable CSS pour les autres composants
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    updateNavbarHeight();
    
    // Observer les changements de classe (scrolled)
    const observer = new MutationObserver(updateNavbarHeight);
    if (navbarRef.current) {
      observer.observe(navbarRef.current, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('resize', updateNavbarHeight);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, [scrolled]);

  // Cart count
  useEffect(() => {
    setCartCount(getCartCount());
  }, [getCartCount]);

  // Navbar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when sidebar open
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = `calc(100% - ${scrollbarWidth}px)`;
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [menuOpen]);

  // CORRECTION: Fonction de scroll avec offset dynamique
  const scrollToSection = useCallback((id) => {
    // Petit délai pour laisser le DOM se stabiliser (important sur mobile)
    setTimeout(() => {
      // Handle home section specially
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const element = document.getElementById(id);
      if (element) {
        // CORRECTION: Calcul précis de la position avec offset dynamique
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        
        // Offset = hauteur navbar + marge de sécurité (20px)
        const offset = navbarHeight + 20;
        
        const scrollPosition = absoluteElementTop - offset;
        
        // CORRECTION: Utiliser scrollTo avec behavior smooth et position calculée
        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth"
        });
        
        // CORRECTION: Fallback pour mobile si smooth scroll ne fonctionne pas
        setTimeout(() => {
          const currentPos = window.pageYOffset;
          const targetPos = Math.max(0, scrollPosition);
          
          // Si on n'est pas arrivé à destination (différence > 50px), forcer le scroll
          if (Math.abs(currentPos - targetPos) > 50) {
            window.scrollTo(0, targetPos);
          }
        }, 500);
      }
    }, menuOpen ? 350 : 100); // Délai plus long si on ferme le menu mobile
  }, [navbarHeight, menuOpen]);

  // Navigation handler
  const handleNavigation = (link) => {
    // Fermer le menu mobile d'abord
    const wasMenuOpen = menuOpen;
    setMenuOpen(false);
    setDropdownOpen(false);

    if (link.type === "page") {
      navigate(link.path);
      return;
    }

    // Si pas sur la home page, naviguer d'abord
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: link.path } });
      return;
    }

    // Sur la home page, scroll directement
    // Si le menu était ouvert, attendre la fermeture
    if (wasMenuOpen) {
      setTimeout(() => {
        scrollToSection(link.path);
      }, 300);
    } else {
      scrollToSection(link.path);
    }
  };

  // Scroll after redirect
  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const id = location.state.scrollTo;
      
      // Attendre que la page soit chargée
      const timer = setTimeout(() => {
        scrollToSection(id);
        // Nettoyer l'état
        navigate("/", { replace: true, state: null });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state?.scrollTo, navigate, scrollToSection]);

  const logout = () => {
    localStorage.removeItem("token");
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (link) => {
    if (link.type === "page") {
      return location.pathname === link.path;
    }
    if (location.pathname === "/") {
      const current = location.hash.replace("#", "") || "home";
      return current === link.path;
    }
    return false;
  };

  return (
    <div 
      ref={navbarRef}
      className={`navbar ${scrolled ? "scrolled" : ""} ${isDarkPage ? "navbar-dark-page" : ""}`}
    >
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo-container" onClick={() => scrollToSection("home")}>
          <img src={assets.logo} className="navbar-logo" alt="logo" />
        </Link>

        {/* Desktop menu */}
        <ul className="navbar-menu">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className={`nav-link ${isActive(link) ? "active" : ""}`}
              onClick={() => handleNavigation(link)}
            >
              <p>{link.label}</p>
              <hr className="nav-indicator" />
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              className={`icon-btn user-btn ${dropdownOpen ? "active" : ""}`}
              onClick={() => token ? setDropdownOpen(!dropdownOpen) : navigate("/login")}
            >
              <FaUser />
              {token && <FaChevronDown className={`chevron ${dropdownOpen ? "open" : ""}`} />}
            </button>

            {token && dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>
                  <FaUserCircle /> Profile
                </button>
                <button onClick={() => { navigate("/orders"); setDropdownOpen(false); }}>
                  <FaShoppingBag /> Orders
                </button>
                <button onClick={logout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>

          <Link to="/cart" className="cart-link">
            <button className="icon-btn cart-btn">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </button>
          </Link>

          <button
            className="menu-toggle-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div 
        className={`mobile-sidebar ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />

        <div className="sidebar-content">
          <div className="sidebar-header">
            <span className="sidebar-title">Menu</span>
            <button
              className="close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          <ul className="sidebar-menu" role="menu">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="sidebar-item" role="none">
                <button
                  className={`sidebar-link ${isActive(link) ? "active" : ""}`}
                  onClick={() => handleNavigation(link)}
                  role="menuitem"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {token ? (
            <div className="sidebar-footer">
              <button 
                className="sidebar-link secondary"
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
              >
                <FaUserCircle /> Profile
              </button>
              <button 
                className="sidebar-link secondary"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="sidebar-footer">
              <button 
                className="sidebar-link primary"
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
              >
                <FaUser /> Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
