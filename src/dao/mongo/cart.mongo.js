import carts from "../mongo/models/cart.model.js"

class CartDaoMongo {
    static async get(){
        return await carts.find()
    }
    static async getById(id){
        return await carts.findById(id)
    }
    static async create(data){
        return await carts.create(data)
    }
    static async update(id, data){
        return await carts.create(id, data)
    }
    static async delete(id){
        return await carts.deleteOne({id})
    }
    
}

export default CartDaoMongo
