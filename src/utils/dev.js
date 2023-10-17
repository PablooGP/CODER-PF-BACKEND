const ConvertPrice = (amount, add) => {
    try {
        amount = Number(amount)

        const entero = Math.floor(amount)
        const centavos = amount-entero
        const amountString = entero.toString()
        const amountArray = amountString.split("")
        const amountString_reverse = amountArray.reverse().join("")

        let text = ""
        let init = 0
        if (entero>999) {
            const cant = Math.floor(amountArray.length/3)
            for (let i = 0; i<cant; i++) {
                text += amountString_reverse.substring(init, init+3) + add
                init += 3
            }
            if (init<amountString_reverse.length) { text += amountString_reverse.substring(init) }
            else { text = text.substring(0, text.length-1) }

            text = text.split("").reverse().join("")
        } else {
            text = String(entero) 
        }
        if (centavos != 0)  text += "," + (String(centavos) + "0").substring(2, 4)
        text = "$ " + text
        return text
    } catch(err) {
        return "ERROR"
    }
}

const ConvertProduct = prod => {
    prod.inStock = prod.stock>0
    prod.price = ConvertPrice(prod.price, ".")
    return prod
}

const ProductsArrayConvert = arr => {

    const stockProducts = []
    const nostockProducts = []

    arr.forEach(e => {
        const conv = ConvertProduct(e)
        if (e.stock > 0) {
            stockProducts.push(conv)
        } else {
            nostockProducts.push(conv)
        }
    })
    
    return [...stockProducts, ...nostockProducts]
}
export { ConvertProduct, ProductsArrayConvert }