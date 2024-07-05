import axios from 'axios';
import clientPromise from '../../utils/mongodb';

export default async (req, res) => {
  if (req.method === 'GET') {
    const { username, password, role } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db("swg");
      const customerCollection = db.collection("customer");
      const orderCollection = db.collection("order");

      const customers = await customerCollection.find({}).toArray();

      // Fetch orders for each customer
      const customerIds = customers.map(customer => customer.customer_id);
      const orders = await orderCollection.find({ customer_id: { $in: customerIds } }).toArray();

      const detokenizedCustomers = await Promise.all(customers.map(async (customer) => {
        if (role !== 'database') {
          try {
            let detokenizeNIKResponse;
            let detokenizeCreditCardResponse;

            if (role === 'hr' || role === 'finance') {
              detokenizeNIKResponse = await axios.post(
                'https://192.168.10.232/vts/rest/v2.0/detokenize',
                {
                  tokengroup: "TokenGroup",
                  token: customer.nik,
                  tokentemplate: "TokenTemplate"
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  auth: {
                    username: 'admin',
                    password: password
                  },
                  httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                  })
                }
              );

              if (detokenizeNIKResponse.status === 200) {
                customer.nik = detokenizeNIKResponse.data.data;
              } else {
                throw new Error(`Detokenization failed: ${detokenizeNIKResponse.status}`);
              }
            }

            if (role === 'finance') {
              detokenizeCreditCardResponse = await axios.post(
                'https://192.168.10.232/vts/rest/v2.0/detokenize',
                {
                  tokengroup: "TokenGroup",
                  token: customer.creditCard,
                  tokentemplate: "TokenTemplate"
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  auth: {
                    username: 'admin',
                    password: password
                  },
                  httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                  })
                }
              );

              if (detokenizeCreditCardResponse.status === 200) {
                customer.creditCard = detokenizeCreditCardResponse.data.data;
              } else {
                throw new Error(`Detokenization failed: ${detokenizeCreditCardResponse.status}`);
              }
            }
          } catch (error) {
            console.error('Error detokenizing:', error);
          }
        }

        // Add orders to customer data
        customer.orders = orders.filter(order => order.customer_id === customer.customer_id);

        return customer;
      }));

      res.status(200).json(detokenizedCustomers);
    } catch (e) {
      console.error('Error fetching customers:', e);
      res.status(500).json({ message: 'Failed to fetch customers', error: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
