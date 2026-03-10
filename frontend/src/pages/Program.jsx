import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import "../style/Program.scss";

import { 
  FaCheckCircle, FaClock, FaUserGraduate, FaWhatsapp, 
  FaEnvelope, FaCalendarCheck, FaSpinner, FaShoppingCart, FaArrowRight 
} from 'react-icons/fa';

const WHATSAPP_NUMBER = '48530428877';
const DEFAULT_CURRENCY = '€';

// ========== DEFAULT FEATURES PAR NIVEAU (correspondance backend) ==========

const DEFAULT_FEATURES = {
  Beginner: [
    "Personalized training plan (split, volume, intensity)",
    "Personalized nutrition plan",
    "Monthly progress check-in via email",
    "Basic supplement suggestions",
    "Exercise library access",
    "Basic nutrition guide",
    "Technical support by email",
    "Monthly program revisions"
  ],
  Intermediate: [
    "Personalized training plan (updated every 2 weeks)",
    "Full macro-based nutrition plan",
    "Weekly check-ins with progress analysis",
    "Supplement strategy",
    "Email / WhatsApp support for questions",
    "Detailed progress analysis",
    "Real-time adjustments",
    "Priority support access",
    "Training cycle planning",
    "Personalized motivational support"
  ],
  Advanced: [
    "Custom training + cardio + mobility",
    "Macro-based meal structure with weekly updates",
    "Full supplement coaching",
    "Weekly check-ins with form review",
    "Daily WhatsApp access for tweaks and support",
    "Faster responses and more interaction",
    "Monthly private consultations",
    "Seasonal planning",
    "Exclusive masterclass access",
    "Video technique analysis"
  ],
  Elite: [
    "Fully customized training system",
    "Daily macro tracking with adjustments",
    "Complete supplement stack management",
    "Daily check-ins with video review",
    "24/7 WhatsApp priority access",
    "Immediate response guarantee",
    "Weekly private consultations",
    "Quarterly strategic planning",
    "VIP masterclass access + 1-on-1 sessions",
    "Weekly video technique analysis",
    "Priority booking for events",
    "Custom merchandise & gear"
  ]
};

const LEVEL_SUPPORT = {
  Beginner: "Monthly check-ins via email",
  Intermediate: "WhatsApp access, weekly check-ins",
  Advanced: "Daily WhatsApp, private consultations, priority response",
  Elite: "24/7 VIP support, immediate response, dedicated coach"
};

const LEVEL_BEST_FOR = {
  Beginner: "Independent athletes wanting expert structure and monthly guidance",
  Intermediate: "Clients serious about transformation needing weekly support",
  Advanced: "Pros, influencers, and dedicated athletes requiring daily support",
  Elite: "Elite performers, celebrities, and professionals needing white-glove service"
};

// Détermine le niveau depuis le programme backend
const getProgramLevel = (program) => {
  if (!program) return 'Beginner';
  
  const level = program.level || '';
  if (['Beginner', 'Intermediate', 'Advanced', 'Elite'].includes(level)) {
    return level;
  }
  
  const title = (program.title || program.name || '').toLowerCase();
  if (title.includes('elite') || title.includes('vip')) return 'Elite';
  if (title.includes('advanced')) return 'Advanced';
  if (title.includes('intermediate')) return 'Intermediate';
  
  return 'Beginner';
};

// Normalise les données du programme
const normalizeProgramData = (program) => {
  if (!program) return null;
  
  const level = getProgramLevel(program);
  
  return {
    ...program,
    _id: program._id || program.id || `temp-${Date.now()}`,
    title: program.title || program.name || 'Untitled Program',
    subtitle: program.subtitle || `${level} Level Program`,
    priceNumber: Number(program.priceNumber || parseFloat(program.price) || 0),
    priceDisplay: program.priceDisplay || `${program.price || 0}${DEFAULT_CURRENCY}`,
    duration: program.duration || 'month',
    level: level,
    features: Array.isArray(program.features) && program.features.length > 0 
      ? program.features 
      : DEFAULT_FEATURES[level],
    bestFor: program.bestFor || LEVEL_BEST_FOR[level],
    support: program.support || LEVEL_SUPPORT[level],
    fullDescription: program.fullDescription || program.description || 'No description available',
    icon: program.icon || '',
    popular: Boolean(program.popular)
  };
};

const Program = () => {
    const { programId } = useParams();
    const navigate = useNavigate();
    const { programs, addToCart, isInCart } = useContext(ShopContext);
    
    const [programData, setProgramData] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgramData = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        try {
            if (!programs || programs.length === 0) {
                setError('Programs not loaded');
                setIsLoading(false);
                return;
            }

            const foundProgram = programs.find(item => 
                (item._id === programId) || (item.id === programId)
            );
            
            if (foundProgram) {
                setProgramData(normalizeProgramData(foundProgram));
            } else {
                setError('Program not found');
            }
        } catch (err) {
            setError('Failed to load program details');
        } finally {
            setIsLoading(false);
        }
    }, [programId, programs]);

    useEffect(() => {
        fetchProgramData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchProgramData]);

    const handleAddToCart = useCallback(() => {
        if (!programData) return;
        
        const cartItem = {
            _id: programData._id,
            id: programData._id,
            name: programData.title,
            price: programData.priceNumber,
            priceDisplay: programData.priceDisplay,
            type: 'program',
            icon: programData.icon,
            level: programData.level,
            duration: programData.duration,
            features: programData.features.slice(0, 3),
            quantity: 1
        };

        addToCart(cartItem);
    }, [programData, addToCart]);

    const handleWhatsApp = useCallback(() => {
        if (!programData) return;
        const message = `Hi, I'm interested in the ${programData.title} program (${programData.level} level). Can you tell me more?`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }, [programData]);

    const handleNavigate = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="program-page">
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <div className="program-loading">
                    <FaSpinner className="spinner-icon" />
                    <p>Loading program details...</p>
                </div>
                <Footer />
                <WhatsAppFloat />
            </div>
        );
    }

    if (error || !programData) {
        return (
            <div className="program-page">
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <div className="program-error">
                    <h2>Oops!</h2>
                    <p>{error || 'Program not found'}</p>
                    <button onClick={() => handleNavigate('/programs')} className="btn-back">
                        Back to Programs
                    </button>
                </div>
                <Footer />
                <WhatsAppFloat />
            </div>
        );
    }

    const inCart = isInCart ? isInCart(programData._id) : false;
    const displayFeatures = programData.features.slice(0, 4);

    return (
        <div className="program-page">
            <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            <section className="program-hero">
                <div className="hero-overlay"></div>
                <div className="container">
                    <nav className="program-breadcrumb">
                        <button onClick={() => handleNavigate('/')} className="breadcrumb-link">Home</button>
                        <span>/</span>
                        <button onClick={() => handleNavigate('/programs')} className="breadcrumb-link">Programs</button>
                        <span>/</span>
                        <span className="breadcrumb-current">{programData.title}</span>
                    </nav>
                    
                    <div className="program-hero-content">
                        <motion.div 
                            className="program-icon-large" 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {programData.icon}
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            {programData.title}
                        </motion.h1>
                        
                        <motion.p 
                            className="program-subtitle" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {programData.subtitle}
                        </motion.p>
                        
                        <motion.div 
                            className={`program-level-badge level-${programData.level.toLowerCase()}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {programData.level} Level • {programData.features.length} Features
                        </motion.div>
                        
                        {programData.popular && (
                            <motion.div 
                                className="popular-badge-large"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                ⭐ Most Popular
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            <section className="program-main">
                <div className="container">
                    <div className="program-grid">
                        <div className="program-details">
                            <div className="program-tabs">
                                {['description', 'features', 'support'].map((tab) => (
                                    <button
                                        key={tab}
                                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="tab-content">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'description' && (
                                        <motion.div 
                                            key="description" 
                                            className="description-content" 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="main-description">{programData.fullDescription}</p>
                                            <div className="best-for-box">
                                                <h3>🎯 Ideal for</h3>
                                                <p>{programData.bestFor}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'features' && (
                                        <motion.div 
                                            key="features" 
                                            className="features-content" 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3>All {programData.features.length} features included:</h3>
                                            <ul className="features-list">
                                                {programData.features.map((feature, index) => (
                                                    <motion.li 
                                                        key={index} 
                                                        initial={{ opacity: 0, x: -20 }} 
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <FaCheckCircle className="feature-icon" />
                                                        <span>{feature}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}

                                    {activeTab === 'support' && (
                                        <motion.div 
                                            key="support" 
                                            className="support-content" 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="support-box">
                                                <h3>Support Level: {programData.level}</h3>
                                                <p>{programData.support}</p>
                                                <div className="support-icons">
                                                    {programData.level === 'Beginner' && (
                                                        <>
                                                            <div className="support-item">
                                                                <FaEnvelope />
                                                                <span>Email support</span>
                                                            </div>
                                                            <div className="support-item">
                                                                <FaCalendarCheck />
                                                                <span>Monthly check-ins</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {programData.level === 'Intermediate' && (
                                                        <>
                                                            <div className="support-item">
                                                                <FaWhatsapp />
                                                                <span>WhatsApp access</span>
                                                            </div>
                                                            <div className="support-item">
                                                                <FaEnvelope />
                                                                <span>Email support</span>
                                                            </div>
                                                            <div className="support-item">
                                                                <FaCalendarCheck />
                                                                <span>Weekly check-ins</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {(programData.level === 'Advanced' || programData.level === 'Elite') && (
                                                        <>
                                                            <div className="support-item">
                                                                <FaWhatsapp />
                                                                <span>Daily WhatsApp</span>
                                                            </div>
                                                            <div className="support-item">
                                                                <FaUserGraduate />
                                                                <span>Private consultations</span>
                                                            </div>
                                                            <div className="support-item">
                                                                <FaClock />
                                                                <span>Priority response</span>
                                                            </div>
                                                            {programData.level === 'Elite' && (
                                                                <div className="support-item">
                                                                    <FaCheckCircle />
                                                                    <span>24/7 VIP access</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* DESKTOP SIDEBAR - Hidden on mobile */}
                        <aside className="program-sidebar">
                            <div className="price-card">
                                <div className="price-header">
                                    <span className="price-label">{programData.level} Program</span>
                                    <div className="price-container">
                                        <span className="price">{programData.priceDisplay}</span>
                                        <span>/{programData.duration}</span>
                                    </div>
                                </div>
                                
                                <div className="price-features">
                                    <h4>Top features:</h4>
                                    <ul>
                                        {displayFeatures.map((feature, index) => (
                                            <li key={index}>
                                                <FaCheckCircle /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="sidebar-actions">
                                    {inCart ? (
                                        <button 
                                            className="btn-view-cart-large" 
                                            onClick={() => handleNavigate('/cart')}
                                        >
                                            <FaShoppingCart /> View in Cart
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn-add-to-cart-large" 
                                                onClick={handleAddToCart}
                                            >
                                                <FaShoppingCart /> Add to Cart
                                            </button>
                                            <button 
                                                className="btn-whatsapp-large" 
                                                onClick={handleWhatsApp}
                                            >
                                                <FaWhatsapp /> Ask on WhatsApp
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* MOBILE STICKY BAR - Fixed at bottom on small screens */}
            <div className="mobile-sticky-bar">
                <div className="mobile-price-info">
                    <span className="mobile-price">{programData.priceDisplay}</span>
                    <span className="mobile-duration">{programData.duration}</span>
                </div>
                <div className="mobile-actions">
                    {inCart ? (
                        <button 
                            className="btn-cart-mobile" 
                            onClick={() => handleNavigate('/cart')}
                        >
                            <FaShoppingCart /> View Cart
                        </button>
                    ) : (
                        <button 
                            className="btn-cart-mobile" 
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>
                    )}
                    <button 
                        className="btn-whatsapp-mobile" 
                        onClick={handleWhatsApp}
                    >
                        <FaWhatsapp />
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Program;