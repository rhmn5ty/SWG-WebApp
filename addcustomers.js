const axios = require('axios');
const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');

async function addCustomers() {
  const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('swg');
    const collection = database.collection('customer');

    const customers = [];
    for (let i = 1; i <= 1000; i++) {
      console.log(i);
      const customer = {
        customer_id: i,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        nik: faker.finance.creditCardNumber(), // Using credit card number for demo purposes
        // creditCard: faker.finance.creditCardNumber(),
      };

      // Tokenize the NIK
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
            username: 'database', // Replace with actual username
            password: 'Gu@rd1um' // Replace with actual password
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

      // Tokenize the Credit Card
      // const tokenizeCreditCardResponse = await axios.post(
      //   'https://192.168.10.232/vts/rest/v2.0/tokenize',
      //   {
      //     tokengroup: "TokenGroup",
      //     data: customer.creditCard,
      //     tokentemplate: "TokenTemplate"
      //   },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     auth: {
      //       username: 'database', // Replace with actual username
      //       password: 'Gu@rd1um' // Replace with actual password
      //     },
      //     httpsAgent: new (require('https').Agent)({
      //       rejectUnauthorized: false
      //     })
      //   }
      // );

      // if (tokenizeCreditCardResponse.status === 200) {
      //   customer.creditCard = tokenizeCreditCardResponse.data.token;
      // } else {
      //   throw new Error(`Tokenization failed for Credit Card: ${tokenizeCreditCardResponse.status}`);
      // }

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
