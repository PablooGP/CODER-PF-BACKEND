import UserManagerMongo from "../dao/mongo/user.mongo.js"


class UserController {
    constructor(){
        this.userManager = new UserManagerMongo() 
    }
    getUsers = async (req, res)=>{
        try {
            const {page=1} = req.query
            let users = await this.userManager.get()
            const {docs, hasPrevPage, hasNextPage, prevPage, nextPage, totalPages} = users
            res.send({
                status: 'success',
                users: docs,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage
            })
        } catch (error) {
            console.log(error)
        }
    }
    
    createUsers = async (req, res)=>{
        try {
            let user = req.body
            console.log(user)
            if(!user.nombre || !user.apellido){ 
                return res.status(400).send({status:'error', mensaje: 'todos los campos son necesarios'})
            }
    
            const newUser = {
                first_name: user.nombre, 
                last_name: user.apellido,
                email: user.email,
                password: user.password
            } 
            
            let result =  await this.userManager.create(newUser) 
    
            
            res.status(200).send({result})
        } catch (error) {
            console.log(error)
        }
        
    }
    
    updateUsers = async (req, res) => {
        const { uid } = req.params
        const user = req.body

        if(!user.nombre || !user.apellido){ 
            return res.status(400).send({status:'error', mensaje: 'todos los campos son necesarios'})
        }
        let  userToReplace = {
            first_name: user.nombre,
            last_name: user.apellido,
            email: user.email
        }
    
        let result = await this.userManager.updateOne({_id: uid}, userToReplace)
        
    
        res.send({
            status: 'success',
            payload: result
        })
    }
    
    deleteUsers = async (req, res) => {
        try {
            let {uid} = req.params
            let result = await this.userManager.deleteOne({_id: uid})
            res.send({status: 'success', payload: result})
            
        } catch (error) {
            console.log(error)
        }
    }
}

export default new UserController()