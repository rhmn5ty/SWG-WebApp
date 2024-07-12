import axios from 'axios';
import clientPromise from '../../utils/mongodb';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db("swg");
      const customerCollection = db.collection("customer");
      const orderCollection = db.collection("order");

      const { username, userPassword, email, product, quantity, creditCard } = req.body;

      // Find the customer by email
      const customer = await customerCollection.findOne({ email });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Find the highest order_id in the collection
      const highestOrder = await orderCollection.findOne({}, { sort: { order_id: -1 } });
      const nextOrderId = highestOrder ? highestOrder.order_id + 1 : 1;

      // Tokenize the creditCard field
      const tokenizeCreditCard = await axios.post(
        'https://192.168.10.232/vts/rest/v2.0/tokenize',
        {
          tokengroup: "TokenGroup",
          data: creditCard,
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

      if (tokenizeCreditCard.status === 200) {
        const order = {
          order_id: nextOrderId,
          customer_id: customer.customer_id,
          product,
          quantity,
          creditCard: tokenizeCreditCard.data.token,
        };

        await orderCollection.insertOne(order);

        res.status(200).json({ message: 'Order added successfully!' });
      } else {
        throw new Error(`Tokenization failed: ${tokenizeCreditCard.status}`);
      }
    } catch (e) {
      console.error('Error in API route:', e);
      res.status(500).json({ message: 'Failed to add order', error: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
