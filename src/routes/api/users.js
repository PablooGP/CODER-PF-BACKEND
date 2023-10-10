import {
    Router
} from "express"
import Users from "../../dao/mongo/models/user.model.js"
import authorization from "../../middlewares/authorization.js";
import nodemailer from "nodemailer";
import sendMail from "../../utils/sendMail.js"
import {config} from '../../config/config.js'
import adminauth from "../../middlewares/adminAuth.js"
import {UserDocumentUploader} from '../../middlewares/multer.js';

import jwt from "jsonwebtoken"

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

const router = Router()

// Ruta GET para obtener solo nombre, email y role de todos los usuarios
router.get('/', adminauth, async (req, res, next) => {
    try {
        const users = await Users.find({}, 'first_name last_name mail role').lean();
        return res.status(200).json(users);

    } catch (error) {
        next(error);
    }
});

router.delete("/:uid", adminauth, async(req, res, next) => { // Este endpoint se encarga de borrar a un usuario especifico
    try {
        const { uid } = req.params
        const user = await Users.findById(uid)
        if (user == null) return res.status(404).json({
            success: false
        })

        if (user.role == "admin") return res.status(401).json({
            success: false
        })

        const deleted = await Users.deleteOne({_id: uid})
        if (deleted == null) return res.status(404).json({
            success: false
        })

        await transport.sendMail({
            from: process.env.GMAIL_USER_APP,
            to: user.mail,
            subject: 'Eliminacion de cuenta',
            text: 'Tu cuenta ha sido eliminada por un administrador.',
        })

        return res.status(200).json({
            success: true,
            userdata: {
                first_name: deleted.first_name,
                last_name: deleted.last_name,
                photo: deleted.photo,
                mail: deleted.mail
            }
        })

    } catch(err) {
        console.error(err)
        next(err)
    }
})

router.delete('/', adminauth, async (req, res) => {
    try {
        // Obtén la lista de usuarios de tu base de datos
        const users = await Users.find();
        console.log(users)

        const deletedUsers = []
        const notDeletedUsers = []

        const time_to_delete = 1000*60*60*24* (2) // Cambiar el numero encerrado en los parentesis () para cambiar los dias
        users.forEach( user => {
            const connection = new Date(user.last_connection)
            if (connection.getTime() <= Date.now()-time_to_delete ) {
                deletedUsers.push(user)
            } else {
                notDeletedUsers.push(user)
            }
        })

        // Envía un correo a los usuarios inactivos y elimínalos
        for (const user of deletedUsers) {
            try {
                // Envía un correo electrónico al usuario
                const mailOptions = {
                    from: process.env.GMAIL_USER_APP,
                    to: user.mail,
                    subject: 'Eliminación por inactividad',
                    text: 'Tu cuenta ha sido eliminada debido a la inactividad durante 2 días.',
                };

                await transport.sendMail(mailOptions);

                // Elimina al usuario de la base de datos
                await Users.findByIdAndRemove(user._id);
            } catch (error) {
                console.error(`Error al enviar el correo a ${user.mail}: ${error}`);
            }
        }

        res.status(200).json({
            message: 'Usuarios inactivos eliminados y notificados.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Ocurrió un error al procesar la solicitud.'
        });
    }
});

router.get("/premium/:uid", adminauth, async (req, res, next) => {
    try {
        const {
            uid
        } = req.params

        const mongouser = await Users.findById(uid)

        console.log(mongouser)
        if (req.user.role != "admin") return res.status(401).json({
            success: false,
            message: "unauthorized"
        })

        if (mongouser == null) return res.status(404).json({
            success: false,
            message: "user not found"
        })

        if (mongouser.role == "admin") return res.json(401).json({
            success: false,
            message: "cant change admin privileges"
        })

        if (mongouser.documents.length<3) return res.json(409).json({
            success: false,
            message: "cant convert to premium (reason: user doesnt have documents)"
        })

        mongouser.role = mongouser.role == "user" ? "premium" : "user"

        await mongouser.save()

        res.status(200).json({
            success: true,
            newrole: mongouser.role,
            message: `user role changed to ${mongouser.role}`
        })

    } catch (err) {
        console.log(err)
        next(err)
    }
})

router.post("/documents", UserDocumentUploader.fields([{ name: 'dni-front', maxCount: 1 }, { name: 'dni-back', maxCount: 1 }, { name: 'irl-user-photo', maxCount: 1 }]), async (req, res, next) => {
    console.log(req.files)

    const {redirect} = req.query
    const user = await Users.findById(req.user.id)

    if (req.files == null) return res.status(400).json({
        success: false
    })

    if (req.files["dni-front"] != null) {
        const type = "dni-front"
        const file = req.files[type][0]
        const index = user.documents.findIndex(e => {
            if (e.reference == type) {
                return true
            }
        })

        if (index >= 0) {
            user.documents[index].name = file.filename
        } else {
            user.documents.push({
                name: file.filename,
                reference: type
            })
        }
    }

    if (req.files["dni-back"] != null) {
        const type = "dni-back"
        const file = req.files[type][0]
        const index = user.documents.findIndex(e => {
            if (e.reference == type) {
                return true
            }
        })

        if (index >= 0) {
            user.documents[index].name = file.filename
        } else {
            user.documents.push({
                name: file.filename,
                reference: type
            })
        }
    }
    

    if (req.files["irl-user-photo"] != null) {
        const type = "irl-user-photo"
        const file = req.files[type][0]
        const index = user.documents.findIndex(e => {
            if (e.reference == type) {
                return true
            }
        })

        if (index >= 0) {
            user.documents[index].name = file.filename
        } else {
            user.documents.push({
                name: file.filename,
                reference: type
            })
        }
    }

    if (user.documents.length >= 3) {
        user.verified = true
    }

    user.save()

    if (redirect == "true") {
        return res.redirect("/perfil")
    } else {
        return res.status(200).json({
            success: true
        })
    }
    
})





export default router