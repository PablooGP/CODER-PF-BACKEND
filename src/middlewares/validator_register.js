import CustomError from "../service/errors/CustomError.js"
import ErrorEnum from "../service/errors/enums.js"
import { generateUserErrorInfo } from "../service/errors/generateUserErrorInfo.js"

export default (req, res, next) => {
    const { first_name, last_name, password, mail } = req.body
    if (!first_name || !last_name || !password || !mail) {

        CustomError.CreateError({
            name: "User creation error",
            cause: generateUserErrorInfo({first_name, last_name, mail}),
            message: "Error: Trying to create user",
            code: ErrorEnum.INVALID_TYPES_ERROR
        })

        return res.status(400).json({
            success: false,
            message: 'name, password, email are required'
        })
    } else {
        return next()
    }
}