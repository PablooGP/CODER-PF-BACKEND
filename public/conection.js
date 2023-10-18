const socket = io()

function emit_data() {
    socket.emit(
        'primer_conexion',
        {
            name: 'Nico',
            last_name: 'Lopez',
            age: 37
        }
    )
}


socket.on("cartUpdated", (cartContent) => {
    const contadorSpan = document.getElementById('contador');
    contadorSpan.innerText = cartContent
})

socket.on("userCartId", (cartId) => {
    localStorage.setItem("userCart", cartId)
})

socket.emit("getCartContent", localStorage.getItem("userCart"))

const updateCartId = async () => {

    if (localStorage.getItem("userCart") == null) {
        localStorage.removeItem("userCart")
    }
    
    if (localStorage.getItem("userCart")) {
        const req = await fetch(`/api/carts/${localStorage.getItem("userCart") }`, {
            method: "GET",
        })
        if (req.status != 200 && req.status != 201) {
            localStorage.removeItem("userCart")
        }
    }
    
    if (!localStorage.getItem("userCart")) {
        const req = fetch("/api/carts", {
            method: "POST"
        })
        .then(res => res.json())
        .then(response => {
            localStorage.setItem("userCart", response.id)
        })
    }
    
}

updateCartId()