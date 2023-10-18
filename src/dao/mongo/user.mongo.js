import Users from "../mongo/models/user.model.js";

class UserManagerMongo {
    constructor() {
        this.userModel = Users;
    }

    static getUser = async (limit = 10, page = 1) => await Users.paginate({}, { limit, page, lean: true });

    static getAll = async () => await Users.find();

    static getByIdUser = async (uid) => await Users.findOne({ _id: uid });

    static createUser = async (newUser) => await Users.create(newUser);

    static updateUser = async (uid, userUpdate) => await Users.findOneAndUpdate({ _id: uid }, userUpdate);

    static deleteUser = async (uid) => await Users.findOneAndDelete({ _id: uid });
}

export default UserManagerMongo;