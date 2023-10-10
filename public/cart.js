
const websiteUrl = 'http://localhost:3000'

const checkoutButton = document.getElementById("checkoutButton")

const ConvertPrice = (amount, add) => {// recibe dos valores: un numero y un texto para agregar entre separaciones (Esto para convertir el amount en un texto mas bonito para el usuario)
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
        if (centavos != 0)  text += "," + (String(centavos) + "0").substring(2, 4) // esta mezcla toda rara es para evitar el .555555555555 y el 0.5 para que finalize en "0.55" y "0.50"}
        text = "$ " + text
        return text
    } catch(err) {
        return "ERROR"
    }
}

const update = async () => {

    const elementProductList = document.getElementById("productList")
    if (elementProductList == undefined) return

    //const productsRequest = await fetch(`${websiteUrl}/api/products`)
    const cartRequest = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}`)
    const cartpriceRequest = await fetch(`${websiteUrl}/api/carts/bills/${sessionStorage.getItem("userCart")}`)
    const cartResponse = await cartRequest.json()
    const cartpriceResponse = await cartpriceRequest.json()

    //if (productsRequest.status != 200) return
    if (cartRequest.status != 200) return

    while (elementProductList.firstChild) elementProductList.removeChild(elementProductList.firstChild);

    cartResponse.products.forEach(e => {
        
        const divContainer = document.createElement("div")
        const img = document.createElement("img")
        const title = document.createElement("p")
        const amount = document.createElement("p")
        const total = document.createElement("p")
        const remove = document.createElement("button")
        const add = document.createElement("button")
        const del = document.createElement("button")

        const separador = document.createElement("div")

        divContainer.appendChild(img)
        divContainer.appendChild(title)
        divContainer.appendChild(amount)
        divContainer.appendChild(total)
        divContainer.appendChild(remove)
        divContainer.appendChild(add)
        divContainer.appendChild(del)

        
        const productData = e.product


        divContainer.classList.add("cartContainer")

        del.classList.add("btn")
        del.classList.add("deleteButton")
        del.textContent = `REMOVE ${e.units}`

        remove.classList.add("btn")
        remove.classList.add("removeButton")
        remove.textContent = "-"

        add.classList.add("btn")
        add.classList.add("addButton")
        add.textContent = "+"

        title.classList.add("cartProductTitleText")

        amount.classList.add("cartAmountProductsText")

        total.classList.add("totalText")

        img.classList.add("cartImageProduct")
        img.src = productData.thumbnail

        const calc = ConvertPrice(e.units*productData.price, ".")
        title.textContent = productData.title
        total.textContent = `Total: ${calc}`
        amount.textContent = `${ConvertPrice(productData.price, ".")} x ${e.units}`

        elementProductList.appendChild(divContainer)
        
        checkoutButton.textContent = `TOTAL TO PAY ${ConvertPrice(cartpriceResponse.price, ".")}`
        console.log(productData)
        del.addEventListener("click", async () => {
            const req = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}/product/${productData._id}/${e.units}`, {
                method: "DELETE"
            })
            const response = await req.json()
            
            if (req.status == 200) {
                update()
                socket.emit("getCartContent", sessionStorage.getItem("userCart"))
            }
        })

        remove.addEventListener("click", async () => {
            const req = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}/product/${productData._id}/${1}`, {
                method: "DELETE"
            })
            const response = await req.json()

            if (req.status == 200) {
                update()
                socket.emit("getCartContent", sessionStorage.getItem("userCart"))
            }
        })

        add.addEventListener("click", async () => {
            const req = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}/product/${productData._id}/${1}`, {
                method: "PUT"
            })
            const response = await req.json()

            if (req.status == 200) {
                update()
                socket.emit("getCartContent", sessionStorage.getItem("userCart"))
            }
        })

        separador.classList.add("separador")
        elementProductList.appendChild(separador)
    });
}

update()