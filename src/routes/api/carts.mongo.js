import { Router } from "express"
import { Types } from "mongoose"
import Carts from '../../dao/mongo/models/cart.model.js'
import Products from "../../dao/mongo/models/product.model.js"
import Tickets from "../../dao/mongo/models/ticket.model.js";
import Users from "../../dao/mongo/models/user.model.js";


const router = Router()

router.post('/', async (req, res, next) => {
    try {
        const response = await Carts.create({products: []})
        if (response) {
            return res.status(201).json({ id: response._id.toJSON(), cart: response, message: 'cart created' })
        }
        return res.status(400).json({ message: 'not created' })
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const all = await Carts.find().exec()
        res.status(200).json(all)
    } catch (error) {
        next(error)
    }
})

router.get('/:cid', async (req, res, next) => {
    try {
        let id = req.params.cid
        const one = await Carts.findById(id).populate({
            path: 'products',
            populate: {
                path: 'product',
                model: "products"
            }
        }).exec()

        one.products.sort((a, b) => {
            if (a.product.title < b.product.title) return -1
            if (a.product.title > b.product.title) return 1
            return 0
        })
        // intente con la parte de abajo y nose, no pude.
        //let one = await Carts.findById(id).populate("products.product").sort({"products.units": "desc"})
        return res.status(200).json(one)
    } catch (error) {
        next(error)
    }
})

router.put('/:cid', async (req, res, next) => {
    try {
        let id = req.params.cid
        let data = req.body

        let response = await Carts.findByIdAndUpdate(id, data)
        if (response) {
            return res.status(200).json({ message: 'cart updated' })
        }
        return res.status(404).json({ message: 'not found' })
    } catch (error) {
        next(error)
    }
})


router.put("/:cid/product/:pid/:units", async (req, res, next) => {
    try {
        const id = req.params.pid;
        const cid = req.params.cid;
        const units = Number(req.params.units);

        const cart = await Carts.findById(cid)
        const product = await Products.findById(id)

        if (product.owner == req.user._id) {
            return res.status(401).json({
                success: false,
                message: "[TRADUCIR ESTO]: No se puede añadir un producto de tu propiedad al carro"
            })
        }

        if (cart && product) {
            if (product.stock >= units) {
                product.stock -= units
                const index = cart.products.findIndex(e=>e.product == id)
                if ( index == -1) {
                    cart.products.push({product: id, units: units})
                } else {
                    cart.products[index].units += units
                    cart.markModified('products');
                }

                await cart.save()
                await product.save()

                return res.status(200).json({ message: "Cart updated" });
            } else {
                return res
                    .status(400)
                    .json({ message: "Not enough stock available" });
            }
        } else {
            return res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        next(error);
    }
});


router.delete('/:cid', async (req, res, next) => {
    try {
        let id = req.params.cid
        let response = await Carts.findByIdAndDelete(id)
        if (response) {
            return res.json({ status: 200, message: 'cart deleted' })
        }
        return res.json({ status: 404, message: 'not found' })
    } catch (error) {
        next(error)
    }
})


router.delete("/:cid/product/:pid/:units", async (req, res, next) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const units = Number(req.params.units);

        if (Number.isNaN(units)) {
            return res.status(400).json({ message: "Invalid units parameter" });
        }

        const cart = await Carts.findById(cid)
        const product = await Products.findById(pid)
        if (cart == null || product == null) { return res.status(400).json({message: "product or cart null"})}

        const index = cart.products.findIndex(e => e.product == pid)
        if (index == -1) { return res.status(400).json({message: "product not in cart"})}
        if (units > cart.products[index].units) { return res.status(400).json({message: "invalid units"})}

        cart.products[index].units -= units
        if (cart.products[index].units <= 0) {
            cart.products.splice(index, 1)
        }
        product.stock += units
        cart.markModified('products');

        await cart.save()
        await product.save()

        return res.status(200).json({message: "successfully updated"})

    } catch (error) {
        next(error);
    }
});

router.get("/bills/:cid", async (req, res, next) => {
    try {
        const cid = req.params.cid;
        const cart = await Carts.findById(cid).populate({
            path: 'products',
            populate: {
                path: 'product',
                model: "products"
            }
        }).exec()

        let price = 0
        console.log(cart)
        cart.products.forEach(e => {
            if (typeof e.product == typeof []) {
                price += e.product.price*e.units
            }
        })
        return res.status(200).json({success: true, price})
    } catch(err) {
        next(err)
    }
})

router.post("/:cid/purchase", async (req, res, next) => {
    try {
        const cid = req.params.cid;
        const user = await Users.findOne();

        if (!user || !user.mail) {
            return res.status(400).json({ message: "User or user email not found" });
        }

        const purchaser = user.mail;

        const cart = await Carts.findById(cid).populate({
            path: 'products',
            populate: {
                path: 'product',
                model: "products"
            }
        }).exec()

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        let successItems = [];
        let failedItems = [];
        let totalAmount = 0;

        for (let item of cart.products) {
            const product = await Products.findById(item.product._id)
            if (product.stock >= item.units) {
                product.stock -= item.units;
                await product.save();
                successItems.push({
                    product: item.product._id,
                    units: item.units,
                    title: item.product.title,
                    price: item.product.price,
                });
                totalAmount += item.units * item.product.price;
            } else {
                failedItems.push({
                    product: item.product._id,
                    units: item.units,
                    title: item.product.title,
                    message: "Not enough stock"
                });
            }
        }

        if (successItems.length > 0) {
            const ticket = new Tickets({
                amount: totalAmount,
                purchaser: purchaser
            });
            await ticket.save();

            console.log(ticket.toObject())
        }

        cart.products = failedItems.map(failedItem => failedItem.product);
        await cart.save();

        console.log(cart.toObject())

        return res.status(200).json({
            message: "Purchase processed",
            successItems: successItems,
            failedItems: failedItems,
        });
    } catch (error) {
        next(error);
    }
});

export default router