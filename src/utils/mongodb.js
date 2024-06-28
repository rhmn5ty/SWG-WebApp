// src/utils/mongodb.js
import { MongoClient } from 'mongodb';

// Ensure the MongoDB URI is available as an environment variable
const uri = 'mongodb://localhost:27017/';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
