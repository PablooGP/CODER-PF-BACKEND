import 'dotenv/config.js'
import { Router } from "express";
import carts_router from './carts.mongo.js';
import products_router from './products.mongo.js';
import auth_router from './auth.js';
import users_router from "./users.js";
import jwt from "jsonwebtoken"; // Import the jwt module only once
import nodemailer from "nodemailer";
import { generateUser, generateProduct } from "../../utils/mocks/generateUserFake.js";
import Users from "../../dao/mongo/models/user.model.js";
import sendMail from "../../utils/sendMail.js"
import { hashSync,genSaltSync, compareSync } from "bcrypt";
import {config} from '../../config/config.js'

const router = Router()
const secretKey = process.env.JWT_SECRET;


router.use('/products', products_router)
router.use('/carts', carts_router)
router.use('/auth', auth_router)
router.use("/users", users_router)

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.gmail_user_app,
        pass: config.gmail_pass_app,
    },
    tls: {
        rejectUnauthorized: false,
    },
});



router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email in the database
        const user = await Users.findOne({ mail: email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Generate a JWT token for password reset (expires in 1 hour)
        const token = jwt.sign({ userMail: user.mail, userId: user._id }, secretKey, { expiresIn: "1h" });

        // Send the reset link to the user's email

        console.log(user.mail, process.env.GMAIL_USER_APP)
        const resetLink = `http://localhost:${process.env.PORT}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.GMAIL_USER_APP,
            to: user.mail,
            subject: "Password Reset",
            html: `Click <a href="${resetLink}">here</a> to reset your password.`,
        };

        transport.sendMail(mailOptions).then(content => {
            console.log(content)
            res.redirect("/success-email")
        }).catch(err => {
            console.log(err)
            res.redirect("/forgot-password")
        })

    } catch (err) {
        console.log("el server tubo un error")
        console.log(err)
    }

});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).send("Invalid or expired token");
        } else {
            console.log(decoded)
        }
        // Update user's password in the database
        const user = await Users.findById(decoded.userId)
        if (user == null) return res.status(404).json({success: false})

        if (compareSync(newPassword, user.password)) {
            return res.status(406).json({
                success: false,
                message: "The new password cannot be the same as the old one"
            })
        } else {
            user.password = hashSync(newPassword, genSaltSync())
            await user.save()

            return res.status(200).json({
                success: true,
                message: "Password reset successful"
            })
        }
    });
});



// Endpoint solo para pruebas, /api/mockU
router.get('/mockusers', (req, res) => {
    const { limit } = req.query

    const users = []
    for (let i = 0; i < (limit || 100); i++) {
        users.push(generateUser())
    }

    return res.status(200).json({
        status: 'success',
        payload: users
    })
})

// Endpoint solo para pruebas, /api/mockusers
router.get('/mockingproducts', (req, res) => {
    const { limit } = req.query

    const products = []
    for (let i = 0; i < (limit || 100); i++) {
        products.push(generateProduct())
    }

    return res.status(200).json({
        status: 'success',
        payload: products
    })
})

router.get("/loggerTest", (req, res) => {
    req.logger.fatal("Fatal logger test 1")
    req.logger.error("Error logger test 2")
    req.logger.warning("Warning logger test 3")
    req.logger.info("Info logger test 4")
    req.logger.debug("Debug logger test 5")
    return res.status(201).json({
        success: true,
        message: "logs created!"
    })
})


router.put("/premium/:uid", (req, res) => {
    const uid = req.params.uid;

    // Busca el usuario por su id en la base de datos
    const user = Users.find((user) => user.id === uid);

    if (!user) {
        return res.status(404).send("User not found");
    }

    // Cambia el rol del usuario
    user.role = user.role === "user" ? "premium" : "user";

    res.send("User role updated successfully");
});


export default router