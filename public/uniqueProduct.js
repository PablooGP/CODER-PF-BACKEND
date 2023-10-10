
const websiteUrl = 'http://localhost:3000'

const ConvertPrice = (amount, add) => {// recibe dos valores: un numero y un texto para agregar entre separaciones (Esto para convertir el amount en un texto mas bonito para el usuario)
    try {
        amount = Number(amount)

        const entero = Math.floor(amount)
        const centavos = amount - entero
        const amountString = entero.toString()
        const amountArray = amountString.split("")
        const amountString_reverse = amountArray.reverse().join("")

        let text = ""
        let init = 0
        if (entero > 999) {
            const cant = Math.floor(amountArray.length / 3)
            for (let i = 0; i < cant; i++) {
                text += amountString_reverse.substring(init, init + 3) + add
                init += 3
            }
            if (init < amountString_reverse.length) { text += amountString_reverse.substring(init) }
            else { text = text.substring(0, text.length - 1) }

            text = text.split("").reverse().join("")
        } else {
            text = String(entero)
        }
        if (centavos != 0) text += "," + (String(centavos) + "0").substring(2, 4) // esta mezcla toda rara es para evitar el .555555555555 y el 0.5 para que finalize en "0.55" y "0.50"}
        text = "$ " + text
        return text
    } catch (err) {
        return "ERROR"
    }
}

const adminButtons = async (parent) => {
    const content = window.location.pathname.split("/")

    const request = await fetch(`/api/products/canEdit/${content[2]}`)

    if (request.status == 200) {
        const json = await request.json()

        console.log(json)
        if (json.success) {
            const prodEditButton = document.createElement("button")

            parent.appendChild(prodEditButton)
            
            prodEditButton.classList.add("btn")
            prodEditButton.classList.add("prodEditButton")
            prodEditButton.classList.add("prodAddButton-enabled")

            prodEditButton.textContent = "EDIT PRODUCT"

            prodEditButton.addEventListener("click", () => {
                window.location.replace(`/edit-product/${content[2]}`)
            })

            const prodDeleteButton = document.createElement("button")

            parent.appendChild(prodDeleteButton)
            
            prodDeleteButton.classList.add("btn")
            prodDeleteButton.classList.add("prodDeleteButton")
            prodDeleteButton.classList.add("prodAddButton-enabled")

            prodDeleteButton.textContent = "DELETE PRODUCT"

            prodDeleteButton.addEventListener("click", async () => {

                const res = await fetch(`/api/products/${content[2]}`, { method: "DELETE"})

                if (res.status == 200){
                    window.location.replace("/products")
                }
            })

        }
    }


}

const createView = async () => {

    const { pathname } = window.location

    const req = await fetch(`/api${pathname}`, { method: "GET" })
    if (req.status != 200) return

    const response = await req.json()

    const bigUniqueProduct = document.getElementById("productContainer")

    const prodTitle = document.createElement("p")
    const prodDescription = document.createElement("p")
    const divisor1 = document.createElement("div")
    const divisor2 = document.createElement("div")
    const prodPrice = document.createElement("p")
    const addStockSumar = document.createElement("button")
    const addStockRestar = document.createElement("button")
    const addStockInput = document.createElement("input")
    const prodAddButton = document.createElement("button")
    const prodImage = document.createElement("img")


    bigUniqueProduct.appendChild(prodTitle)
    bigUniqueProduct.appendChild(prodDescription)
    bigUniqueProduct.appendChild(divisor1)
    bigUniqueProduct.appendChild(divisor2)
    bigUniqueProduct.appendChild(prodPrice)
    bigUniqueProduct.appendChild(addStockSumar)
    bigUniqueProduct.appendChild(addStockRestar)
    bigUniqueProduct.appendChild(addStockInput)
    bigUniqueProduct.appendChild(prodAddButton)
    bigUniqueProduct.appendChild(prodImage)

    prodTitle.classList.add("prodTitle-creator")
    prodTitle.classList.add("prodTitle-position-bigproduct")
    prodDescription.classList.add("prodDescription-creator")
    divisor1.classList.add("divisor1")
    divisor2.classList.add("divisor2")
    prodPrice.classList.add("prodPrice-creator")
    prodPrice.classList.add("prodPrice-position")
    addStockSumar.classList.add("addStock-mas")
    addStockSumar.classList.add("btn")
    addStockRestar.classList.add("addStock-menos")
    addStockRestar.classList.add("btn")
    addStockInput.classList.add("addStock-input")

    prodAddButton.classList.add("btn")
    prodAddButton.classList.add("prodAddButton")
    prodAddButton.classList.add(response.stock > 0 ? "prodAddButton-enabled" : "prodAddButton-disabled")

    prodImage.classList.add("prodImage-big")

    addStockSumar.type = "button"
    addStockRestar.type = "button"

    addStockSumar.textContent = "+"
    addStockRestar.textContent = "-"
    addStockInput.placeholder = "1"

    prodAddButton.textContent = response.stock > 0 ? "ADD 1 PRODUCT TO CART" : "PRODUCT WITHOUT STOCK"

    prodAddButton.type = "button"

    prodImage.alt = response.title
    prodImage.src = `/public/img/${response.thumbnail}`

    prodPrice.textContent = ConvertPrice(response.price, ".")
    prodTitle.textContent = response.title
    prodDescription.textContent = response.description

    let currentAmount = 1

    const pid = response._id

    const add = (type) => {
        const x = 1
        if (currentAmount.stock <= 0) {
            prodAddButton.textContent = "PRODUCT WITHOUT STOCK"
        } else {
            if (type == "-") {
                currentAmount -= 1
            } else {
                currentAmount += 1
            }

            const max = Math.max(1, currentAmount)
            const min = Math.min(max, response.stock, 9)
            currentAmount = min

            prodAddButton.textContent = "ADD TO CART"//currentAmount == 1 ? `ADD 1 PRODUCT TO CART` : `ADD ${currentAmount} PRODUCTS TO CART`
            addStockInput.value = currentAmount
        }
    }
    
    addStockRestar.addEventListener("click", () => {
        add("-")
    })

    addStockSumar.addEventListener("click", () => {
        add("+")
    })

    prodAddButton.addEventListener("click", async () => {
        console.log(sessionStorage.getItem("userCart"))
        const request = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}/product/${pid}/${currentAmount}`, {
            method: "PUT",
            body: JSON.stringify({ units: currentAmount }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const response = await request.json()

        if (request.status == 200) {
            socket.emit("getCartContent", sessionStorage.getItem("userCart"))
            Swal.fire({
                title: currentAmount == 1 ? `Product added successfully` : `${currentAmount} Products added successfully`,
                icon: 'error',
                position: 'bottom-right',
                confirmButtonText: 'Cool',
                showConfirmButton: false,
                animation: false,
                toast: true,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true
            })
        }
    })

    addStockInput.addEventListener("keyup", (data) => {
        const n = Number(data.key)
        if (n != NaN && n > 0 && n < 10) {
            currentAmount = Math.min(n, response.stock)
        } else {
            addStockInput.value = currentAmount
        }
    })

    add("-")
    adminButtons(bigUniqueProduct)
}

createView()