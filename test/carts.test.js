import mongoose, { connect } from "mongoose"

import dotenv from "dotenv"

import { describe } from "mocha"
import Assert from "assert"
import { expect } from "chai"
import supertest from "supertest"

import products from "../src/dao/mongo/product.mongo.js"
import users from "../src/dao/mongo/user.mongo.js"
import carts from "../src/dao/mongo/cart.mongo.js"

dotenv.config()

const assert = Assert.strict
const requester = supertest("http://localhost:3000")

connect(process.env.LINK_MONGO)

describe("Prueba de carts DAO", () => {

    before(function () {
        this.dao = carts
        this.created = []
        this.testNumbers = 5
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    it("Leer todos los carts en general", async function () {
        const result = await this.dao.get()

        expect(typeof result).to.be.equal("object")
    })

    it("Creacion de un cart", async function () {
        let createdproducts = 0

        const created = await this.dao.create({
            products: []
        })

        this.created = created
        expect(typeof created).to.be.equal("object")
    })

    it("Lectura del cart creados anteriormente", async function () {
        const result = await this.dao.getById(this.created.id)
        expect(typeof result).to.be.equal("object")
    })

    it("Borrado del cart creado", async function () {
        const deleted = await this.dao.delete(this.created.id)
        expect(typeof deleted).to.be.equal("object")
    })
})

////////////////////////////////////////////////////////

describe("Prueba de carts via API", () => {

    before(function () {
        this.dao = products
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    it("Leer todos los carts", async function () {
        const result = await requester.get(`/api/carts/`).set('Accept', 'application/json')

        expect(result.status).equal(200)
        expect(result.body[0]).to.have.property("_id")
    })

    it("Creacion de un cart", async function () {
        const result = await requester.post(`/api/carts/`).set('Accept', 'application/json')

        this.created = result.body.id

        expect(result.status).equal(201)
        expect(result.body).to.have.property("id")
        expect(result.body).to.have.property("cart")
        expect(result.body.message).equal("cart created")
    })

    it("Borrar el cart", async function () {
        const result = await requester.delete(`/api/carts/${this.created}`).set('Accept', 'application/json')
        
        expect(result.status).equal(200)
        expect(result.body.message).equal("cart deleted")
    })
})

export default 0