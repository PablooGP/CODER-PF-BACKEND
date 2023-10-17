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
    localStorage.setItem("userCart", cartId)
})

socket.emit("getCartContent", localStorage.getItem("userCart"))
if (localStorage.getItem("userCart") == undefined) {
    const req = fetch("/api/carts", {
        method: "POST"
    })
    .then(res => res.json())
    .then(response => {
        localStorage.setItem("userCart", response.id)
    })
}