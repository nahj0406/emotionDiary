import { MongoClient } from "mongodb";

const url = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@cluster0.kwo3lqq.mongodb.net/?appName=Cluster0`;

let connectDB : Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongo) {
    global._mongo = new MongoClient(url).connect()
  }
  connectDB = global._mongo
} else {
  connectDB = new MongoClient(url).connect()
}

export default connectDB