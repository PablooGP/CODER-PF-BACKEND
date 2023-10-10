export default (req, res, next) => {
    console.log(req.user)
    if ((req.user.role == "admin" || req.user.role == "premium") && req.cookies.token != undefined) {
        return next()
    }
    return res.status(401).json({
        success: false,
        message: 'fail to auth user'
    })
}
