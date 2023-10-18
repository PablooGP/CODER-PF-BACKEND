import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
import config from '../config/config.js';

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
            ],
        });
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendMail;
