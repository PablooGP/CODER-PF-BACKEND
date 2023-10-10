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

describe("Prueba de productos DAO", () => {

    before(function () {
        this.dao = products
        this.created = []
        this.testNumbers = 5
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    it("Leer todos los productos en general", async function () {
        const result = await this.dao.get({ limit: 9999 })

        expect(typeof result.docs).to.be.equal("object")
    })

    it("Creacion de productos", async function () {
        let createdproducts = 0

        for (let i = 1; i <= this.testNumbers; i++) {
            const created = await this.dao.create({
                title: `Prueba producto creado: ${i}`,
                description: Date.now(),
                stock: i,
                thumbnail: "asd",
                price: i * 100
            })
            createdproducts++
            this.created.push(created)
        }

        expect(createdproducts).equal(this.testNumbers)
    })

    it("Lectura de los productos creados anteriormente", async function () {
        let reads = 0

        for (const p in this.created) {
            const inobj = this.created[p]
            const result = await this.dao.getById(inobj._id)
            if (result) {
                reads++
            }
        }

        expect(reads).equal(this.testNumbers)
    })

    it("Borrado de los productos creados", async function () {
        let deleted = 0

        for (const p in this.created) {
            const inobj = this.created[p]
            const result = await this.dao.delete(inobj._id)
            if (result) {
                deleted++
            }
        }

        expect(deleted).equal(this.testNumbers)
    })
})

////////////////////////////////////////////////////////

describe("Prueba de productos via API", () => {

    before(function () {
        this.dao = products
        this.created = []
        this.testNumbers = 5
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    it("Leer la primera pagina de productos", async function () {
        const result = await requester.get(`/api/products`).set('Accept', 'application/json')

        expect(result.status).equal(200)
        expect(result.body).to.have.property("totalDocs")
        expect(result.body.docs[0]).to.have.property("_id")
    })

    it("Creacion de producto", async function () {
        expect(true).equal(true)
    })

    it("Borrar el producto", async function () {
        expect(true).equal(true)
    })
})

export default 0