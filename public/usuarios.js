const create_card = (firstname, lastname, role) => {
    const adminType = role == "admin" ? 0 : 1
    return `
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Nombre: ${firstname}</h5>
            <p class="card-text">Apellido: ${lastname}</p>
            <p class="card-text">Rol: ${role}</p>
            ${adminType == 1 ?
                `<div>
                    <button class="toggleRole btn agregar-carrito">${role == "user" ? "Convertir en Premium" : "Convertir en Usuario" }</button>
                    <button class="deleteUser btn agregar-carrito">Borrar usuario</button>
                </div>` : ""}
        </div>
    </div>
    `
}

const toggleRole = async (id) => {
    const req = await fetch(`/api/users/premium/${id}`, { method: "GET" })
    console.log(req)
    if (req.status != 200) return

    const json = await req.json()
    console.log(json)

    return json.success
}

const deleteUser = async (id) => {
    const req = await fetch(`/api/users/${id}`, { method: "DELETE" })
    console.log(req)
    if (req.status != 200) return

    const json = await req.json()
    console.log(json)

    return json.success
}

const update = async () => {
    const user_cars = document.getElementsByClassName("user-cards")
    const item = user_cars[0]

    if (item == undefined) return
    while (item.firstChild != undefined) {
        item.firstChild.remove()
    }

    const req = await fetch("/api/users", { method: "GET" })
    if (req.status != 200) return

    const json = await req.json()
    json.forEach(user => {
        const child = document.createElement("div")
        child.innerHTML = create_card(user.first_name, user.last_name, user.role)
        item.appendChild(child)

        const toggleRoleButton = child.getElementsByClassName("toggleRole")[0]
        const deleteUserButton = child.getElementsByClassName("deleteUser")[0]

        if (toggleRoleButton != undefined) {
            toggleRoleButton.addEventListener("click", async () => {
                if (await toggleRole(user._id) == true) {
                    update()
                }
            })
        }

        if (deleteUserButton != undefined) {
            deleteUserButton.addEventListener("click", async () => {
                if (await deleteUser(user._id) == true) {
                    update()
                }
            })
        }
    });
}

update()