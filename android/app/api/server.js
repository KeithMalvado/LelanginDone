require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const app = express();
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId } = req.body;
    const productRef = firebaseAdmin.database().ref(`barang/${orderId}`);
    const snapshot = await productRef.once('value');
    const product = snapshot.val();

    console.log('Product Data:', product);

    if (!product || !product.hargaSaatIni || !product.hargaTertinggi) {
      return res.status(400).send('Product price not available or product not found');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.hargaTertinggi * 100,
      currency: 'idr',
      payment_method_types: ['card'],
      metadata: { orderId },
    });

    console.log('Payment Intent:', paymentIntent);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

const port = 8082;
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
