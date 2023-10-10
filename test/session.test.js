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

describe("Prueba Session DAO", () => {

    before(function () {
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    // Sin terminar

    it("Registro de usuario", async function () {
        expect(true).equal(true)
    })

    it("Login de usuario", async function () {
        expect(true).equal(true)
    })

    it("Logout usuario", async function () {
        expect(true).equal(true)
    })

})

////////////////////////////////////////////////////////

describe("Prueba Session API", () => {

    before(function () {
    })

    beforeEach(function () {
        this.timeout(2500)
    })

    // Sin terminar
    
    it("Registro de usuario", async function () {
        expect(true).equal(true)
    })

    it("Login de usuario", async function () {
        expect(true).equal(true)
    })

    it("Logout usuario", async function () {
        expect(true).equal(true)
    })

})

export default 0