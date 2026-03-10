import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../style/Profile.scss';

const Profile = () => {
  const { token, user, setUser, logout, navigate, api, backendUrl } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', zipcode: '', country: 'France' }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const makeRequest = useCallback(async (method, endpoint, data = null, config = {}) => {
    if (api && typeof api[method] === 'function') {
      return api[method](endpoint, data, config);
    }
    
    const defaultConfig = {
      headers: { 
        token: token || localStorage.getItem('token'),
        ...config.headers 
      },
      ...config
    };
    
    const url = `${backendUrl}${endpoint}`;
    
    if (method === 'get') {
      return axios.get(url, defaultConfig);
    } else if (method === 'post') {
      return axios.post(url, data, defaultConfig);
    }
    
    throw new Error(`Method ${method} not supported`);
  }, [api, token, backendUrl]);

  useEffect(() => {
    if (!token && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await makeRequest('get', '/api/user/profile');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expirée');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, makeRequest, setUser, logout, navigate]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await makeRequest('post', '/api/order/userorders', {});
      if (data.success) setOrders(data.orders || []);
    } catch (err) {
      console.error('Erreur commandes:', err);
      toast.error('Erreur chargement commandes');
    }
  }, [token, makeRequest]);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchOrders();
    }
  }, [token, fetchProfile, fetchOrders]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          zipcode: user.address?.zipcode || '',
          country: user.address?.country || 'France'
        }
      });
      // Nettoyer la preview si elle est une URL blob
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [user]);

  // ✅ SOLUTION DÉFINITIVE: Utiliser FileReader avec readAsDataURL pour base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WebP');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      e.target.value = '';
      return;
    }

    // Nettoyer l'ancienne preview
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    
    // ✅ Utiliser FileReader pour créer une data URL base64 (toujours sécurisé)
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      console.log('Preview URL type:', base64Url.substring(0, 50)); // Debug
      setAvatarPreview(base64Url);
    };
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier');
      setAvatarFile(null);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      toast.error('Vous devez être connecté pour changer votre avatar');
      navigate('/login');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const formDataUpload = new FormData();
      // ✅ Important: le fichier brut, pas la preview base64
      formDataUpload.append('avatar', avatarFile);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': authToken
        }
      };

      console.log('Uploading avatar with token:', authToken ? 'Present' : 'Missing');

      const { data } = await axios.post(
        `${backendUrl}/api/user/upload-avatar`, 
        formDataUpload, 
        config
      );

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Nettoyer
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
        setAvatarPreview(null);
        toast.success('Photo de profil mise à jour');
      } else {
        toast.error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter');
        logout();
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'upload de l\'avatar');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarChange = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (formData.name.length < 2) {
      toast.error('Le nom doit faire au moins 2 caractères');
      return;
    }

    try {
      setLoading(true);
      const { data } = await makeRequest('post', '/api/user/update-profile', formData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setEditMode(false);
        toast.success('Profil mis à jour');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit faire 8 caractères minimum');
      return;
    }

    try {
      setLoading(true);
      const { data } = await makeRequest('post', '/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (data.success) {
        toast.success('Mot de passe changé');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur changement mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'user')}`;
  };

  // ✅ Protection supplémentaire: jamais d'URL file://
  const displayAvatar = React.useMemo(() => {
    // Si c'est une URL file://, on ignore
    if (avatarPreview && avatarPreview.startsWith('file://')) {
      console.warn('Blocked file:// URL');
      return user?.avatar || getAvatarUrl(user?.name);
    }
    // Si c'est une data URL (base64) ou blob, c'est OK
    if (avatarPreview && (avatarPreview.startsWith('data:') || avatarPreview.startsWith('blob:'))) {
      return avatarPreview;
    }
    // Sinon avatar sauvegardé ou par défaut
    return user?.avatar || getAvatarUrl(user?.name);
  }, [avatarPreview, user?.avatar, user?.name]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!token) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Redirection...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <img 
                src={displayAvatar} 
                alt="Avatar" 
                className={avatarPreview ? 'preview-mode' : ''}
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.src = getAvatarUrl(user?.name);
                }}
              />
              
              <div className="avatar-overlay" onClick={() => fileInputRef.current?.click()}>
                <span className="camera-icon">📷</span>
                <span className="overlay-text">Changer</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
              />
            </div>

            {avatarFile && (
              <div className="avatar-actions">
                <button 
                  className="btn-avatar-save" 
                  onClick={uploadAvatar}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? '...' : '✓'}
                </button>
                <button 
                  className="btn-avatar-cancel" 
                  onClick={cancelAvatarChange}
                  disabled={uploadingAvatar}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <h2>{user?.name || 'Utilisateur'}</h2>
          <p className="user-email">{user?.email}</p>
          <p className="member-since">
            Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
          </p>
          
          <nav className="profile-menu">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              👤 Profil
            </button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              📦 Commandes {orders.length > 0 && <span className="badge">{orders.length}</span>}
            </button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              ⚙️ Sécurité
            </button>
            <button className="logout-btn" onClick={logout}>🚪 Déconnexion</button>
          </nav>
        </aside>

        <main className="profile-content">
          {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

          {activeTab === 'profile' && (
            <section className="profile-section">
              <div className="section-header">
                <h3>Informations personnelles</h3>
                {!editMode && <button className="btn-gold" onClick={() => setEditMode(true)}>Modifier</button>}
              </div>

              {editMode ? (
                <form onSubmit={updateProfile} className="profile-form">
                  <div className="form-group required">
                    <label>Nom complet</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required minLength={2} />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled className="disabled" />
                  </div>
                  
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+33 6 12 34 56 78" />
                  </div>

                  <div className="address-section">
                    <h4>Adresse</h4>
                    <div className="form-group">
                      <label>Rue</label>
                      <input name="address.street" value={formData.address.street} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ville</label>
                        <input name="address.city" value={formData.address.city} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Code postal</label>
                        <input name="address.zipcode" value={formData.address.zipcode} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Pays</label>
                      <input name="address.country" value={formData.address.country} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-dark" onClick={() => setEditMode(false)}>Annuler</button>
                    <button type="submit" className="btn-gold" disabled={loading}>
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-display">
                  <div className="info-row"><span>Nom</span><p>{user?.name || '-'}</p></div>
                  <div className="info-row"><span>Email</span><p>{user?.email || '-'}</p></div>
                  <div className="info-row"><span>Téléphone</span><p>{user?.phone || '-'}</p></div>
                  <div className="info-row">
                    <span>Adresse</span>
                    <p>{user?.address?.street ? `${user.address.street}, ${user.address.city} ${user.address.zipcode}, ${user.address.country}` : '-'}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="profile-section">
              <h3>Mes commandes ({orders.length})</h3>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>Aucune commande</p>
                  <button className="btn-gold" onClick={() => navigate('/programs')}>Voir les programmes</button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                          <span className="order-date">{new Date(order.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <span className={`order-status ${order.status || 'pending'}`}>{order.status || 'En attente'}</span>
                      </div>
                      <div className="order-items">
                        {(order.items || []).map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="order-item">
                            <span className="item-icon">{item.icon || '📋'}</span>
                            <div className="item-details">
                              <p className="item-name">{item.name}</p>
                              <p className="item-meta">{item.level} • {item.duration}</p>
                            </div>
                            <span className="item-price">€{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span className={`payment-status ${order.payment ? 'paid' : 'pending'}`}>
                          {order.payment ? '✓ Payé' : '⏳ En attente'}
                        </span>
                        <span className="order-total">Total: <strong>€{order.amount}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="profile-section">
              <h3>Changer le mot de passe</h3>
              <form onSubmit={changePassword} className="profile-form">
                <div className="form-group required">
                  <label>Mot de passe actuel</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))}
                    required 
                  />
                </div>
                <div className="form-group required">
                  <label>Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))}
                    required 
                    minLength={8}
                  />
                </div>
                <div className="form-group required">
                  <label>Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))}
                    required 
                  />
                </div>
                <button type="submit" className="btn-gold" disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Profile;