import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

// Créer token JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// ==================== AUTHENTIFICATION ====================

// Route pour login utilisateur
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      // Renvoyer aussi les infos utilisateur pour le frontend
      res.json({ 
        success: true, 
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          address: user.address || {},
          createdAt: user.createdAt
        }
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route pour register utilisateur
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Valider email et mot de passe
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur avec tous les champs
    const newUser = new userModel({ 
      name,
      email,
      password: hashedPassword,
      phone: '',
      avatar: '',
      address: {
        street: '',
        city: '',
        zipcode: '',
        country: 'France'
      }
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route pour admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', email);

    // Vérifier les variables d'environnement
    console.log('🔐 Expected:', process.env.ADMIN_EMAIL);
    console.log('🔐 Password match:', password === process.env.ADMIN_PASSWORD);

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          email, 
          role: 'admin',
          id: 'admin_' + Date.now() // ID unique pour l'admin
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ Admin login successful');
      
      res.json({ 
        success: true, 
        token,
        message: 'Admin login successful'
      });
    } else {
      console.log('❌ Admin login failed: Invalid credentials');
      res.json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};
// ==================== PROFIL UTILISATEUR ====================

// Récupérer le profil de l'utilisateur
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // Depuis le middleware auth
    
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        address: user.address || {
          street: '',
          city: '',
          zipcode: '',
          country: 'France'
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Mettre à jour le profil
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, avatar } = req.body;
    
    // Validation des données
    if (name && name.length < 2) {
      return res.json({ success: false, message: 'Name must be at least 2 characters' });
    }

    if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
      // On accepte quand même mais on log
      console.log('Phone format may be invalid:', phone);
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: 'Please provide both passwords' });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//forget password

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // TODO: Implémenter l'envoi d'email réel avec nodemailer
    // Pour l'instant, simulation :
    res.json({ success: true, message: "Password reset email sent" });
    
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



//modifier avatar profile
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier fourni' 
      });
    }

    const userId = req.userId;
    const avatarUrl = req.file.path; // URL Cloudinary

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Avatar mis à jour avec succès',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'upload de l\'avatar',
      error: error.message 
    });
  }
};



// Récupérer les commandes de l'utilisateur
const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    
    const orders = await orderModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean(); // Pour meilleures performances

    // Formatage des commandes pour le frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      items: order.items.map(item => ({
        programId: item.programId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        icon: item.icon || '📋',
        level: item.level || 'Beginner',
        duration: item.duration || '/month'
      })),
      amount: order.amount,
      address: order.address,
      status: order.status,
      paymentMethod: order.paymentMethod,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { 
  loginUser, 
  registerUser, 
  adminLogin,
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  getUserOrders,
  forgotPassword,
  uploadAvatar
};