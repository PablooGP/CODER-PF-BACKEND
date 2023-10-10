import ErrorEnum from "../errors/enums.js"

export default (error, req, res, next) => {

    console.log(error)
    console.log(error.cause)
    
    switch(error.code) {
        case ErrorEnum.INVALID_TYPES_ERROR:
            return res.status(500).json({
                status: 500,
                message: error.name
            })
        default:
            return res.status(500).json({
                status: 500,
                error: "Unhandled error"
            })
    }
}