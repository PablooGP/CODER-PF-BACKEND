import twilio from "twilio";
import { config } from '../config/config.js';

const { twilio_sid, twilio_token, twilio_phone, my_phone } = config;

const client = twilio(twilio_sid, twilio_token);

const sendSms = (nombre, apellido) => client.messages.create({
    body: `Gracias por tu compra ${nombre} ${apellido}`,
    from: twilio_phone,
    to: my_phone
});

const sendWhatsapp = (nombre, apellido) => client.messages.create({
    body: `Gracias por tu compra ${nombre} ${apellido}`,
    from: `whatsapp:+17625256167`,
    to: `whatsapp:${my_phone}`
});

export { sendSms, sendWhatsapp };
