import  Products  from "./models/product.model.js"

class ProductDaoMongo {
    constructor(){
        this.Products = Products
    }
    static get = async (limit=5, page=1) => {
        return await Products.paginate({}, {limit, page, lean: true} )
    }

    static getAll = async () => {
        return await Products.find()
    }

    static getById = async (pid) => {
        return await Products.findOne({_id: pid})
    }
    static create = async (newProduct) => {
        return await Products.create(newProduct)
    }
    static update = async (pid, updateToProduct) => {
        return await Products.findByIdAndUpdate({_id: pid}, updateToProduct)
    }
    static delete = async (pid) => {
        return await Products.findByIdAndDelete({_id: pid})

    }
}

export default  ProductDaoMongo