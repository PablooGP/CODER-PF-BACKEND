import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
import { config } from '../config/config.js';

const secretKey = process.env.JWT_SECRET;
const __dirname = path.resolve(); 
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

const sendMail = async () => {
    try {
        const info = await transport.sendMail({
            from: 'Nicolas Lopez <lopeznicolas055@gmail.com>',
            to: 'lopeznicolas055@gmail.com',
            subject: 'Correo de prueba',
            html: `<h1>Mail de prueba</h1>`,
            attachments: [
                // Attachments can be added here
            ],
        });
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// const forgotPass = async (userMail) => {
//     try {

//         const token = jwt.sign({ userMail: user.mail }, secretKey, { expiresIn: '1h' });

//         const resetLink = `http://localhost:${process.env.PORT}/reset-password?token=${token}`;
//         const info = await transport.sendMail({
//             from: 'Nicolas Lopez <lopeznicolas055@gmail.com>',
//             to: userMail, // Use the user's email passed as an argument
//             subject: 'Password Reset',
//             html: `Click <a href="${resetLink}">here</a> to reset your password.`,
//         });

//         console.log('Password reset email sent:', info.response);
//     } catch (error) {
//         console.error('Error sending password reset email:', error);
//     }
// };

export default sendMail; // Export the functions individually
