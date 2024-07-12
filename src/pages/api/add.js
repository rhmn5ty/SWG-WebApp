import axios from 'axios';
import clientPromise from '../../utils/mongodb';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db("swg");
      const collection = db.collection("customer");

      const { username, userPassword, ...customer } = req.body;

      // Find the highest customer_id in the collection
      const highestCustomer = await collection.findOne({}, { sort: { customer_id: -1 } });
      const nextCustomerId = highestCustomer ? highestCustomer.customer_id + 1 : 1;

      // Add the customer_id to the new customer
      customer.customer_id = nextCustomerId;

      // Tokenize the NIK field
      const tokenizeNIK = await axios.post(
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
            username: username, // Use the username for authentication
            password: userPassword // Use the userPassword for authentication
          },
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false // This allows self-signed certificates
          })
        }
      );

      if (tokenizeNIK.status === 200) {
        customer.nik = tokenizeNIK.data.token;
      } else {
        throw new Error(`Tokenization failed: ${tokenizeNIK.status}`);
      }

      await collection.insertOne(customer);

      res.status(200).json({ message: 'Customer added successfully!' });
    } catch (e) {
      console.error('Error in API route:', e);
      res.status(500).json({ message: 'Failed to add customer', error: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
