import 'dotenv/config.js'
import express from 'express'
import router from './routes/index.js'
import error_handler from './middlewares/error_handler.js'
import new_error_handler from './service/errors/index.js'
import not_found_handler from './middlewares/not_found.js'
import { __dirname } from './utils/utils.js'
import handlebars from 'express-handlebars'
import session from 'express-session'
import mongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import inicializePassport from './config/passport.js'
import { config } from './config/config.js'
import cors from 'cors'
import { addLogger } from './utils/logger.js'
import swaggerJsDoc from 'swagger-jsdoc';
import SwaggerUiExpress from 'swagger-ui-express';

const hbs = handlebars.create({})
const server = express()

config.connectDB()

server.use(cors())

server.engine('handlebars', handlebars.engine())
server.set('views', __dirname + '/views')
server.set('view engine', 'handlebars')

server.use(cookieParser(process.env.SECRET_COOKIE))
server.use(session({
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.LINK_MONGO,
        ttl: 604800 * 1000
    })
}))

inicializePassport()

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion de app Optica flex',
            description: 'API Para comprar lentes y anteojos',
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
};

console.log(swaggerJsDoc.definition)

const specs = swaggerJsDoc(swaggerOptions);

server.use('/docs', SwaggerUiExpress.serve, SwaggerUiExpress.setup(specs));

server.use(passport.initialize())
server.use(passport.session())
server.use('/public', express.static('public'))
server.use(express.urlencoded({ extended: true }))
server.use(express.json())
server.use(addLogger)
server.use('/', router)
server.use(new_error_handler)
server.use(error_handler) // Como agregamos un custom error tal vez este tengamos q borrarlo pero por el momento lo deje aca
server.use(not_found_handler)

hbs.handlebars.registerHelper('if_eq', function (x, y, opts) {
    if (x == y) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});


export default server