import { MongoClient } from "mongodb";

class DBClient {
    constructor() {
        this.host = process.env.DB_HOST || "localhost";
        this.port = process.env.DB_PORT || 27017;
        this.database = process.env.DB_DATABASE || "files_manager";
        this.client = new MongoClient(
            `mongodb://${this.host}:${this.port}`
        );
        this.client
            .connect()
            .then(() => {
                console.log("DBClient connected to MongoDB");
            })
            .catch((err) => {
                console.error("Error connecting to MongoDB:", err);
            });
    }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        const usersCollection = this.client
            .db(this.database)
            .collection("users");
        const userCount = await usersCollection.countDocuments();
        return userCount;
    }

    async nbFiles() {
        const filesCollection = this.client
            .db(this.database)
            .collection("files");
        const fileCount = await filesCollection.countDocuments();
        return fileCount;
    }
}

const dbClient = new DBClient();

export default dbClient;
