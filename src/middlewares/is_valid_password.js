import { compareSync } from "bcrypt"
import Users from "../dao/mongo/models/user.model.js"

export default async function(req,res,next) {
    let user =  await Users.findOne({ mail:req.body.mail })
    if (user) {
        let verified = compareSync(
            req.body.password,      //lo que envía el cliente en el form
            user.password           //lo que está guardado en mongo
        )

        console.log("password is:", verified == true ? "correct" : "incorrect")
        if (verified) {
            return next()
        }else{
            return res.status(401).json({
                success:false,
                message:'Authentication error. Invalid email or password.'
            })
        }
    }
    
}



