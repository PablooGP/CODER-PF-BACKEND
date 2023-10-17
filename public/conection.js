const socket = io()
let currentCart = 1

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
    sessionStorage.setItem("userCart", cartId)
})

socket.emit("getCartContent", sessionStorage.getItem("userCart"))
if (sessionStorage.getItem("userCart") == undefined) {
    const req = fetch("/api/carts", {
        method: "POST"
    })
    .then(res => res.json())
    .then(response => {
        sessionStorage.setItem("userCart", response.id)
    })
}