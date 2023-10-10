import { use } from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { config } from '../../config/config'

const JWTStrategy = Strategy
const ExtractJWT  = ExtractJwt

// jwt setadas las cookies en el cliente
// req -> obj req(cookies)
// coderCookieToken: 'jfasldflasjdfasdf.jlasdjfl'
let cookieExtractor = req => {
    let token = null
    if (req && req.cookies) {
        token = req.cookies[coderCookieToken] // nombre del campo de cookie donde esta el token
    }
    return token
}

const configStrategy  = {
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: config.privateKeyJwt
}

const initializePassport = () => {
    use('jwt', new JWTStrategy(configStrategy, async (jwt_payload, done)=>{
        try {
            return done(null, jwt_payload) // user 
        } catch (error) {
            return done(error)
        }
    }))
}

export default {
    initializePassport
}