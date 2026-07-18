import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { Resend } from 'resend';
import crypto from 'crypto';
import { saveOrder, getOrder, getAllOrders, getOrderCount, updateOrderStatusByEmail, updateOrderStatusById } from './db.js';

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
    const customerName = session.customer_details?.name || session.shipping_details?.name || null;
    const phone = session.customer_details?.phone || null;
    const shippingAddress = session.shipping_details?.address || null;

    if (customerEmail) {
      const shortId = 'VSK-' + orderId.slice(-8).toUpperCase();

      // 1. Save to Database
      try {
        await saveOrder(shortId, customerEmail, customerName, phone, shippingAddress);
        console.log(`✅ Order ${shortId} saved to database for ${customerEmail}`);
      } catch (err) {
        console.error('Error saving order to DB:', err);
      }

      // 2. Send Order Confirmation Email via Resend
      try {
        await resend.emails.send({
          from: 'Vissko <orders@vissko.us>', // Requires verified domain in Resend
          to: customerEmail,
          subject: 'Confirmation de votre commande Vissko',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w-xl; margin: auto; padding: 40px 20px; background-color: #ffffff; color: #18181b;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://vissko.us/assets/logo.png" alt="Vissko Logo" style="height: 32px; width: auto; margin: 0 auto;" />
              </div>
              <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 24px; padding: 40px 30px; text-align: center;">
                <h2 style="margin-top: 0; font-size: 24px; font-weight: 800; color: #18181b;">Commande Confirmée</h2>
                <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Merci pour votre confiance. Votre paiement a bien été reçu et nous préparons actuellement votre ventilateur Vissko pour l'expédition.
                </p>
                <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 20px; margin-bottom: 30px; display: inline-block; text-align: center; min-width: 200px;">
                  <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: 600;">Numéro de commande</p>
                  <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #10b981;">${shortId}</p>
                </div>
                <div style="margin-bottom: 30px;">
                  <img src="https://vissko.us/assets/vissko-fan-hero.png" alt="Vissko Fan" style="max-width: 250px; height: auto; margin: 0 auto; display: block;" />
                </div>
                <a href="https://vissko.us/" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; padding: 16px 32px; border-radius: 9999px; font-size: 16px;">
                  Suivre ma commande sur le site
                </a>
              </div>
              <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 40px;">
                Vissko LLC<br/>2443 Sierra Nevada Road, Mammoth Lakes, CA 93546
              </p>
            </div>
          `
        });
        console.log(`📧 Order confirmation email sent to ${customerEmail}`);
      } catch (err) {
        console.error('Error sending email via Resend:', err);
      }

      // 3. Send Facebook CAPI Purchase Event
      try {
        const pixelId = process.env.FB_PIXEL_ID;
        const accessToken = process.env.FB_ACCESS_TOKEN;
        
        if (pixelId && accessToken && customerEmail) {
          const hashEmail = crypto.createHash('sha256').update(customerEmail.toLowerCase().trim()).digest('hex');

          await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: [
                {
                  event_name: 'Purchase',
                  event_time: Math.floor(Date.now() / 1000),
                  action_source: 'website',
                  user_data: {
                    em: [hashEmail]
                  },
                  custom_data: {
                    currency: 'EUR',
                    value: 89.00
                  }
                }
              ],
              access_token: accessToken
            })
          });
          console.log(`🎯 Server-side Purchase event sent for ${shortId}`);
        }
      } catch (err) {
        console.error('Error sending CAPI event:', err);
      }
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const email = charge.billing_details?.email || charge.receipt_email;
    if (email) {
      try {
        await updateOrderStatusByEmail(email, 'refunded');
        console.log(`✅ Order for ${email} marked as refunded`);
      } catch (err) {
        console.error('Error updating refund status:', err);
      }
    }
  } else if (event.type === 'checkout.session.expired') {
    // Abandoned Cart Recovery
    const session = event.data.object;
    const email = session.customer_details?.email;
    if (email) {
      try {
        await resend.emails.send({
          from: 'Vissko <orders@vissko.us>',
          to: email,
          subject: 'Vous avez oublié votre Vissko !',
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 40px;">
              <h2>Vous avez oublié quelque chose...</h2>
              <p>Votre ventilateur Vissko vous attend toujours ! Finalisez votre commande avant que les stocks ne soient épuisés.</p>
              <a href="https://vissko.us/" style="display: inline-block; background: #18181b; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 999px; margin-top: 20px;">Reprendre ma commande</a>
            </div>
          `
        });
        console.log(`🛒 Abandoned cart email sent to ${email}`);
      } catch (err) {
        console.error('Error sending abandoned cart email:', err);
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
    // Extract discount coupon from body
    const discount = req.body.discount;
    const currentDomain = req.headers.origin || process.env.DOMAIN || 'http://localhost:5173';

    const sessionParams = {
      ui_mode: 'embedded',
      customer_creation: 'always', // Required for 1-click upsells
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expire in 30 mins for Abandoned Cart recovery
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
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC', 'CA', 'US'],
      },
      phone_number_collection: {
        enabled: true,
      },
      return_url: `${currentDomain}/return?session_id={CHECKOUT_SESSION_ID}`,
    };

    if (discount === 'SAVE10') {
      sessionParams.discounts = [{ coupon: 'SAVE10' }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/one-click-upsell', async (req, res) => {
  try {
    const { original_session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(original_session_id, {
      expand: ['payment_intent', 'payment_intent.payment_method']
    });
    
    if (!session.customer || !session.payment_intent?.payment_method) {
      return res.status(400).send({ error: 'No saved payment method found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5340,
      currency: 'eur',
      customer: session.customer,
      payment_method: session.payment_intent.payment_method.id,
      off_session: true,
      confirm: true,
      description: 'Vissko Ventilateur Portable (Upsell -40%)'
    });

    res.send({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error creating 1-click upsell:', error);
    res.status(500).send({ error: error.message });
  }
});

app.get('/api/stock', async (req, res) => {
  try {
    const count = await getOrderCount();
    // Start at 24. For every order, reduce by 1. Minimum limit 3.
    const remaining = Math.max(3, 24 - count);
    res.send({ stock: remaining });
  } catch (err) {
    res.send({ stock: 14 }); // Fallback
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

// Admin API Endpoint (Protected by hardcoded token)
app.get('/api/admin/orders', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer vissko_admin_2026') {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const orders = await getAllOrders();
    res.send(orders);
  } catch (error) {
    console.error('Error fetching all orders from Turso:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

// Admin Shipping Endpoint
app.put('/api/admin/orders/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer vissko_admin_2026') {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status, tracking_url, email } = req.body;

  try {
    await updateOrderStatusById(id, status);
    
    if (status === 'shipped' && email) {
      await resend.emails.send({
        from: 'Vissko <orders@vissko.us>',
        to: email,
        subject: 'Votre commande Vissko est expédiée !',
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h2>Bonne nouvelle !</h2>
            <p>Votre commande <strong>${id}</strong> est en route.</p>
            ${tracking_url ? `<p>Vous pouvez suivre votre colis ici : <a href="${tracking_url}">${tracking_url}</a></p>` : ''}
            <p>Merci pour votre achat !</p>
          </div>
        `
      });
    }

    res.send({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

app.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const shortId = 'VSK-' + session.id.slice(-8).toUpperCase();

    if (session.status === 'complete' && session.customer_details?.email) {
      const customerName = session.customer_details?.name || session.shipping_details?.name || null;
      const phone = session.customer_details?.phone || null;
      const shippingAddress = session.shipping_details?.address || null;
      // Bulletproof fallback: save order immediately if webhook hasn't fired yet
      try {
        await saveOrder(shortId, session.customer_details.email, customerName, phone, shippingAddress);
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
