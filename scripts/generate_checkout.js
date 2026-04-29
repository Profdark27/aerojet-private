require('dotenv').config({ path: '.env.production.local' });
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

(async () => {
  const prisma = new PrismaClient();
  const inquiryId = fs.readFileSync('inquiry_id.txt', 'utf8').trim();
  console.log('Generating checkout for Inquiry ID:', inquiryId);
  
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId }
  });
  
  // Fake an optimized quote for testing checkout
  const totalAmount = 15000;
  const depositAmount = totalAmount * 0.3;
  
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: inquiry.email || undefined,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `✦ Deposito Volo Privato — ${inquiry.fromCity} → ${inquiry.toCity}`,
          },
          unit_amount: Math.round(depositAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'flight_deposit',
      inquiry_id: inquiry.id,
      from_city: inquiry.fromCity,
      to_city: inquiry.toCity,
      flight_date: inquiry.flightDate,
      total_price: String(totalAmount),
      deposit: String(depositAmount),
      customer_name: inquiry.name,
    },
    success_url: `https://aerojet-private.vercel.app/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://aerojet-private.vercel.app/search`,
  });
  
  console.log('Session URL:', stripeSession.url);
  fs.writeFileSync('checkout_url.txt', stripeSession.url);
  
  await prisma.$disconnect();
})();
