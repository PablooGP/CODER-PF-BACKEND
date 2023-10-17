import { hashSync,genSaltSync } from "bcrypt";

export default function(req,res,next){
    const { password } = req.body
    const hashPassword = hashSync(
        password,
        genSaltSync()
    )
    req.body.password = hashPassword
    console.log("HASHG")
    return next()
}