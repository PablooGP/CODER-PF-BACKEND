import { Router } from "express"
import Users from "../../dao/mongo/models/user.model.js"
// import session from 'express-session';
import isValidPassword from "../../middlewares/is_valid_password.js";
import passport from "passport"
import create_hash from "../../middlewares/create_hash.js";
import validator_register from "../../middlewares/validator_register.js"
import pass_is_8 from "../../middlewares/pass_is_8.js"
import validator_signin from "../../middlewares/validator_signin.js"
import generatejwt from "../../middlewares/jwt_generate.js";
import passport_call from "../../middlewares/passport_call.js"
import jwt from "jsonwebtoken"
import sendMail from "../../utils/sendMail.js";
import { sendSms, sendWhatsapp } from '../../utils/sendSms.js';
import UserDTO from '../../dto/user.dto.js'
import { upload } from '../../middlewares/multer.js';



const router = Router()

router.get('/mail', async (req, res) => {
    await sendMail()
    res.send('Email enviado')
})

router.get('/sms', async (req, res) => {
    await sendSms('Nicolas', 'Lopez')
    res.send('SMS enviado')
})
router.get('/whatsapp', async (req, res) => {
    await sendWhatsapp('Nicolas', 'Lopez')
    res.send('SMS enviado')
})

router.post('/register',
    upload.single('image'),
    validator_register,
    pass_is_8,
    create_hash,
    passport.authenticate(
        'register',  // nombre de la estrategia a buscar
        { failureRedirect: '' }  // objeto de configuracion de la ruta de redireccionamiento en caso de error
    ),
    (req, res) => {
        const { redirect } = req.query
        if (redirect == "true") {
            return res.redirect("/perfil")
        } else {
            return res.status(201).json({
                success: true,
                message: 'user created!'
            })
        }
    }
)

router.get('/fail-register', (req, res) => res.status(400).json({
    success: false,
    message: 'fail register!'
}))


router.post('/login',
    validator_signin,
    pass_is_8,
    passport.authenticate('signin', { failureRedirect: '/api/auth/fail-signin' }),
    isValidPassword,
    generatejwt,
    (req, res) => {
        req.session.mail = req.user.mail
        req.session.role = req.user.role
        return res.status(200).cookie("token", req.token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }).redirect('/perfil')
    })

router.get('/fail-signin', async (req, res) => res.status(400).json({
    success: false,
    message: 'fail sign in!'
}))


router.post("/signout",
    passport_call("jwt"),
    async (req, res, next) => {
        delete req.token
        res.clearCookie("token")
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: "Unexpected error" });
            }
            return res.redirect("/perfil");
        });
    }
);

router.get('/github', passport.authenticate('github', { scope: ['user:mail'] }), (req, res) => { })

router.get('/github/callback', passport.authenticate('github', { failureRedirect: 'api/auth/fail-register' }), generatejwt, (req, res) => {
    //req.session.user = req.user
    console.log(req.user)
    console.log(req.token)
    return res.status(302).cookie("token", req.token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }).redirect("/perfil")
    //return res.redirect("/perfil")

    /*return res.status(201).json({
        success: true,
        message: 'user created!',
        user: req.user
    })*/
})

router.get("/fail-register", async (req, res, next) => {
    return res.status(403).json({
        success: false,
        message: "fail to register with github"
    })
})

// router.get("/current", passport_call("jwt"), async (req, res, next) => {
//     const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET, async (error, credentials) => {
//         if (error) return { message: "error to get token credentials" };
//         return credentials;
//     })
//     return res.status(200).json(data)
// })

router.get("/current", passport_call("jwt"), async (req, res, next) => {
    try {
        const credentials = await new Promise((resolve, reject) => {
            jwt.verify(req.cookies.token, process.env.JWT_SECRET, async (error, decoded) => {
                if (error) reject(new Error("error to get token credentials"));
                resolve(decoded);
            });
        });

        const user = await Users.findById(credentials.id);
        if (!user) return res.status(400).json({ message: "User not found" });

        const userDTO = new UserDTO(user);
        return res.status(200).json(userDTO);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

export default router