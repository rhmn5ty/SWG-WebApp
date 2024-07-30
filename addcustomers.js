const axios = require('axios');
const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');

async function addCustomers() {
  const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('swg');
    const collection = database.collection('customerdummy');

    const customers = [];
    for (let i = 1; i <= 1000; i++) {
      console.log(i);
      const customer = {
        customer_id: i,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        nik: faker.number.int({ min: 1111111111111111, max: 9999999999999999 }), // Using credit card number for demo purposes
        // creditCard: faker.finance.creditCardNumber(),
      };

      customers.push(customer);
    }

    await collection.insertMany(customers);

    console.log('Customers added successfully.');
  } catch (error) {
    console.error('Error adding customers:', error);
  } finally {
    await client.close();
  }
}

addCustomers();
