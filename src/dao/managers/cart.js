import fs from 'fs'
import prod_manager from '../managers/product.js'


class Cart {
    constructor(path) {
        this.carts = []
        this.path = path
        this.init(path)
    }
    init(path) {
        let file = fs.existsSync(path)
        if (!file) {
            fs.writeFileSync(path,'[]')
            console.log('file created at path: '+this.path)
            return 201
        } else {
            this.carts = JSON.parse(fs.readFileSync(path,'UTF-8'))
            console.log('data recovered')
            return 200
        }
    }
    async add_cart() {
        try {
            let data = { products: [] }
            //por ahora vacío y luego contendrá objetos con pid y quantity
            if (this.carts.length>0) {
                let next_id = this.carts[this.carts.length-1].id+1
                data.id = next_id
            } else {
                data.id = 1
            }
            this.carts.push(data)
            let data_json = JSON.stringify(this.carts,null,2)
            await fs.promises.writeFile(this.path,data_json)
            console.log('id´s created cart: '+data.id)
            return 201
        } catch(error) {
            console.log(error)
            return null
        }
    }
    read_carts() {
        return this.carts
    }
    read_cart(id) {
        return this.carts.find(each=>each.id===id)
    }


    async reserve_stock(cid, pid, x) {
            try {
            let auxCart = this.read_cart(cid);
            let auxProducts = prod_manager.read_products();
            let auxProduct = prod_manager.read_product(pid);
            if (auxProduct.stock < x || auxProduct.stock <= 0) return null
        
            if (!auxCart) { // si no existe el carro con ese id directamente se agregara con el contenido y regresara todo ok.
                this.carts.push({
                    id: auxProduct.id,
                    products: [
                        {pid: pid, x: x}
                    ]
                });
                let data_json = JSON.stringify(this.carts, null, 2);
                await fs.promises.writeFile(this.path, data_json);
                return 200;
            }
            const index = auxProducts.findIndex(e => e.id == cid)
            if (index == -1) return null

            const index2 = this.carts[index].products.findIndex(e => e.pid == pid)
            if (index2 == -1) {
                this.carts[index].products.push({
                    pid: pid,
                    x: x
                })
            } else {
                console.log(this.carts[index].products[index2])
                this.carts[index].products[index2].x += Number(x)
            }
            for (let index = 0; index < auxProducts.length; index++) {
                let element = auxProducts[index];
                if (pid === element.id) {
                auxProducts[index].stock = element.stock - x;
                prod_manager.update_product(pid, element);
                }
            }
            // this.carts.push(auxCart);
            let data_json = JSON.stringify(this.carts, null, 2);
            await fs.promises.writeFile(this.path, data_json);
            return 200;
            } catch (error) {
            console.log(error);
            return null;
            }
        }

        async delete_cart(cid, pid, x) {
            try {
                const cart = this.read_cart(cid);
                if (cart==undefined) return null

                const product = prod_manager.read_product(pid)

                const cartIndex = cart.products.findIndex(e => e.pid == pid)
                if (cartIndex == -1) return

                if (cart.products[cartIndex].x <= 0) return
                if (cart.products[cartIndex].x-x < 0) return

                cart.products[cartIndex].x -= x

                cart.products = cart.products.filter(e => e.x > 0)
                product.stock += x

                let data_json = JSON.stringify(this.carts, null, 2);
                await fs.promises.writeFile(this.path, data_json);
                return 200;

            } catch(err) {
                console.log(err);
                return null;
            }
            }


    async destroy_cart(id) {
        try {
            let one = this.carts.find(each=>each.id===id)
            if (one) {
                this.carts = this.carts.filter(each=>each.id!==id)
                let data_json = JSON.stringify(this.carts,null,2)
                await fs.promises.writeFile(this.path,data_json)
                console.log('delete cart: '+id)
                return 200
            }
            console.log('not found')
            return null
        } catch(error) {
            console.log(error)
            return null
        }
    }

}
let manager = new Cart('./src/data/carts.json')


export default manager