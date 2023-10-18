import mongoose from "mongoose";

class MongoSingleton {
    static #instance;
    constructor(){
        mongoose.connect(process.env.LINK_MONGO);
    }

    static getInstance(){
        if(this.#instance){
            console.log('Already connect')
            return this.#instance

        }
        this.#instance = new MongoSingleton()
        console.log('connected')
        return this.#instance
    }
}

export default MongoSingleton

