import CustomError from "../service/errors/CustomError.js"
import ErrorEnum from "../service/errors/enums.js"
import { generateUserErrorInfo, generateLoginErrorInfo } from "../service/errors/generateUserErrorInfo.js"

function validator_signin (req,res,next) {
    const { password,mail } = req.body
    if (!password || !mail) {

        CustomError.CreateError({
            name: "User creation error",
            cause: generateLoginErrorInfo({first_name, last_name, mail}),
            message: "Error: Trying to create user",
            code: ErrorEnum.INVALID_TYPES_ERROR
        })

        return res.status(400).json({
            success: false,
            message: 'password,email are required'
        })
    } else {
        return next()
    }
}

export default validator_signin