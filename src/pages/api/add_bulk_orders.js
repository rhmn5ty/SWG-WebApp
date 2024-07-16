import axios from 'axios';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { count, username, userPassword } = req.body;
    const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const products = ["Apple", "Banana", "Orange", "Grapes", "Mango", "Pineapple", "Strawberry", "Blueberry", "Watermelon", "Peach"];

    try {
      await client.connect();
      const database = client.db('swg');
      const customerCollection = database.collection('customer');
      const orderCollection = database.collection('order');

      const maxCustomerIdDoc = await customerCollection.findOne({}, { sort: { customer_id: -1 } });
      if (!maxCustomerIdDoc) {
        throw new Error('No customers found in the database.');
      }
      const maxCustomerId = maxCustomerIdDoc.customer_id;
      const minCustomerId = Math.max(1, maxCustomerId - 100); // Ensure minCustomerId is at least 1

      const orders = [];
      for (let i = 0; i < count; i++) {
        console.log(i + 1);
        const order = {
          order_id: await orderCollection.countDocuments() + 1 + i,
          product: products[Math.floor(Math.random() * products.length)],
          quantity: faker.number.int({ min: 1, max: 10 }),
          creditCard: faker.number.int({ min: 1111111111111111, max: 9999999999999999 }),
          customer_id: faker.number.int({ min: minCustomerId, max: maxCustomerId })
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
              username: username,
              password: userPassword
            },
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false
            })
          }
        );

        if (tokenizeCreditCardResponse.status === 200) {
          order.creditCard = tokenizeCreditCardResponse.data.token;
        } else {
          throw new Error(`Tokenization failed for credit card: ${tokenizeCreditCardResponse.status}`);
        }

        orders.push(order);
      }

      await orderCollection.insertMany(orders);
      res.status(200).json({ message: 'Bulk orders added successfully!' });
    } catch (error) {
      console.error('Error adding orders:', error);
      res.status(500).json({ message: 'Failed to add bulk orders', error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
