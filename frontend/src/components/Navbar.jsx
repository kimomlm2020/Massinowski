// ============================================
// NAVBAR.JSX - VERSION ISOLÉE BEM
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
  const [navbarHeight, setNavbarHeight] = useState(100);

  const token = localStorage.getItem("token");

  const isDarkPage = [
    "/privacy-policy",
    "/terms-of-use",
    "/shipping-policy",
    "/refund-policy"
  ].includes(location.pathname);

  // Mettre à jour la hauteur de la navbar dynamiquement
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = navbarRef.current;
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    updateNavbarHeight();
    
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

  // Fonction de scroll avec offset dynamique
  const scrollToSection = useCallback((id) => {
    setTimeout(() => {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const element = document.getElementById(id);
      if (element) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const offset = navbarHeight + 20;
        const scrollPosition = absoluteElementTop - offset;
        
        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth"
        });
        
        setTimeout(() => {
          const currentPos = window.pageYOffset;
          const targetPos = Math.max(0, scrollPosition);
          if (Math.abs(currentPos - targetPos) > 50) {
            window.scrollTo(0, targetPos);
          }
        }, 500);
      }
    }, menuOpen ? 350 : 100);
  }, [navbarHeight, menuOpen]);

  // Navigation handler
  const handleNavigation = (link) => {
    const wasMenuOpen = menuOpen;
    setMenuOpen(false);
    setDropdownOpen(false);

    if (link.type === "page") {
      navigate(link.path);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: link.path } });
      return;
    }

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
      
      const timer = setTimeout(() => {
        scrollToSection(id);
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
    <nav 
      ref={navbarRef}
      className={`main-navbar ${scrolled ? "main-navbar--scrolled" : ""} ${isDarkPage ? "main-navbar--dark-page" : ""}`}
    >
      <div className="main-navbar__container">
        {/* Logo */}
        <Link to="/" className="main-navbar__logo" onClick={() => scrollToSection("home")}>
          <img src={assets.logo} className="main-navbar__logo-img" alt="logo" />
        </Link>

        {/* Desktop menu */}
        <ul className="main-navbar__menu">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className={`main-navbar__menu-item ${isActive(link) ? "main-navbar__menu-item--active" : ""}`}
              onClick={() => handleNavigation(link)}
            >
              <span className="main-navbar__menu-text">{link.label}</span>
              <span className="main-navbar__menu-indicator"></span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="main-navbar__actions">
          <div className="main-navbar__user-menu" ref={dropdownRef}>
            <button
              className={`main-navbar__icon-btn main-navbar__user-btn ${dropdownOpen ? "main-navbar__icon-btn--active" : ""}`}
              onClick={() => token ? setDropdownOpen(!dropdownOpen) : navigate("/login")}
            >
              <FaUser />
              {token && <FaChevronDown className={`main-navbar__chevron ${dropdownOpen ? "main-navbar__chevron--open" : ""}`} />}
            </button>

            {token && dropdownOpen && (
              <div className="main-navbar__dropdown">
                <button className="main-navbar__dropdown-item" onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>
                  <FaUserCircle /> Profile
                </button>
                <button className="main-navbar__dropdown-item" onClick={() => { navigate("/orders"); setDropdownOpen(false); }}>
                  <FaShoppingBag /> Orders
                </button>
                <button className="main-navbar__dropdown-item" onClick={logout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>

          <Link to="/cart" className="main-navbar__cart-link">
            <button className="main-navbar__icon-btn main-navbar__cart-btn">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="main-navbar__cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </button>
          </Link>

          <button
            className="main-navbar__toggle-btn"
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
        className={`main-navbar__sidebar ${menuOpen ? "main-navbar__sidebar--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div
          className="main-navbar__sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />

        <div className="main-navbar__sidebar-content">
          <div className="main-navbar__sidebar-header">
            <span className="main-navbar__sidebar-title">Menu</span>
            <button
              className="main-navbar__sidebar-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          <ul className="main-navbar__sidebar-menu" role="menu">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="main-navbar__sidebar-item" role="none">
                <button
                  className={`main-navbar__sidebar-link ${isActive(link) ? "main-navbar__sidebar-link--active" : ""}`}
                  onClick={() => handleNavigation(link)}
                  role="menuitem"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {token ? (
            <div className="main-navbar__sidebar-footer">
              <button 
                className="main-navbar__sidebar-link main-navbar__sidebar-link--secondary"
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
              >
                <FaUserCircle /> Profile
              </button>
              <button 
                className="main-navbar__sidebar-link main-navbar__sidebar-link--secondary"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="main-navbar__sidebar-footer">
              <button 
                className="main-navbar__sidebar-link main-navbar__sidebar-link--primary"
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
              >
                <FaUser /> Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;