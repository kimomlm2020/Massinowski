import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaUniversity,
  FaMoneyBillWave,
  FaCreditCard,
  FaBox,
  FaTruck,
  FaHome
} from 'react-icons/fa';
import '../style/OrderDetail.scss';

const OrderDetail = ({ token }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/${orderId}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error loading order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.post(
        `${backendUrl}/api/order/update-status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );
      toast.success('Status updated');
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const confirmBankTransfer = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/order/admin/confirm-transfer`,
        { orderId },
        { headers: { token } }
      );
      toast.success('Bank transfer confirmed! Customer notified.');
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error confirming transfer');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'OrderPlaced': <FaBox />,
      'Packing': <FaBox />,
      'Shipped': <FaTruck />,
      'Out for delivery': <FaTruck />,
      'Delivered': <FaHome />,
      'pending_bank_transfer': <FaUniversity />,
      'pending_cod': <FaMoneyBillWave />,
      'paid': <FaCheckCircle />,
      'completed': <FaCheckCircle />
    };
    return icons[status] || <FaClock />;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-detail-page">
      <button className="back-btn" onClick={() => navigate('/orders')}>
        <FaArrowLeft /> Back to Orders
      </button>

      <div className="order-header">
        <h1>Order #{orderId.slice(-8).toUpperCase()}</h1>
        <div className="header-actions">
          <span className={`status-badge ${order.status}`}>
            {getStatusIcon(order.status)} {order.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="order-grid">
        {/* Customer Info */}
        <div className="card customer-card">
          <h3>Customer Information</h3>
          <div className="info-row">
            <span>Name:</span>
            <strong>{order.address?.firstName} {order.address?.lastName}</strong>
          </div>
          <div className="info-row">
            <span>Email:</span>
            <a href={`mailto:${order.address?.email}`}>{order.address?.email}</a>
          </div>
          <div className="info-row">
            <span>Phone:</span>
            <a href={`tel:${order.address?.phone}`}>{order.address?.phone}</a>
          </div>
          <div className="address-box">
            <h4>Shipping Address</h4>
            <p>{order.address?.street}</p>
            {order.address?.apartment && <p>{order.address.apartment}</p>}
            <p>{order.address?.zipcode} {order.address?.city}</p>
            <p>{order.address?.country}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="card payment-card">
          <h3>Payment Information</h3>
          <div className="info-row">
            <span>Method:</span>
            <strong className="payment-method">{order.paymentMethod}</strong>
          </div>
          <div className="info-row">
            <span>Status:</span>
            <span className={order.payment ? 'paid' : 'unpaid'}>
              {order.payment ? <><FaCheckCircle /> Paid</> : <><FaClock /> Unpaid</>}
            </span>
          </div>
          {order.bankTransferReference && (
            <div className="bank-ref-box">
              <h4>Bank Transfer Reference</h4>
              <code>{order.bankTransferReference}</code>
              <p>Customer must include this reference in their transfer</p>
            </div>
          )}
          {order.paymentId && (
            <div className="transaction-id">
              <span>Transaction ID:</span>
              <code>{order.paymentId}</code>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="card items-card">
          <h3>Order Items ({order.items?.length})</h3>
          <div className="items-list">
            {order.items?.map((item, idx) => (
              <div className="item-row" key={idx}>
                <div className="item-icon">{item.icon || '📋'}</div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.level} • {item.duration}</p>
                </div>
                <div className="item-price">
                  {currency}{item.price} × {item.quantity || 1}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Total:</span>
            <strong>{currency}{order.amount}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="card actions-card">
          <h3>Actions</h3>
          
          {order.status === 'pending_bank_transfer' && !order.payment && (
            <button className="action-btn confirm-btn" onClick={confirmBankTransfer}>
              <FaCheckCircle /> Confirm Bank Transfer Received
            </button>
          )}

          <div className="status-update">
            <label>Update Status:</label>
            <select 
              value={order.status} 
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="OrderPlaced">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="order-meta">
            <p>Order Date: {new Date(order.date || order.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(order.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;