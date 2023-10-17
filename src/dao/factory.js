const { config: { persistence } } = require("../config/config");

let ProductDao
let CartDao
let UserDao

switch (persistence) {
    case 'MONGO':
        ProductDao = require('../dao/mongo/product.mongo.js')
        CartDao    = require('../dao/mongo/cart.mongo.js').default
        UserDao    = require('../dao/mongo/user.mongo.js')

        break;
    case 'MEMORY':
        break;
    case 'FILE':
        break;

    
}

module.exports = {
    ProductDao,
    UserDao,
    CartDao
}