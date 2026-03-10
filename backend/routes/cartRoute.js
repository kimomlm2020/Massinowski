import express from 'express'
import { addToCart, getUserCart, updateCart } from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'  // ✅ Default import

const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)  // ✅ Use authUser
cartRouter.post('/add', authUser, addToCart)
cartRouter.post('/update', authUser, updateCart)

export default cartRouter