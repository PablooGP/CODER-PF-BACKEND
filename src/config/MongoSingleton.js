import mongoose from "mongoose";

//get http:// dominio.com

class MongoSingleton {
    static #instance;
    constructor(){
        mongoose.connect('mongodb+srv://lopeznicolas055:Caroso&narizota729@base-de-datos-nico.w4hipvq.mongodb.net/commerce');
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

