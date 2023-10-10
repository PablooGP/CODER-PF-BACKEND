import User from "../models/User.js"
import jwt from "jsonwebtoken"

export default (req, res, next) => {
    const auth = req.headers.authorization
    console.log(auth)
    if (!auth) {
        return res.status(401).json({
            success: false,
            message: 'fail to auth'
        })
    }
    const token = auth.split(' ')[1]
    jwt.verify(
        token,
        process.env.JWT_SECRET,
        async (error, credentials) => {
            if (error) {
                return res.status(401).json({
                    success: false,
                    message: 'fail to auth user'
                })
            }
            let user = await User.findOne({ mail: credentials.mail })
            req.user = user
            return next()
        }
    )
}
