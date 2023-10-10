const websiteUrl = 'http://localhost:3000'

const urlParams = new URLSearchParams(window.location.search)
const page = urlParams.get("page") || 1

const previousPageButton = document.getElementById("previousPageButton")
const nextPageButton = document.getElementById("nextPageButton")

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

const updateView = async () => {
    console.log("upd view")
    console.log("viendo la pagina:", page)
    const req = await fetch(`${websiteUrl}/api/products?page=${page}`, { method: "GET" })
    if (req.status != 200) return
    const response = await req.json()

    console.log(response)

    const total_container = document.getElementById("containerElementos")
    
    previousPageButton.hidden = (Number(page) <= 1)
    nextPageButton.hidden = response.nextPage == null

    previousPageButton.href = `/products?page=${Math.max(1, Number(page)-1 )}`
    nextPageButton.href = `/products?page=${Math.max(1, Number(page)+1 )}`

    response.docs.forEach(e => {
        const card = document.createElement("div")

        const thumbnailContainer = document.createElement("div")
        const anchor = document.createElement("a")
        const img = document.createElement("img")

        const cardBody = document.createElement("div")
        const h5 = document.createElement("h5")
        const p = document.createElement("p")
        const button = document.createElement("button")

        cardBody.appendChild(h5)
        cardBody.appendChild(p)
        cardBody.appendChild(button)
        thumbnailContainer.appendChild(anchor)
        anchor.appendChild(img)

        card.appendChild(thumbnailContainer)
        card.appendChild(cardBody)

        card.classList.add("card")
        thumbnailContainer.classList.add("thumbnailContainer")
        anchor.classList.add("invisible-button")
        img.classList.add("card-img-top")

        cardBody.classList.add("card-body")
        p.classList.add("card-text")
        
        button.classList.add('btn')
        button.classList.add(e.stock > 0 ? "agregar-carrito" : "sin-stock")
        button.textContent = e.stock > 0 ? "AGREGAR AL CARRITO" : "SIN STOCK"

        img.src = e.thumbnail
        img.alt = e.title
        button.type = "button"
        h5.textContent = e.title
        p.textContent = ConvertPrice(e.price, ".")
        total_container.appendChild(card)

        const pid = e._id
        const units = 1

        anchor.href = `/products/${pid}`
        button.addEventListener("click", async (data) => {
            console.log(sessionStorage.getItem("userCart"))
            console.log(pid)
            const request = await fetch(`${websiteUrl}/api/carts/${sessionStorage.getItem("userCart")}/product/${pid}/${units}`, {
                method: "PUT",
                body: JSON.stringify({units: units}),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            
            const response = request.json()

            if (request.status == 200) {
                socket.emit("getCartContent", sessionStorage.getItem("userCart"))
                Swal.fire({
                    title: `Product added successfully`,
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
    })
}

updateView()