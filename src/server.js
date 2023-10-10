import server from "./app.js"
import { Server } from "socket.io"
import Carts from "./dao/mongo/models/cart.model.js"
import { connect } from "mongoose"
import Users  from './dao/mongo/models/user.model.js'


const PORT = process.env.PORT || 3000; // Change 3000 to 3001 or any other available port
const ready = ()=> {
    console.log('server ready on port '+PORT);
    connect(process.env.LINK_MONGO)
    .then(()=>console.log('Conectado a la base de datos'))
    .catch(err=>console.log(err))
}

let http_server = server.listen(PORT,ready)
let socket_server = new Server(http_server)

/*
server.get('/api/user', async (req, res) =>{    
    try {  
        const { limit=5, page=1 }= req.query
        // console.log('limit: ', limit)
        // console.log('page: ', page)
        const result = await Users.paginate({}, {limit, page})           
        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        console.log(error) 
    }
})

server.post('/api/user', async (req, res) =>{
    //mada el  cliente request 
    try {
        let {first_name, last_name, email, password } = req.body

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({ 'error': error})
        }           

        let result= await Users.create({            
                        first_name,
                        last_name,
                        email,
                        password
                    })
    
        res.status(201).send({ 
            status: 'success',
            payload: result
        })
        
    } catch (error) {
        console.dir(error)            
    }
        
    
})*/

// server.listen(PORT, () => {
//     console.log(`Server listening on: http://localhost:${PORT}`)
// })



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

// Chatroom

    let addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
        
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
