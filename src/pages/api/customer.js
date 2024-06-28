// src/pages/api/customers.js
import axios from 'axios';
import clientPromise from '../../utils/mongodb';

export default async (req, res) => {
  if (req.method === 'GET') {
    const { username, password, role } = req.query; // Extract username and password from query parameters

    try {
      const client = await clientPromise;
      const db = client.db("swg");
      const collection = db.collection("customer");

      const customers = await collection.find({}).toArray();

      if (role === 'database') {
        // Return raw data for users with the role 'database'
        return res.status(200).json(customers);
      }

      // Detokenize the KTP field for each customer
      
      const detokenizedCustomers = await Promise.all(customers.map(async (customer) => {
        try {
          if (role === 'hr'){
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
                  username: 'admin', // Use the username for authentication
                  password: password  // Use the password for authentication
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
            
          } else {
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
                  username: username, // Use the username for authentication
                  password: password  // Use the password for authentication
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

          if (role === 'finance'){
            const detokenizeCreditCard = await axios.post(
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
                  username: 'admin', // Use the username for authentication
                  password: password  // Use the password for authentication
                },
                httpsAgent: new (require('https').Agent)({
                  rejectUnauthorized: false // This allows self-signed certificates
                })
              }
            );
  
            if (detokenizeCreditCard.status === 200) {
              customer.creditCard = detokenizeCreditCard.data.data;
            } else {
              throw new Error(`Detokenization failed: ${detokenizeCreditCard.status}`);
            }

          } else {
            const detokenizeCreditCard = await axios.post(
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
                  username: username, // Use the username for authentication
                  password: password  // Use the password for authentication
                },
                httpsAgent: new (require('https').Agent)({
                  rejectUnauthorized: false // This allows self-signed certificates
                })
              }
            );
  
            if (detokenizeCreditCard.status === 200) {
              customer.creditCard = detokenizeCreditCard.data.data;
            } else {
              throw new Error(`Detokenization failed: ${detokenizeCreditCard.status}`);
            }
          }

        } catch (error) {
          console.error('Error detokenizing:', error);
          // Handle error (e.g., keep the token if detokenization fails)
        }
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
