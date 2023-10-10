import CartMongoDao from "../dao/mongo/cart.mongo.js"

let cartService = new CartMongoDao()   

class CartController {


    getCarts =  (req,res) => {
        let result = cartService.get()
        res.send(result)
    }
    getCart =  (req,res) => {
        let result = cartService.getById()
        res.send(result)
    }
    createCart =  (req,res) => {
        let result = cartService.create()
        res.send(result)
    }
    updateCart =  (req,res) => {
        let result = cartService.update()
        res.send(result)
    }
    deleteCart =  (req,res) => {
        let result = cartService.delete()
        res.send(result)
    }
}

export default new CartController()