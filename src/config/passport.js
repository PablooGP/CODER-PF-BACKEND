import passport from "passport";
import { Strategy } from "passport-local";
import Users from "../dao/mongo/models/user.model.js";
import GHStrategy from "passport-github2"
import jwt from "passport-jwt"

export default function () {
    passport.serializeUser(
        (user, done) => done(null, user._id)
    )
    passport.deserializeUser(
        async (id, done) => {
            const user = await Users.findById(id)
            return done(null, user)
        }
    )
    passport.use(
        'register',
        new Strategy(
            { passReqToCallback: true, usernameField: 'mail' },
            async (req, userName, password, done) => {
                try {
                    let one = await Users.findOne({ mail: userName })
                    if (!one) {
                        let user = await Users.create(req.body)
                        return done(null, user)
                    }
                    return done(null, false)
                } catch (error) {
                    return done(error, false)
                }
            }
        )
    )

    passport.use(
        'signin',
        new Strategy(
            { usernameField: 'mail' },
            async (userName, password, done) => {
                try {
                    let one = await Users.findOne({ mail: userName })
                    one.last_connection = Date.now()
                    if (one) {
                        return done(null, one)
                    }
                    return done(null, false)
                } catch (error) {
                    return done(error, false)
                }
            }
        )
    )

    passport.use(
        'github',
        new GHStrategy(
            { clientID: process.env.GITHUB_CLIENTID, clientSecret: process.env.GITHUB_SECRET, callbackURL: process.env.GITHUB_CALLBACK, scope: ["user:email"] },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let one = await Users.findOne({ mail: profile.emails[0].value, password: profile._json.id })
                    if (!one) {
                        let user = await Users.create({
                            first_name: profile._json.name || "Github User",
                            last_name: "",
                            mail: profile.emails[0].value,
                            age: 18,
                            photo: profile._json.avatar_url,
                            password: profile._json.id,
                            last_connection: Date.now(),
                            documents: []
                        })
                        return done(null, user)
                    }
                    return done(null, one)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use("jwt",
        new jwt.Strategy({
            jwtFromRequest: jwt.ExtractJwt.fromExtractors([(req) => req?.cookies.token ]),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwt_payload, done) => {
            try {
                const user = await Users.findOne({mail: jwt_payload.mail})
                user.last_connection = Date.now()
                if (user) {
                    delete user.password
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            } catch(err) {
                return done(err, false)
            }
        })
    )

}