import axios from 'axios';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { count, username, userPassword } = req.body;
    const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const database = client.db('swg');
      const collection = database.collection('customer');

      const customers = [];
      for (let i = 0; i < count; i++) {
        console.log(i + 1);
        const customer = {
          customer_id: await collection.countDocuments() + 1 + i,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          nik: faker.number.int({ min: 1111111111111111, max: 9999999999999999 }),
        };

        const tokenizeNIKResponse = await axios.post(
          'https://192.168.10.232/vts/rest/v2.0/tokenize',
          {
            tokengroup: "TokenGroup",
            data: customer.nik,
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

        if (tokenizeNIKResponse.status === 200) {
          customer.nik = tokenizeNIKResponse.data.token;
        } else {
          throw new Error(`Tokenization failed for NIK: ${tokenizeNIKResponse.status}`);
        }

        customers.push(customer);
      }

      await collection.insertMany(customers);
      res.status(200).json({ message: 'Bulk customers added successfully!' });
    } catch (error) {
      console.error('Error adding customers:', error);
      res.status(500).json({ message: 'Failed to add bulk customers', error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
