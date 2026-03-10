import userModel from '../models/userModel.js'

///ADD PRODUCTS TO USER CART
const addToCart = async (req, res) => {
    try {
        const userId = req.userId; // ✅ Changed from req.user.id to req.userId
        const program = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        let cartData = Array.isArray(userData.cartData) ? userData.cartData : []

        // Vérifier si déjà dans le panier
        const existingItem = cartData.find(item => item.id === program.id)

        if (existingItem) {
            return res.json({ success: false, message: "Program already in cart" })
        }

        cartData.push({
            ...program,
            quantity: 1,
            addedAt: new Date()
        })

        await userModel.findByIdAndUpdate(userId, { cartData })

        res.json({ success: true, message: "Program added to cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

///UPDATE USER CART
const updateCart = async (req, res) => {
    try {
        const userId = req.userId; // ✅ Changed from req.user.id to req.userId
        const { itemId, quantity } = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        let cartData = Array.isArray(userData.cartData) ? userData.cartData : []

        cartData = cartData.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity }
            }
            return item
        })

        await userModel.findByIdAndUpdate(userId, { cartData })

        res.json({ success: true, message: "Cart updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

///GET USER CART DATA
const getUserCart = async (req, res) => {
    try {
        const userId = req.userId; // ✅ Changed from req.user.id to req.userId

        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        const cartData = Array.isArray(userData.cartData) ? userData.cartData : []

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }