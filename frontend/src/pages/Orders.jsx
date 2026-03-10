import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../style/Orders.scss';

const Orders = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token, backendUrl, currency } = useContext(ShopContext);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        toast.error('Please login to view orders');
        return;
      }

      // ✅ Envoyer un body vide, le middleware authUser ajoutera userId
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {}, // Body vide - userId extrait du token côté serveur
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserOrders();
    }
  }, [token]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#00d084';
      case 'processing':
        return '#f39c12';
      case 'pending':
        return '#D4AF37';
      case 'cancelled':
        return '#ff4757';
      default:
        return '#a0a0a0';
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'No address';
    const parts = [
      addr.firstName && addr.lastName && `${addr.firstName} ${addr.lastName}`,
      addr.street,
      addr.apartment,
      addr.city,
      addr.state,
      addr.zipcode || addr.zipCode,
      addr.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="app orders-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="orders-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app orders-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <div className="orders-container">
        <h1 className="page-title">My Programs</h1>
        
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</span>
                    <span className="order-date">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div 
                    className="order-status" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status || 'Pending'}
                  </div>
                </div>

                <div className="programs-list">
                  {order.items?.map((item, idx) => (
                    <div className="program-item" key={idx}>
                      <div className="program-image-wrapper">
                        <img 
                          src={item.image?.[0] ? `${backendUrl}/uploads/${item.image[0]}` : assets.upload_area}
                          alt={item.name}
                          onError={(e) => e.target.src = assets.upload_area}
                        />
                        <span className="program-icon">{item.icon || '📋'}</span>
                      </div>
                      
                      <div className="program-info">
                        <h3>{item.name || 'Program'}</h3>
                        <div className="badges">
                          {item.level && <span className="badge level">{item.level}</span>}
                          {item.category && <span className="badge category">{item.category}</span>}
                        </div>
                        <p className="price">{currency}{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <span className={`payment-badge ${order.payment ? 'paid' : 'pending'}`}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                  <span className="total">{currency}{order.amount}</span>
                </div>

                <div className="order-address">
                  <p>{formatAddress(order.address)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <button onClick={() => window.location.href = '/programs'}>
              Browse Programs
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;