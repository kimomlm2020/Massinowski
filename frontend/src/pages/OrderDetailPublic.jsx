
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const OrderDetailPublic = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // Endpoint public (sans auth) ou avec token temporaire
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/order/public/${orderId}`
      );
      
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!order) return <div className="p-8 text-center">Commande non trouvée</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        
        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Commande #{orderId.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Statut */}
        <div className="mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-medium
            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {order.status === 'pending' && '⏳ En attente'}
            {order.status === 'delivered' && '✅ Livrée'}
            {order.status === 'cancelled' && '❌ Annulée'}
          </span>
        </div>

        {/* Articles */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Articles commandés</h3>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
              </div>
              <p className="font-medium">{item.price * item.quantity}€</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{order.amount}€</span>
          </div>
        </div>

        {/* Bouton Admin (si connecté) */}
        <div className="mt-6 pt-4 border-t">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Gérer les commandes (Admin)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPublic;