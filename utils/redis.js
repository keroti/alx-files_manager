import { createClient } from "redis";
import { promisify } from "util";

class RedisClient {
    constructor() {
        this.myClient = createClient();
        this.myClient.on("error", (error) => console.log(error));
    }

    isAlive() {
        return this.myClient.connected;
    }

    async get(key) {
        const getAsync = promisify(this.myClient.get).bind(this.myClient);
        return getAsync(key);
    }

    async set(key, val, time) {
        const setAsync = promisify(this.myClient.set).bind(this.myClient);
        return setAsync(key, val, "EX", time);
    }

    async del(key) {
        const delAsync = promisify(this.myClient.del).bind(this.myClient);
        return delAsync(key);
    }

    close() {
        this.myClient.quit();
    }
}

const redisClient = new RedisClient();

// Close the Redis client when your application exits
process.on("exit", () => {
    redisClient.close();
});

export default redisClient;
