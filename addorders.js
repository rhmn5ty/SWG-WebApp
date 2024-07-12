const axios = require('axios');
const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');

async function addOrders() {
  const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const products = ["Apple", "Banana", "Orange", "Grapes", "Mango", "Pineapple", "Strawberry", "Blueberry", "Watermelon", "Peach"];

  try {
    await client.connect();
    const database = client.db('swg');
    const collection = database.collection('order');

    const orders = [];
    for (let i = 1; i <= 20; i++) {
      console.log(i);
      const order = {
        order_id: i,
        product: products[Math.floor(Math.random() * products.length)],
        quantity: faker.number.int({ min: 1, max: 10 }),
        creditCard: faker.number.int({ min: 1111111111111111, max: 9999999999999999 }),
        customer_id: faker.number.int({ min: 1, max: 10 })
      };

      // Tokenize the creditCard
      const tokenizeCreditCardResponse = await axios.post(
        'https://192.168.10.232/vts/rest/v2.0/tokenize',
        {
          tokengroup: "TokenGroup",
          data: order.creditCard,
          tokentemplate: "TokenTemplate"
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          auth: {
            username: 'database', // Replace with actual username
            password: 'Gu@rd1um' // Replace with actual password
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false
          })
        }
      );

      if (tokenizeCreditCardResponse.status === 200) {
        order.creditCard = tokenizeCreditCardResponse.data.token;
      } else {
        throw new Error(`Tokenization failed for NIK: ${tokenizeCreditCardResponse.status}`);
      }

      orders.push(order);
    }

    await collection.insertMany(orders);

    console.log('Orders added successfully.');
  } catch (error) {
    console.error('Error adding orders:', error);
  } finally {
    await client.close();
  }
}

addOrders();
