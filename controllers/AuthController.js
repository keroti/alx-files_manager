// controllers/AuthController.js
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import redisClient from "../utils/redis";
import dbClient from "../utils/db";

class AuthController {
    static async getConnect(req, res) {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith("Basic ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const base64Credentials = authorization.split(" ")[1];
        const credentials = Buffer.from(
            base64Credentials,
            "base64"
        ).toString("utf-8");
        const [email, password] = credentials.split(":");

        if (!email || !password) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const hashedPassword = createHash("sha1")
            .update(password)
            .digest("hex");
        const user = await dbClient.users.findOne({
            email,
            password: hashedPassword,
        });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = uuidv4();
        const key = `auth_${token}`;

        await redisClient.set(key, user._id.toString(), 86400);

        return res.status(200).json({ token });
    }

    static async getDisconnect(req, res) {
        const { "x-token": token } = req.headers;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const key = `auth_${token}`;
        const userId = await redisClient.get(key);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await redisClient.del(key);

        return res.status(204).send();
    }
}

export default AuthController;
