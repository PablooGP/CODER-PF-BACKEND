import fs from 'fs'

class User {
    constructor(path) {
        this.users = [] 
        this.path = path
        this.init(path)
    }
    init(path) {
        let file = fs.existsSync(path)
        if (!file) {
            fs.writeFileSync(path,'[]')
            console.log('file created at path: '+this.path)
            return 'file created at path: '+this.path
        } else {
            this.users = JSON.parse(fs.readFileSync(path,'UTF-8'))
            console.log('data recovered')
            return 'data recovered'
        }
    }
    async add_user({ name,last_name,age,url_photo }) {
        try {
            let data = { name,last_name,age,url_photo }
            if (this.users.length>0) {
                let next_id = this.users[this.users.length-1].id+1
                data.id = next_id
            } else {
                data.id = 1
            }
            this.users.push(data)
            let data_json = JSON.stringify(this.users,null,2)
            await fs.promises.writeFile(this.path,data_json)
            return { uid: data.id }
        } catch(error) {
            console.log(error)
            return null
        }
    }
    read_users() {
        return this.users
    }
    read_user(id) {
        let one = this.users.find(each=>each.id===id)
        return one
    }
    async update_user(id,data) {
        try {
            let one = this.read_user(id)
            for (let prop in data) {
                one[prop] = data[prop]
            }
            let data_json = JSON.stringify(this.users,null,2)
            await fs.promises.writeFile(this.path,data_json)
            return 'updated user: '+id
        } catch(error) {
            console.log(error)
            return 'error: updating user'
        }
    }
    async destroy_user(id) {
        try {
            this.users = this.users.filter(each=>each.id!==id)
            let data_json = JSON.stringify(this.users,null,2)
            await fs.promises.writeFile(this.path,data_json)
            return 'delete user: '+id
        } catch(error) {
            console.log(error)
            return 'error: deleting user'
        }
    }
}

let manager = new User('./src/data/users.json')

export default manager