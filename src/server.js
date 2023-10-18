import server from "./app.js"
import { Server } from "socket.io"
import Carts from "./dao/mongo/models/cart.model.js"
import { connect } from "mongoose"
import Users  from './dao/mongo/models/user.model.js'


const PORT = process.env.PORT || 3000;
const ready = ()=> {
    console.log('server ready on port '+PORT);
    connect(process.env.LINK_MONGO)
    .then(()=>console.log('Conectado a la base de datos'))
    .catch(err=>console.log(err))
}

let http_server = server.listen(PORT,ready)
let socket_server = new Server(http_server)


let numUsers = 0;


socket_server.on("connection", socket => {

    socket.on("getUserCartId", async () => {
        
    })

    socket.on("getCartContent", async (cartId) => {

        console.log("el servidor recibio una solicitud de carrito:", cartId)
        try {
            const Cart = await Carts.findById(cartId)
            console.log(Cart)
            if (Cart != null) {
                let i = 0
                Cart.products.forEach(e => {
                    i += e.units
                })
                    
                socket.emit("cartUpdated", i)
            } else {
                socket.emit("cartUpdated", 0)
            }
        } catch (err) {
            socket.emit("cartUpdated", -1)
            console.log(err)
        }
    }) 
})




socket_server.on('connection', (socket) => {
    let addedUser = false;
    socket.on('new message', (data) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
        
    });

    socket.on('add user', (username) => {
        if (addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
