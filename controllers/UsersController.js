import dbClient from "../utils/db";
import { hash } from "bcrypt";

export default class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Missing email" });
        }

        if (!password) {
            return res.status(400).json({ error: "Missing password" });
        }

        const existingUser = await dbClient.users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "Already exist" });
        }

        const hashedPassword = await hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
        };

        const result = await dbClient.users.insertOne(newUser);

        res.status(201).json({ id: result.insertedId, email });
    }

    static async getMe(request, response) {
        const { usr } = request;
        delete usr.password;
        usr.id = usr._id;
        delete usr._id;
        response.status(200).json(usr).end();
    }
}
