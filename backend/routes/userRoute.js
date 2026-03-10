import express from 'express';
import { 
  loginUser,
  registerUser,
  adminLogin,        // ✅ Ajouté
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  getUserOrders,
  forgotPassword,
  uploadAvatar
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

// Routes publiques
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);        // ✅ AJOUTÉ - C'était manquant !
userRouter.post('/forgot-password', forgotPassword);

// Routes protégées
userRouter.get('/profile', authUser, getUserProfile);
userRouter.post('/update-profile', authUser, updateUserProfile);
userRouter.post('/change-password', authUser, changePassword);
userRouter.get('/orders', authUser, getUserOrders);
userRouter.post('/upload-avatar', authUser, upload.single('avatar'), uploadAvatar);

export default userRouter;