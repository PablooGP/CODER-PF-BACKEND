import jwt from 'jsonwebtoken'
import Products from "../dao/mongo/models/product.model.js"

export default async (req, res, next) => {
    try {
        const { token } = req.cookies
        const { _id, role } = req.user
        const { productId } = req.params

        console.log(productId)
        const product = await Products.findById(productId)

        console.log(product)
        if (!product) return res.status(404).json({
            success: false,
            message: "product not found"
        })

        if (!token) return res.status(401).json({
            success: false,
            message: "no auth token"
        })

        if (role == "admin" || (role == "premium" && product.owner == _id)) {
            req.product = product
            return next()
        }

        return res.status(401).json({
            success: false,
            message: "user cant edit this"
        })


    } catch (err) {
        console.log(err)
        next(err)
    }
}