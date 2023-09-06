import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.connect((err) => {
      if (err) {
        console.log(err.message);
        this.client.close();
      } else {
        console.log('DBClient connected to MongoDB');
      }
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const usersCount = await this.client
        .db(this.database)
        .collection('users')
        .countDocuments();
      return usersCount;
    } catch (error) {
      console.error(`Error counting users: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const filesCount = await this.client
        .db(this.database)
        .collection('files')
        .countDocuments();
      return filesCount;
    } catch (error) {
      console.error(`Error counting files: ${error.message}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();

export default dbClient;
