import ProductDaoMongo from '../dao/Mongo/product.mongo.js';
import ProductRepository from '../repositories/product.repositories.js';
import UserManagerMongo from '../dao/Mongo/User.mongo.js';
import CartDaoMongo from '../dao/Mongo/Cart.mongo.js';

const productService = new ProductRepository(new ProductDaoMongo());
const userService = new UserManagerMongo();
const cartService = new CartDaoMongo();

export default {
    productService,
    userService,
    cartService,
}