const socket = io()
let currentCart = 1

function emit_data() {
    socket.emit( //emit envia datos (en este caso desde el cliente hacia el servidor)
        'primer_conexion', //identificador del mensaje
        { //objeto con las propiedades a enviar (en este caso al servidor)
            name: 'Nico',
            last_name: 'Lopez',
            age: 37
        }
    )
}


socket.on("cartUpdated", (cartContent) => {
    console.log("el carrito tiene:", cartContent, "contenidos")

    const contadorSpan = document.getElementById('contador');
    contadorSpan.innerText = cartContent
})

socket.on("userCartId", (cartId) => {
    console.log("el carrito tiene:", cartContent, "contenidos")
    sessionStorage.setItem("userCart", cartId)
})

socket.emit("getCartContent", sessionStorage.getItem("userCart"))
if (sessionStorage.getItem("userCart") == undefined) {
    const req = fetch("http://localhost:3000/api/carts", {
        method: "POST"
    })
    .then(res => res.json())
    .then(response => {
        sessionStorage.setItem("userCart", response.id)
    })
} // le envia al servidor una solicitud para que haga un carrito para el usuario


