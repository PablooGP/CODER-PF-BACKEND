import { Router } from "express"
import api_router from './api/index.js'
import views_router from './views/index.js'

const index_router = Router()

index_router.use('/api',api_router) //enrutador de rutas que respondan con json (datos)
index_router.use('/',views_router)  //enrutador de rutas que respondan con vistas (handlebars)

export default index_router