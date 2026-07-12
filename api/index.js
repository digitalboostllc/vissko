import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { saveOrder, getOrder } from './db.js';

dotenv.config();

// Ensure you have STRIPE_SECRET_KEY in your .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia',
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const app = express();
app.use(cors());
app.use(express.static('public'));

// IMPORTANT: Webhook must use express.raw before express.json()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } else {
      // For local testing without a webhook secret
      event = JSON.parse(request.body.toString());
    }
  } catch (err) {
    console.log(`⚠️  Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.id;
    const customerEmail = session.customer_details?.email;

    if (customerEmail) {
      const shortId = 'VSK-' + orderId.slice(-8).toUpperCase();

      // 1. Save to Database
      try {
        await saveOrder(shortId, customerEmail);
        console.log(`✅ Order ${shortId} saved to database for ${customerEmail}`);
      } catch (err) {
        console.error('Error saving order to DB:', err);
      }

      // 2. Send Order Confirmation Email via Resend
      try {
        await resend.emails.send({
          from: 'Vissko <orders@vissko.com>', // Requires verified domain in Resend
          to: customerEmail,
          subject: 'Confirmation de votre commande Vissko',
          html: `
            <div style="font-family: sans-serif; max-w-xl; margin: auto; padding: 20px;">
              <h2>Merci pour votre commande !</h2>
              <p>Votre paiement a bien été reçu. Nous préparons actuellement votre commande.</p>
              <p><strong>Numéro de commande :</strong> ${shortId}</p>
              <p>Vous pouvez suivre l'avancée de votre livraison (10-15 jours ouvrés) directement sur notre site.</p>
              <br/>
              <p>L'équipe Vissko</p>
            </div>
          `
        });
        console.log(`📧 Order confirmation email sent to ${customerEmail}`);
      } catch (err) {
        console.error('Error sending email via Resend:', err);
      }
    }
  }

  response.send();
});

// For all other routes, parse JSON bodies
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity, 10) || 1;
    // Dynamically get the domain so it works on Vercel without env variables
    const currentDomain = req.headers.origin || process.env.DOMAIN || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Vissko Ventilateur Portable 1800mAh',
              description: 'Ventilateur multifonction tour de cou, 5 vitesses, écran LED',
              images: [`${currentDomain}/assets/vissko-fan-hero.png`],
            },
            unit_amount: 8900, // 89.00€
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      return_url: `${currentDomain}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).send({ error: error.message });
  }
});

// Tracking API Endpoint
app.get('/api/tracking/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { email } = req.query;
  
  if (!orderId || !email) {
    return res.status(400).send({ error: 'Order ID and Email are required' });
  }

  try {
    const order = await getOrder(orderId, email);

    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order from Turso:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

app.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const shortId = 'VSK-' + session.id.slice(-8).toUpperCase();

    if (session.status === 'complete' && session.customer_details?.email) {
      // Bulletproof fallback: save order immediately if webhook hasn't fired yet
      try {
        await saveOrder(shortId, session.customer_details.email);
        console.log(`✅ Order ${shortId} proactively saved in session-status`);
      } catch (err) {
        console.error('Error saving order proactively:', err);
      }
    }

    res.send({
      status: session.status,
      customer_email: session.customer_details?.email,
      order_id: shortId
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).send({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4242;
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}

export default app;
