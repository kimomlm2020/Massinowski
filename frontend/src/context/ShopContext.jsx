import React, { createContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "€"; 
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const delivery_fee = 0; 
  
  const navigate = useNavigate();
  
  const [programs, setPrograms] = useState([]); 
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // ✅ DÉCLARER LOGOUT EN PREMIER (avant tout usage)
  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/');
  }, [navigate]);

  // ✅ CRÉER API APRÈS LOGOUT
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: backendUrl,
      headers: { 'Content-Type': 'application/json' }
    });

    instance.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.token = currentToken;
      }
      return config;
    });

    // ✅ Gérer 401 dans l'intercepteur réponse
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout(); 
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl, logout]); // ✅ logout en dépendance

  const loadCartFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => 
            item && 
            item.type === 'program' && 
            (item.id || item.programId) && 
            Number(item.price) > 0
          );
        }
      }
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
    return [];
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    
    const initialCart = loadCartFromStorage();
    setCartItems(initialCart);
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
    
    initRef.current = true;
    setIsInitialized(true);
  }, [loadCartFromStorage]);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }, 100);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, isInitialized]);

  // ✅ USEEFFECT QUI UTILISE API ET LOGOUT (déclarés avant)
  useEffect(() => {
    if (!token || !isInitialized) return;

    const loadUserData = async () => {
      try {
        const [profileRes, cartRes] = await Promise.all([
          api.get('/api/user/profile'),
          api.post('/api/cart/get', {})
        ]);

        if (profileRes.data.success) {
          setUser(profileRes.data.user);
          localStorage.setItem('user', JSON.stringify(profileRes.data.user));
        }

        if (cartRes.data.success && Array.isArray(cartRes.data.cartData)) {
          const serverCart = cartRes.data.cartData.filter(item => 
            item.type === 'program' && (item.id || item.programId) && item.price > 0
          );
          
          setCartItems(prev => {
            const localIds = new Set(prev.map(i => i.id || i.programId));
            const newFromServer = serverCart.filter(i => !localIds.has(i.id || i.programId));
            return [...prev, ...newFromServer];
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // 401 géré par l'intercepteur api
      }
    };

    loadUserData();
  }, [token, isInitialized, api]); // ✅ logout retiré des deps (géré par intercepteur)

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/program/list`);
        if (data.success) {
          setPrograms(data.programs.map(prog => ({
            id: prog._id,
            _id: prog._id,
            name: prog.name,
            title: prog.name,
            price: prog.price,
            priceNumber: prog.price,
            priceDisplay: `${prog.price}${currency}`,
            level: prog.level,
            category: prog.category,
            subCategory: prog.subCategory,
            popular: prog.popular,
            image: prog.image,
            description: prog.description,
            fullDescription: prog.fullDescription || prog.description,
            bestFor: prog.bestFor || 'Everyone',
            support: prog.support || 'Standard support',
            type: 'program',
            icon: getIconForCategory(prog.category),
            duration: prog.duration || 'Ongoing', // ← CORRIGÉ : utilise la durée du backend
            features: prog.features || []
          })));
        }
      } catch (error) {
        console.log('Error fetching programs:', error);
        setPrograms(getFallbackPrograms());
      }
    };

    loadPrograms();
  }, [backendUrl, currency]);

  const getIconForCategory = (category) => {
    const icons = { 
      'Fitness': '🏋️', 
      'Nutrition': '🥗', 
      'Yoga': '🧘', 
      'Cardio': '🏃', 
      'Strength': '💪',
      'Coaching': '🎯'
    };
    return icons[category] || '📋';
  };

  const getFallbackPrograms = () => [
    {
      id: 'standard',
      _id: 'standard',
      name: 'Standard',
      price: 180,
      level: 'Base',
      category: 'Coaching',
      type: 'program',
      icon: '📊',
      duration: '4 weeks', // ← CORRIGÉ : durée réaliste au lieu de '/month'
      features: ["Personalized training plan", "Personalized nutrition plan"]
    },
    {
      id: 'advanced',
      _id: 'advanced',
      name: 'Advanced',
      price: 450,
      level: 'Intermediate',
      category: 'Coaching',
      popular: true,
      type: 'program',
      icon: '🚀',
      duration: '8 weeks', // ← CORRIGÉ : durée réaliste
      features: ["Weekly updates", "WhatsApp support"]
    },
    {
      id: 'vip',
      _id: 'vip',
      name: 'VIP',
      price: 650,
      level: 'Elite',
      category: 'Coaching',
      type: 'program',
      icon: '👑',
      duration: '12 weeks', // ← CORRIGÉ : durée réaliste
      features: ["Daily support", "Full accountability"]
    }
  ];

  const addToCart = useCallback((item) => {
    if (!item || item.type !== 'program') {
      toast.error('Only programs can be added to cart');
      return;
    }

    const programId = item.id || item._id || item.programId;
    if (!programId) {
      toast.error('Invalid program: missing ID');
      return;
    }

    const isAlreadyInCart = cartItems.some(i => 
      (i.id === programId || i.programId === programId)
    );
    
    if (isAlreadyInCart) {
      toast.info('This program is already in your cart');
      return;
    }

    const cartItem = {
      programId: String(programId),
      id: String(programId),
      name: item.name || item.title || 'Unknown Program',
      price: Number(item.price) || 0,
      type: 'program',
      icon: item.icon || '📋',
      level: item.level || 'Beginner',
      duration: item.duration || 'Ongoing', // ← CORRIGÉ : garde la durée réelle
      quantity: 1
    };

    setCartItems(prev => [...prev, cartItem]);
    toast.success(`${cartItem.name} added to cart!`);
  }, [cartItems]);

  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => 
      item.id !== itemId && item.programId !== itemId
    ));
    toast.info('Program removed from cart');
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.info('Cart cleared');
  }, []);

  const cartCount = useMemo(() => 
    cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  , [cartItems]);

  const cartAmount = useMemo(() => 
    cartItems.reduce((total, item) => 
      total + ((Number(item.price) || 0) * (item.quantity || 1)), 0)
  , [cartItems]);

  const isInCart = useCallback((programId) => {
    if (!programId) return false;
    return cartItems.some(item => 
      item.id === programId || item.programId === programId
    );
  }, [cartItems]);

  const value = {
    programs,
    currency,
    delivery_fee,
    cartItems,
    setCartItems,
    cartCount,
    cartAmount,
    addToCart,
    removeFromCart,
    getCartCount: () => cartCount,
    getCartAmount: () => cartAmount,
    isInCart,
    clearCart,
    token,
    setToken,
    user,
    setUser,
    logout,
    navigate,
    backendUrl,
    api,
    isLoading,
    setIsLoading,
    isInitialized
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;