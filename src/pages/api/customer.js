import axios from 'axios';
import clientPromise from '../../utils/mongodb';

export default async (req, res) => {
  if (req.method === 'GET') {
    const { username, password, page = 0, limit = 10 } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db("swg");
      const customerCollection = db.collection("customer");
      const orderCollection = db.collection("order");

      const totalCustomers = await customerCollection.countDocuments();
      const customers = await customerCollection.find({})
        .sort({ customer_id: -1 })  // Sort customers by customer_id in descending order
        .skip(page * limit)
        .limit(parseInt(limit))
        .toArray();

      const customerIds = customers.map(customer => customer.customer_id);
      const orders = await orderCollection.find({ customer_id: { $in: customerIds } }).toArray();

      const detokenizedCustomers = await Promise.all(customers.map(async (customer) => {
        try {
          if (username !== 'database') {
            // Detokenize NIK
            const detokenizeNIK = await axios.post(
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
                  username: username === 'hr' ? 'admin' : username,
                  password: password
                },
                httpsAgent: new (require('https').Agent)({
                  rejectUnauthorized: false // This allows self-signed certificates
                })
              }
            );

            if (detokenizeNIK.status === 200) {
              customer.nik = detokenizeNIK.data.data;
            } else {
              throw new Error(`Detokenization failed: ${detokenizeNIK.status}`);
            }
          }
        } catch (error) {
          console.error('Error detokenizing customer:', error);
        }

        return customer;
      }));

      const detokenizedOrders = await Promise.all(orders.map(async (order) => {
        try {
          if (username !== 'database') {
            const detokenizeCreditCard = await axios.post(
              'https://192.168.10.232/vts/rest/v2.0/detokenize',
              {
                tokengroup: "TokenGroup",
                token: order.creditCard,
                tokentemplate: "TokenTemplate"
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                auth: {
                  username: username === 'finance' ? 'admin' : username,
                  password: password
                },
                httpsAgent: new (require('https').Agent)({
                  rejectUnauthorized: false // This allows self-signed certificates
                })
              }
            );

            if (detokenizeCreditCard.status === 200) {
              order.creditCard = detokenizeCreditCard.data.data;
            } else {
              throw new Error(`Detokenization failed: ${detokenizeCreditCard.status}`);
            }
          }
        } catch (error) {
          console.error('Error detokenizing order:', error);
        }

        return order;
      }));

      const combinedData = detokenizedCustomers.map(customer => {
        customer.orders = detokenizedOrders.filter(order => order.customer_id === customer.customer_id);
        return customer;
      });

      res.status(200).json({ data: combinedData, total: totalCustomers });
    } catch (e) {
      console.error('Error fetching data:', e);
      res.status(500).json({ message: 'Failed to fetch data', error: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
