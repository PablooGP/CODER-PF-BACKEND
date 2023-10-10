// import { connect } from 'mongoose'
import dotenv from 'dotenv';
import { commander } from '../utils/commander.js';
import MongoSingleton from './MongoSingleton.js';
import 'dotenv/config.js';

// console.log(commander.opts())
const { mode } = commander.opts();

dotenv.config({
    path: mode === 'development' ? './.env.development' : './.env.production'
});

// console.log(process.env.PERSISTENCE)

export const config = {
    twilio_sid: process.env.TWILIO_SID,
    twilio_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_phone: process.env.TWILIO_PHONE_NUMBER,
    my_phone: process.env.MY_PHONE_NUMBER,
    gmail_user_app: process.env.GMAIL_USER_APP,
    gmail_pass_app: process.env.GMAIL_PASS_APP,
    privateKeyJwt: process.env.JWT_SECRET || '',
    PORT: process.env.PORT                     || 3000,
    MONGO_URL: process.env.LINK_MONGO           || '',
    persistence: process.env.PERSISTENCE,
    connectDB: () => MongoSingleton.getInstance()
    
};
