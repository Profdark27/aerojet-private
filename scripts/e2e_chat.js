const fs = require('fs');

(async () => {
  console.log('1. Avvio Chat Request...');
  const chatRes = await fetch('https://aerojet-private.vercel.app/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Voglio procedere con una richiesta formale.' }],
      context: {
        userName: 'Test Aerojet',
        userEmail: 'test@aerojet.private',
        from: 'Milano',
        to: 'Londra',
        budget: '15000'
      }
    })
  });
  const text = await chatRes.text();
  
  const match = text.match(/inquiryCreated":(.*?})/);
  if (!match) {
    console.error('Nessuna inquiry trovata nella risposta!');
    return;
  }
  const inquiry = JSON.parse(match[1]);
  console.log('Inquiry ID generato:', inquiry.id);
  
  fs.writeFileSync('inquiry_id.txt', inquiry.id);
})();
