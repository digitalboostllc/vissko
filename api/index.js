import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { Resend } from 'resend';
import crypto from 'crypto';
import { saveOrder, getOrder, getAllOrders, getOrderCount, updateOrderStatusByEmail, updateOrderStatusById, updateOrderStatusByPiId, getSetting, setSetting, getAllSettings } from './db.js';
import { placeAliExpressOrder } from './aliexpress.js';

dotenv.config();

// Ensure you have STRIPE_SECRET_KEY in your .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia',
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Strict CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4242',
  process.env.DOMAIN || 'https://vissko.us'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.static('public'));

// 3. Admin Authentication Middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  let dbPassword;
  try {
    dbPassword = await getSetting('ADMIN_PASSWORD');
  } catch (err) {
    console.error("DB error fetching admin password", err);
  }
  
  const expectedToken = `Bearer ${dbPassword || ADMIN_PASSWORD || 'vissko_admin_2026'}`;
  
  if (!authHeader || authHeader !== expectedToken) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  next();
};

// 4. Rate Limiter for Admin Endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// IMPORTANT: Webhook must use express.raw before express.json()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    if (!endpointSecret) {
      throw new Error("CRITICAL SECURITY RISK: STRIPE_WEBHOOK_SECRET is missing. Rejecting payload to prevent spoofed order fulfillment.");
    }
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
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
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      const metadata = typeof session.payment_intent === 'object' && session.payment_intent?.metadata ? session.payment_intent.metadata : session.metadata || {};

      const utmSource = metadata.utm_source || null;
      const utmMedium = metadata.utm_medium || null;
      const utmCampaign = metadata.utm_campaign || null;
      const fbc = metadata.fbc || null;
      const fbp = metadata.fbp || null;
      const clientIp = metadata.client_ip_address || null;
      const clientUserAgent = metadata.client_user_agent || null;

      // 1. Save to Database
      try {
        const amount = session.amount_total ? session.amount_total / 100 : 89.00;
        await saveOrder(shortId, customerEmail, customerName, phone, shippingAddress, paymentIntentId, utmSource, utmMedium, utmCampaign, fbc, fbp, amount);
        console.log(`✅ Order ${shortId} saved to database for ${customerEmail}`);
      } catch (err) {
        console.error('Error saving order to DB:', err);
      }

      if (session.payment_status === 'paid') {
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
        const pixelId = await getSetting('FB_PIXEL_ID');
        const accessToken = await getSetting('FB_ACCESS_TOKEN');
        
        if (pixelId && accessToken && customerEmail) {
          const hashEmail = crypto.createHash('sha256').update(customerEmail.toLowerCase().trim()).digest('hex');
          const userData = { em: [hashEmail] };
          
          if (phone) {
             const hashPhone = crypto.createHash('sha256').update(phone.replace(/\D/g,'')).digest('hex');
             userData.ph = [hashPhone];
          }
          if (fbc) userData.fbc = fbc;
          if (fbp) userData.fbp = fbp;
          if (clientIp) userData.client_ip_address = clientIp;
          if (clientUserAgent) userData.client_user_agent = clientUserAgent;
          if (shippingAddress && shippingAddress.postal_code) {
             userData.zp = [crypto.createHash('sha256').update(shippingAddress.postal_code.trim().toLowerCase()).digest('hex')];
          }

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
                  event_id: session.id,
                  action_source: 'website',
                  user_data: userData,
                  custom_data: {
                    currency: 'EUR',
                    value: session.amount_total ? session.amount_total / 100 : 89.00
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

      // 4. Auto-Fulfill to AliExpress
      try {
        if (shippingAddress) {
          // Fetch line items to get exact quantity
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const quantity = lineItems?.data?.[0]?.quantity || 1;
          
          // Call AliExpress API synchronously to handle failure properly
          const aeResult = await placeAliExpressOrder(shortId, shippingAddress, customerName, phone, quantity);
          if (!aeResult.success) {
             await updateOrderStatusById(shortId, 'action_required');
             console.error(`🚨 AliExpress fulfillment failed for ${shortId}. Marked as action_required.`);
          }
        }
      } catch (err) {
        console.error('Error initiating AliExpress fulfillment:', err);
        await updateOrderStatusById(shortId, 'action_required');
      }
    } else {
      console.log(`⚠️ Order ${shortId} saved but payment_status is '${session.payment_status}'. Skipping fulfillment.`);
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
  } else if (event.type === 'charge.dispute.created') {
    // Dispute / Chargeback handling
    const dispute = event.data.object;
    const paymentIntentId = dispute.charge ? (typeof dispute.charge === 'string' ? null : dispute.charge.payment_intent) : dispute.payment_intent;
    const piIdToUse = paymentIntentId || dispute.payment_intent; // dispute object has payment_intent in newer versions, or inside charge
    
    if (piIdToUse) {
      try {
        await updateOrderStatusByPiId(piIdToUse, 'disputed');
        console.log(`🚨 Dispute registered for PaymentIntent ${piIdToUse}`);
      } catch (err) {
        console.error('Error updating dispute status:', err);
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
    const discount = req.body.discount;
    const tracking = req.body.tracking || {};
    const currentDomain = req.headers.origin || process.env.DOMAIN || 'http://localhost:5173';

    // Capture IP from request for CAPI
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const metadata = {
      utm_source: tracking.utm_source || '',
      utm_medium: tracking.utm_medium || '',
      utm_campaign: tracking.utm_campaign || '',
      fbc: tracking.fbc || '',
      fbp: tracking.fbp || '',
      client_ip_address: clientIp || '',
      client_user_agent: userAgent || ''
    };

    const sessionParams = {
      ui_mode: 'embedded',
      customer_creation: 'always', // Required for 1-click upsells
      payment_intent_data: {
        setup_future_usage: 'on_session',
        metadata: metadata
      },
      metadata: metadata,
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

    if (paymentIntent.status === 'succeeded') {
      const shortId = 'VSK-UP-' + paymentIntent.id.slice(-6).toUpperCase();
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || session.shipping_details?.name || null;
      const phone = session.customer_details?.phone || null;
      const shippingAddress = session.shipping_details?.address || null;
      
      const metadata = typeof session.payment_intent === 'object' && session.payment_intent?.metadata ? session.payment_intent.metadata : session.metadata || {};
      const utmSource = metadata.utm_source || null;
      const utmMedium = metadata.utm_medium || null;
      const utmCampaign = metadata.utm_campaign || null;
      const fbc = metadata.fbc || null;
      const fbp = metadata.fbp || null;

      // 1. Save to DB
      try {
        await saveOrder(shortId, customerEmail, customerName, phone, shippingAddress, paymentIntent.id, utmSource, utmMedium, utmCampaign, fbc, fbp, 53.40);
        console.log(`✅ Upsell Order ${shortId} saved to database`);
      } catch (err) {
        console.error('Error saving upsell to DB:', err);
      }

      // 2. Send Upsell Confirmation Email
      if (customerEmail) {
        try {
          await resend.emails.send({
            from: 'Vissko <orders@vissko.us>',
            to: customerEmail,
            subject: 'Confirmation de votre ventilateur supplémentaire Vissko',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w-xl; margin: auto; padding: 40px 20px; background-color: #ffffff; color: #18181b;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://vissko.us/assets/logo.png" alt="Vissko Logo" style="height: 32px; width: auto; margin: 0 auto;" />
                </div>
                <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 24px; padding: 40px 30px; text-align: center;">
                  <h2 style="margin-top: 0; font-size: 24px; font-weight: 800; color: #18181b;">Ventilateur ajouté !</h2>
                  <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Merci ! Votre ventilateur supplémentaire à -40% a bien été ajouté. Il sera expédié à la même adresse que votre commande initiale.
                  </p>
                  <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 20px; margin-bottom: 30px; display: inline-block; text-align: center; min-width: 200px;">
                    <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: 600;">Numéro de commande Upsell</p>
                    <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #10b981;">${shortId}</p>
                  </div>
                </div>
              </div>
            `
          });
        } catch(err) {
          console.error('Error sending upsell email:', err);
        }
      }

      // 3. Send Facebook CAPI Purchase Event for Upsell
      try {
        const pixelId = await getSetting('FB_PIXEL_ID');
        const accessToken = await getSetting('FB_ACCESS_TOKEN');
        const clientIp = metadata.client_ip_address || null;
        const clientUserAgent = metadata.client_user_agent || null;
        
        if (pixelId && accessToken && customerEmail) {
          const hashEmail = crypto.createHash('sha256').update(customerEmail.toLowerCase().trim()).digest('hex');
          const userData = { em: [hashEmail] };
          if (phone) {
             const hashPhone = crypto.createHash('sha256').update(phone.replace(/\D/g,'')).digest('hex');
             userData.ph = [hashPhone];
          }
          if (fbc) userData.fbc = fbc;
          if (fbp) userData.fbp = fbp;
          if (clientIp) userData.client_ip_address = clientIp;
          if (clientUserAgent) userData.client_user_agent = clientUserAgent;

          await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [
                {
                  event_name: 'Purchase',
                  event_time: Math.floor(Date.now() / 1000),
                  event_id: original_session_id + '_upsell',
                  action_source: 'website',
                  user_data: userData,
                  custom_data: { currency: 'EUR', value: 53.40 }
                }
              ],
              access_token: accessToken
            })
          });
          console.log(`🎯 Server-side Upsell Purchase event sent for ${shortId}`);
        }
      } catch (err) {
        console.error('Error sending Upsell CAPI event:', err);
      }

      // 4. Trigger AliExpress
      if (shippingAddress) {
        const aeResult = await placeAliExpressOrder(shortId, shippingAddress, customerName, phone, 1);
        if (!aeResult.success) {
           await updateOrderStatusById(shortId, 'action_required');
           console.error(`🚨 AliExpress fulfillment failed for upsell ${shortId}. Marked as action_required.`);
        }
      }
    }

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

// Public Settings Endpoint
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getAllSettings();
    // Only return non-sensitive settings to public frontend
    res.send({
      FB_PIXEL_ID: settings.FB_PIXEL_ID || null,
      GTM_ID: settings.GTM_ID || null,
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).send({ error: 'Database error' });
  }
});

// Admin Settings Endpoint
app.get('/api/admin/settings', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.send(settings);
  } catch (err) {
    res.status(500).send({ error: 'Database error' });
  }
});

app.post('/api/admin/settings', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const updates = req.body; // e.g. { FB_PIXEL_ID: '...', FB_ACCESS_TOKEN: '...' }
    for (const [key, value] of Object.entries(updates)) {
      await setSetting(key, value);
    }
    res.send({ success: true });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).send({ error: 'Database error' });
  }
});

// Admin API Endpoint (Protected)
app.get('/api/admin/orders', adminLimiter, requireAdmin, async (req, res) => {

  try {
    const orders = await getAllOrders();
    res.send(orders);
  } catch (error) {
    console.error('Error fetching all orders from Turso:', error);
    res.status(500).send({ error: 'Database error' });
  }
});

// Admin Analytics Endpoint
app.get('/api/admin/analytics', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const orders = await getAllOrders();
    const adAccountId = await getSetting('FB_AD_ACCOUNT_ID');
    const accessToken = await getSetting('FB_ACCESS_TOKEN');

    let fbInsights = [];
    if (adAccountId && accessToken) {
      // Fetch Facebook Ads Insights
      const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/insights?level=campaign&fields=campaign_name,spend,actions,outbound_clicks,cpm,cpp,cpc&date_preset=maximum&access_token=${accessToken}`);
      
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        let rawInsights = fbData.data || [];

        // Fetch Live Exchange Rates (EUR base)
        try {
          const fxResponse = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
          const fxData = await fxResponse.json();
          const idrRate = fxData.rates?.IDR || 17600; // Fallback to ~17600 if API fails

          // Convert IDR to EUR
          fbInsights = rawInsights.map(campaign => ({
            ...campaign,
            spend: (parseFloat(campaign.spend || '0') / idrRate).toFixed(2),
            cpc: (parseFloat(campaign.cpc || '0') / idrRate).toFixed(2),
            cpm: (parseFloat(campaign.cpm || '0') / idrRate).toFixed(2)
          }));
        } catch (fxErr) {
          console.error('Failed to fetch exchange rates', fxErr);
          // Fallback static conversion if network fails
          fbInsights = rawInsights.map(campaign => ({
            ...campaign,
            spend: (parseFloat(campaign.spend || '0') / 17600).toFixed(2),
            cpc: (parseFloat(campaign.cpc || '0') / 17600).toFixed(2),
            cpm: (parseFloat(campaign.cpm || '0') / 17600).toFixed(2)
          }));
        }

      } else {
        console.error('FB API Error:', await fbResponse.text());
      }
    }

    res.send({ orders, fbInsights });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).send({ error: 'Failed to fetch analytics' });
  }
});

// Admin Shipping Endpoint
app.put('/api/admin/orders/:id', adminLimiter, requireAdmin, async (req, res) => {

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

// Admin Refund Endpoint
app.post('/api/admin/orders/:id/refund', adminLimiter, requireAdmin, async (req, res) => {

  const { id } = req.params;
  const { stripe_pi_id } = req.body;

  if (!stripe_pi_id) {
    return res.status(400).send({ error: 'Missing Stripe PaymentIntent ID' });
  }

  try {
    // Call Stripe API to refund
    const refund = await stripe.refunds.create({
      payment_intent: stripe_pi_id,
    });

    if (refund.status === 'succeeded' || refund.status === 'pending') {
      await updateOrderStatusById(id, 'refunded');
      res.send({ success: true, refund });
    } else {
      res.status(400).send({ error: 'Refund failed to process' });
    }
  } catch (error) {
    console.error('Stripe refund error:', error);
    res.status(500).send({ error: error.message || 'Refund error' });
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
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      
      const metadata = typeof session.payment_intent === 'object' && session.payment_intent?.metadata ? session.payment_intent.metadata : session.metadata || {};
      const utmSource = metadata.utm_source || null;
      const utmMedium = metadata.utm_medium || null;
      const utmCampaign = metadata.utm_campaign || null;
      const fbc = metadata.fbc || null;
      const fbp = metadata.fbp || null;

      // Bulletproof fallback: save order immediately if webhook hasn't fired yet
      try {
        const amount = session.amount_total ? session.amount_total / 100 : 89.00;
        await saveOrder(shortId, session.customer_details.email, customerName, phone, shippingAddress, paymentIntentId, utmSource, utmMedium, utmCampaign, fbc, fbp, amount);
        console.log(`✅ Order ${shortId} proactively saved in session-status`);
      } catch (err) {
        console.error('Error saving order proactively:', err);
      }
    }

    res.send({
      status: session.status,
      customer_email: session.customer_details?.email,
      order_id: shortId,
      amount_total: session.amount_total ? session.amount_total / 100 : 89.00
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
