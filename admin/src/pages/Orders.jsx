import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import '../style/Orders.scss';
import { useNavigate } from 'react-router-dom';
import { 
  FaCreditCard, 
  FaPaypal, 
  FaStripe, 
  FaUniversity, 
  FaBitcoin, 
  FaMoneyBillWave,
  FaApplePay,
  FaGooglePay,
  FaQuestionCircle,
  FaEye,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token: token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse() || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    
    try {
      const response = await axios.post(
        backendUrl + '/api/order/update-status',
        { 
          orderId: orderId, 
          status: newStatus
        },
        { headers: { token: token } }
      );

      if (response.data.success) {
        toast.success('Status updated');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ⭐ NOUVEAU : Confirmer un virement bancaire
  const confirmBankTransfer = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/admin/confirm-transfer',
        { orderId },
        { headers: { token: token } }
      );

      if (response.data.success) {
        toast.success('Bank transfer confirmed! Customer notified.');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const viewOrderDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const statusOptions = [
    { value: 'OrderPlaced', label: 'Order Placed' },
    { value: 'Packing', label: 'Packing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Out for delivery', label: 'Out for delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusClass = (status) => {
    const statusMap = {
      'OrderPlaced': 'pending',
      'Packing': 'processing',
      'Shipped': 'shipped',
      'Out for delivery': 'shipped',
      'Delivered': 'delivered',
      'pending': 'pending',
      'pending_bank_transfer': 'pending',
      'pending_cod': 'pending',
      'paid': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  const getPaymentMethodConfig = (method) => {
    const configs = {
      stripe: { icon: <FaStripe />, label: 'Stripe', color: '#635BFF' },
      paypal: { icon: <FaPaypal />, label: 'PayPal', color: '#003087' },
      card: { icon: <FaCreditCard />, label: 'Credit Card', color: '#f7ef8a' },
      'bank-transfer': { icon: <FaUniversity />, label: 'Bank Transfer', color: '#00A650' },
      transfer: { icon: <FaUniversity />, label: 'Bank Transfer', color: '#00A650' },
      crypto: { icon: <FaBitcoin />, label: 'Cryptocurrency', color: '#F7931A' },
      applepay: { icon: <FaApplePay />, label: 'Apple Pay', color: '#fff' },
      googlepay: { icon: <FaGooglePay />, label: 'Google Pay', color: '#4285F4' },
      cod: { icon: <FaMoneyBillWave />, label: 'Cash on Delivery', color: '#00d084' },
      cash: { icon: <FaMoneyBillWave />, label: 'Cash', color: '#00d084' }
    };
    return configs[method?.toLowerCase()] || { 
      icon: <FaQuestionCircle />, 
      label: method || 'Unknown', 
      color: '#888' 
    };
  };

  // ⭐ FILTRAGE DES COMMANDES
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending_transfer') return order.status === 'pending_bank_transfer';
    if (filter === 'pending_cod') return order.status === 'pending_cod';
    if (filter === 'paid') return order.status === 'paid' || order.payment === true;
    if (filter === 'unpaid') return order.payment === false;
    return true;
  });

  useEffect(() => {
    if (token) fetchAllOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="page-header">
          <h2>All Orders</h2>
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>All Orders ({filteredOrders.length})</h2>
        
        {/* ⭐ FILTRES */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending_transfer' ? 'active' : ''} 
            onClick={() => setFilter('pending_transfer')}
          >
            Pending Transfer
          </button>
          <button 
            className={filter === 'pending_cod' ? 'active' : ''} 
            onClick={() => setFilter('pending_cod')}
          >
            Pending COD
          </button>
          <button 
            className={filter === 'paid' ? 'active' : ''} 
            onClick={() => setFilter('paid')}
          >
            Paid
          </button>
        </div>
      </div>
      
      <div className="orders-list">
        {filteredOrders.map((order) => {
          const paymentConfig = getPaymentMethodConfig(order.paymentMethod);
          const isPendingTransfer = order.status === 'pending_bank_transfer';
          const isPendingCOD = order.status === 'pending_cod';
          
          return (
            <div className={`order-card ${getStatusClass(order.status)}`} key={order._id}>
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                  <span className="order-date">
                    {new Date(order.date || order.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div 
                  className="payment-method-badge" 
                  style={{ '--payment-color': paymentConfig.color }}
                  title={`Paid with ${paymentConfig.label}`}
                >
                  {paymentConfig.icon}
                  <span>{paymentConfig.label}</span>
                </div>
              </div>
              
              <div className="order-customer">
                <p className="customer-name">{order.address?.firstName} {order.address?.lastName}</p>
                <p className="customer-email">{order.address?.email}</p>
                <p className="customer-phone">{order.address?.phone}</p>
              </div>
              
              <div className="order-details">
                <div className="items-info">
                  <span className="items-count">{order.items?.length || 0} items</span>
                  <ul className="items-list">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <li key={idx}>{item.name} x{item.quantity || 1}</li>
                    ))}
                    {order.items?.length > 2 && <li>+{order.items.length - 2} more...</li>}
                  </ul>
                </div>
                <span className="order-amount">{currency}{order.amount}</span>
              </div>
              
              {/* ⭐ RÉFÉRENCE VIREMENT */}
              {order.bankTransferReference && (
                <div className="bank-reference">
                  <FaUniversity />
                  <div>
                    <span className="ref-label">Bank Transfer Ref:</span>
                    <span className="ref-value">{order.bankTransferReference}</span>
                  </div>
                </div>
              )}
              
              {/* ⭐ STATUT DE PAIEMENT */}
              <div className="payment-status">
                {order.payment ? (
                  <span className="paid-badge">
                    <FaCheckCircle /> Paid
                  </span>
                ) : (
                  <span className="unpaid-badge">
                    <FaClock /> Unpaid
                  </span>
                )}
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status?.replace(/_/g, ' ') || 'Unknown'}
                </span>
              </div>
              
              {/* ⭐ ACTIONS */}
              <div className="order-actions">
                <select
                  className="status-select"
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status || 'OrderPlaced'}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* ⭐ BOUTON CONFIRMER VIREMENT */}
                {isPendingTransfer && (
                  <button 
                    className="confirm-transfer-btn"
                    onClick={() => confirmBankTransfer(order._id)}
                    title="Confirm bank transfer received"
                  >
                    <FaCheckCircle />
                    <span>Confirm Transfer</span>
                  </button>
                )}
                
                <button 
                  className="view-detail-btn"
                  onClick={() => viewOrderDetail(order._id)}
                  title="View order details"
                >
                  <FaEye />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;