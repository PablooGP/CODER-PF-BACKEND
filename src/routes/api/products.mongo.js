import { Router } from "express"
import Products from '../../dao/mongo/models/product.model.js'
import authorization from "../../middlewares/authorization.js"
import product_edit from "../../middlewares/product_edit.js"

import {ProductImageUploader} from "../../middlewares/multer.js"

import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

import { config } from "../../config/config.js"

import Users from "../../dao/mongo/models/user.model.js"

const router = Router()

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

router.get("/canEdit/:productId", product_edit, async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "user can edit this product"
        })

    } catch (err) {
        return res.json(500).json({
            success: false,
            message: err.message
        })
    }
})

router.get("/admin-delete/:productId", product_edit, async (req, res, next) => {
    try {
        const { _id } = req.product
        const deleted = await Products.findByIdAndDelete(_id)

        console.log(deleted)
        if (deleted) return res.status(200).json({
            success: true,
            message: "product deleted"
        })

        return res.status(400).json({
            success: false,
            message: "idk"
        })

    } catch (err) {
        console.log(err);
        next(err);
    }
})

router.post('/', authorization, ProductImageUploader.single("thumbnail"), async (req, res, next) => {
    try {
        const owner = req.user._id
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: "unable to auth"
            })
        }

        let title = req.body.title
        let description = req.body.description
        let price = Number(req.body.price)
        let thumbnail = req.file.filename
        let stock = Number(req.body.stock)

        // Ejecutar la función de añadir producto correctamente y manejar errores
        let response = await Products.create({ title, description, price, thumbnail, stock, owner });
        if (response) {
            return res.redirect(`/products/${response._id}`)
            // return res.status(201).json(response);
        }

        return res.status(400).json({ message: 'Product not created' }); // Manejar error genérico
    } catch (error) {
        next(error); // Manejar errores correctamente
    }
});

router.get('/', async (req, res, next) => {
    try {
        const productsPerPage = 6; // number of products per page for pagination

        const defaultPage = 1; // default page if 'page' query parameter is not present
        const page = req.query.page ? parseInt(req.query.page) : defaultPage; // get page number from 'page' query parameter or use default value
        const filter = req.query.filter ? req.query.filter : ''; // get filter value from 'filter' query parameter or use empty string

        const query = {}; // empty query object
        if (filter) {
            query.title = { $regex: new RegExp(filter, 'i') }; // add case-insensitive regex for 'title' field if 'filter' query parameter is present
        }

        // paginate Products collection using 'mongoose-paginate-v2' plugin
        const products = await Products.paginate(query, {
            page: page,
            limit: productsPerPage,
            lean: true
        });

        console.log(products); // log paginated products

        return res.status(200).json(products); // send JSON response with paginated products and HTTP status code 200 (OK)
    } catch (error) {
        next(error)
    }
});



router.get('/:pid', async (req, res, next) => {
    try {
        let id = String(req.params.pid)
        let product = await Products.findById(id).exec()
        console.log(product)
        return res.status(200).json(product)
    } catch (error) {
        next(error)
    }
})

router.put('/:pid', async (req, res, next) => {
    try {
        let id = String(req.params.pid)
        let data = req.body
        let response = await Products.findByIdAndUpdate(id, data)
        if (response) {
            return res.status(200).json({ message: 'product updated' })
        }
        return res.status(400).json({ message: 'product not found' })
    } catch (error) {
        next(error)
    }
})

router.get('/edit/:productId', product_edit, async (req, res, next) => {
    try {
        let id = String(req.params.productId)
        let data = req.query
        let response = await Products.findByIdAndUpdate(id, data)
        if (response) {
            return res.status(200).json({ message: 'product updated' })
        }
        return res.status(400).json({ message: 'product not found' })
    } catch (error) {
        next(error)
    }
})

router.delete('/:pid', authorization, async (req, res, next) => {
    try {
        let id = String(req.params.pid)
        let response = await Products.findByIdAndDelete(id)
        if (response) {
            const owner = response.owner
            if (owner != "admin") {
                const ownerdata = await Users.findById(owner)
                if (ownerdata != null) {
                    await transport.sendMail({
                        from: process.env.GMAIL_USER_APP,
                        to: ownerdata.mail,
                        subject: 'Producto Eliminado',
                        text: `Se ha borrado el producto ${response.title} (ID: ${response._id})`,
                    })
                }
            }
            return res.status(200).json({ message: 'product deleted' })
        }
        return res.status(404).json({ message: 'not found' })
    } catch (error) {
        next(error)
    }
})

export default router