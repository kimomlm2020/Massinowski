import React, { useState, useContext, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { toast } from 'react-toastify';
import { 
  FaSpinner, 
  FaShoppingCart, 
  FaCheck, 
  FaArrowRight, 
  FaChevronDown,
  FaDumbbell,
  FaAppleAlt,
  FaUserTie,
  FaRocket,
  FaChartLine,
  FaHeart,
  FaRunning,
  FaMedal,
  FaStar,
  FaCrown,
  FaBolt,
  FaFire,
  FaGem
} from 'react-icons/fa';
import "../style/Programs.scss";

// ========== MAPPING ICÔNES PAR TYPE DE PROGRAMME ==========

// Configuration des icônes par niveau (pour les badges et tags)
const LEVEL_ICONS = {
  Beginner: { icon: FaStar, color: '#10b981', label: 'Beginner' },
  Intermediate: { icon: FaBolt, color: '#f59e0b', label: 'Intermediate' },
  Advanced: { icon: FaFire, color: '#ef4444', label: 'Advanced' },
  Elite: { icon: FaCrown, color: '#8b5cf6', label: 'Elite' }
};

// Mapping intelligent des icônes par mot-clé dans le titre
const getProgramIcon = (plan) => {
  const title = (plan.title || plan.name || '').toLowerCase();
  const subtitle = (plan.subtitle || '').toLowerCase();
  const category = (plan.category || '').toLowerCase();
  const fullText = `${title} ${subtitle} ${category}`;
  
  // Musculation & Force
  if (fullText.match(/(muscle|strength|force|musculation|hypertrophy|powerlifting|bodybuilding|gain|mass|weight lifting)/)) {
    return { icon: FaDumbbell, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  }
  
  // Nutrition & Alimentation
  if (fullText.match(/(nutrition|diet|meal|food|alimentation|repas|macro|calorie|healthy eating|clean eating)/)) {
    return { icon: FaAppleAlt, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
  }
  
  // Coaching Personnel & 1-on-1
  if (fullText.match(/(coaching|personal|1-on-1|private|consultation|mentor|accompagnement|suivi perso)/)) {
    return { icon: FaUserTie, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
  }
  
  // Transformation & Challenge
  if (fullText.match(/(transformation|challenge|90 day|12 week|reset|metamorphosis|change|revolution)/)) {
    return { icon: FaRocket, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' };
  }
  
  // Performance & Athlétisme
  if (fullText.match(/(performance|athletic|sport|competition|endurance|speed|agility|athlete|pro)/)) {
    return { icon: FaChartLine, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  }
  
  // Bien-être & Santé
  if (fullText.match(/(wellness|health|mind|yoga|recovery|mobility|well-being|santé|mental|balance)/)) {
    return { icon: FaHeart, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' };
  }
  
  // Cardio & Conditionnement
  if (fullText.match(/(cardio|conditioning|hiit|fat burn|weight loss|maigrir|perte|running|cycling)/)) {
    return { icon: FaRunning, color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
  }
  
  // Premium & VIP
  if (fullText.match(/(vip|premium|elite|exclusive|gold|platinum|luxury|concierge)/)) {
    return { icon: FaGem, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
  }
  
  // Compétition & Préparation
  if (fullText.match(/(competition|prep|stage|contest|show|photo shoot|beach body)/)) {
    return { icon: FaMedal, color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' };
  }
  
  // Par défaut - icône générique sans croix
  return { icon: FaStar, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
};

// ========== DEFAULT FEATURES PAR NIVEAU ==========

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

const LEVEL_COLORS = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
  Elite: '#8b5cf6'
};

const getProgramLevel = (plan) => {
  if (!plan) return 'Beginner';
  const level = plan.level || '';
  if (['Beginner', 'Intermediate', 'Advanced', 'Elite'].includes(level)) return level;
  
  const title = (plan.title || plan.name || '').toLowerCase();
  if (title.includes('elite') || title.includes('vip')) return 'Elite';
  if (title.includes('advanced')) return 'Advanced';
  if (title.includes('intermediate')) return 'Intermediate';
  return 'Beginner';
};

const getProgramFeatures = (plan) => {
  if (!plan) return DEFAULT_FEATURES.Beginner;
  if (Array.isArray(plan.features) && plan.features.length > 0) return plan.features;
  const level = getProgramLevel(plan);
  return DEFAULT_FEATURES[level] || DEFAULT_FEATURES.Beginner;
};

// Composant pour l'icône de programme avec animation
const ProgramIcon = ({ plan, size = 48 }) => {
  const { icon: IconComponent, color, bg } = getProgramIcon(plan);
  
  return (
    <div 
      className="program-icon-wrapper"
      style={{ 
        background: bg,
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 15px',
        border: `2px solid ${color}40`,
        boxShadow: `0 8px 24px ${color}30`
      }}
    >
      <IconComponent 
        size={size} 
        color={color}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      />
    </div>
  );
};

// Composant pour le badge de niveau
const LevelBadge = ({ level }) => {
  const config = LEVEL_ICONS[level] || LEVEL_ICONS.Beginner;
  const IconComponent = config.icon;
  
  return (
    <div 
      className={`level-badge level-${level.toLowerCase()}`}
      style={{ 
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}50`
      }}
    >
      <IconComponent size={14} style={{ marginRight: '6px' }} />
      <span>{level}</span>
    </div>
  );
};

// Composant pour le tag dans le hero
const LevelTag = ({ level }) => {
  const config = LEVEL_ICONS[level] || LEVEL_ICONS.Beginner;
  const IconComponent = config.icon;
  
  return (
    <motion.div 
      className="hero-level-tag"
      whileHover={{ scale: 1.05, y: -2 }}
      style={{ 
        background: 'rgba(26, 26, 26, 0.9)',
        border: `1px solid ${config.color}60`,
        color: config.color
      }}
    >
      <IconComponent size={18} style={{ marginRight: '8px' }} />
      <span>{level}</span>
    </motion.div>
  );
};

// PlanCard component
const PlanCard = React.memo(({ 
  plan, 
  index, 
  expanded, 
  inCartStatus, 
  onToggle, 
  onCardClick, 
  onAddToCart, 
  onViewDetails 
}) => {
  const planId = plan._id || plan.id || `temp-${index}`;
  const level = getProgramLevel(plan);
  const features = useMemo(() => getProgramFeatures(plan), [plan]);
  const hasMoreFeatures = features.length > 3;

  return (
    <motion.div
      className={`plan-card ${plan.popular ? 'popular' : ''} ${expanded ? 'expanded' : ''} ${inCartStatus ? 'in-cart' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: expanded ? 0 : -5 }}
      onClick={(e) => onCardClick(planId, e)}
      role="article"
      aria-label={`${plan.title || plan.name} program card`}
    >
      {plan.popular && (
        <div className="popular-badge" aria-label="Popular program">
          <FaStar /> POPULAR
        </div>
      )}
      {inCartStatus && (
        <div className="in-cart-badge" aria-label="In cart">
          <FaCheck /> IN CART
        </div>
      )}

      <div className="plan-header">
        <ProgramIcon plan={plan} size={40} />
        <h3>{plan.title || plan.name || 'Untitled Program'}</h3>
        <p className="plan-subtitle">{plan.subtitle || `${level} Level Program`}</p>
        <LevelBadge level={level} />
      </div>

      <div className="plan-price">
        <span className="price">{plan.priceDisplay || `${plan.price || 0}€`}</span>
        <span className="duration">{plan.duration || 'month'}</span>
      </div>

      <div className="plan-description">
        <p>{plan.description || 'No description available'}</p>
      </div>

      <div className="plan-features">
        <h4>Features included ({features.length})</h4>
        
        <ul className="visible-features">
          {features.slice(0, 3).map((feature, idx) => (
            <li key={idx}>
              <span className="feature-check" aria-hidden="true">
                <FaCheck size={14} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="expanded-content"
            >
              <ul className="additional-features">
                {features.slice(3).map((feature, idx) => (
                  <motion.li 
                    key={`additional-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <span className="feature-check" aria-hidden="true">
                      <FaCheck size={14} />
                    </span>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              <div className="plan-best-for">
                <strong>Ideal for</strong>
                <p>{plan.bestFor || LEVEL_BEST_FOR[level]}</p>
              </div>

              <div className="plan-support">
                <strong>Support</strong>
                <p>{plan.support || LEVEL_SUPPORT[level]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasMoreFeatures && (
          <motion.button
            className="btn-show-more"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(planId);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-expanded={expanded}
            aria-label={expanded ? 'Show less features' : 'Show more features'}
            type="button"
          >
            <span>{expanded ? 'Show less' : `View ${features.length - 3} More`}</span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="arrow-icon"
              aria-hidden="true"
            >
              <FaChevronDown />
            </motion.span>
          </motion.button>
        )}
      </div>

      <div className="plan-actions">
        <motion.button
          className="btn-view-details"
          onClick={(e) => onViewDetails(planId, e)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          aria-label={`View details for ${plan.title || plan.name}`}
        >
          View Details <FaArrowRight />
        </motion.button>
        
        <motion.button
          className={`btn-order ${plan.popular ? 'btn-popular' : ''}`}
          onClick={(e) => onAddToCart(plan, e)}
          whileHover={{ scale: inCartStatus ? 1 : 1.05 }}
          whileTap={{ scale: inCartStatus ? 1 : 0.95 }}
          type="button"
          disabled={inCartStatus}
          aria-label={inCartStatus ? 'Already in cart' : `Add ${plan.title || plan.name} to cart`}
          aria-pressed={inCartStatus}
        >
          {inCartStatus ? (
            <><FaCheck /> In Cart</>
          ) : (
            <><FaShoppingCart /> Add to Cart</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
});

PlanCard.displayName = 'PlanCard';

function Programs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const { programs, addToCart, isInCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const validPrograms = useMemo(() => {
    if (!programs || programs.length === 0) return [];
    return programs.filter(plan => plan && (plan._id || plan.id));
  }, [programs]);

  const hasPrograms = validPrograms.length > 0;

  const toggleCardExpansion = useCallback((cardId) => {
    setExpandedCards(prev => {
      const newState = { ...prev, [cardId]: !prev[cardId] };
      const expandedCount = Object.values(newState).filter(Boolean).length;
      if (expandedCount > 3) {
        const firstExpanded = Object.entries(newState).find(([_, v]) => v);
        if (firstExpanded && firstExpanded[0] !== cardId) {
          newState[firstExpanded[0]] = false;
        }
      }
      return newState;
    });
  }, []);

  const handleCardClick = useCallback((planId, e) => {
    if (e.target.closest('button')) return;
    navigate(`/program/${planId}`);
  }, [navigate]);

  const handleAddToCart = useCallback((plan, e) => {
    e.stopPropagation();
    
    if (!plan) {
      toast.error('Invalid program data');
      return;
    }
    
    const planId = plan._id || plan.id;
    if (!planId) {
      toast.error('Program ID not found');
      return;
    }
    
    if (isInCart(planId)) {
      toast.info('This program is already in your cart');
      navigate('/cart');
      return;
    }

    const price = plan.priceNumber || parseFloat(plan.price) || 0;
    if (price <= 0) {
      toast.error('Invalid program price');
      return;
    }

    const level = getProgramLevel(plan);
    const features = getProgramFeatures(plan);
    const iconConfig = getProgramIcon(plan);

    const cartItem = {
      id: planId,
      _id: planId,
      name: plan.title || plan.name || 'Unnamed Program',
      price: price,
      priceDisplay: plan.priceDisplay || `${price}€`,
      type: 'program',
      iconType: iconConfig.icon.name, // Stocke le nom pour récupérer l'icône dans le cart
      level: level,
      duration: plan.duration || 'month',
      features: features.slice(0, 3),
      quantity: 1
    };

    addToCart(cartItem);

  }, [addToCart, isInCart, navigate]);

  const handleViewDetails = useCallback((planId, e) => {
    e.stopPropagation();
    navigate(`/program/${planId}`);
  }, [navigate]);

  if (!programs || programs.length === 0) {
    return (
      <div className="app programs-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="loading-container">
          <FaSpinner className="spinner-icon" aria-hidden="true" />
          <h2>Loading programs...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hasPrograms) {
    return (
      <div className="app programs-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="error-container">
          <h2>No programs available</h2>
          <p>Please check back later or contact support.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app programs-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <section className="programs-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              Our Programs
            </motion.h1>
            <motion.p 
              className="hero-subtitle" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
            >
              Choose the program that matches your goals
            </motion.p>
            <motion.div 
              className="hero-features" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }}
            >
              <LevelTag level="Beginner" />
              <LevelTag level="Intermediate" />
              <LevelTag level="Advanced" />
              <LevelTag level="Elite" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="plans-section">
        <div className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            Our Coaching Plans
          </motion.h2>
        </div>

        <div className="plans-grid" role="list">
          {validPrograms.map((plan, index) => {
            const planId = plan._id || plan.id;
            return (
              <PlanCard
                key={planId}
                plan={plan}
                index={index}
                expanded={!!expandedCards[planId]}
                inCartStatus={isInCart(planId)}
                onToggle={toggleCardExpansion}
                onCardClick={handleCardClick}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
              />
            );
          })}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default Programs;