const fs = require('fs');
const { Client } = require('whatsapp-web.js');


const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: false,
    //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED', 'ok');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    // if (msg.body === 'Oi') {
    //     // Send a new message as a reply to the current one
    //     msg.reply('resposta Oi');

    // } else if (msg.body.includes('Ae')) {
    //     // Send a new message to the same chat
    //     client.sendMessage(msg.from, 'resposta Ae');

    // }
	//  else if (msg.body.startsWith('Fala')) {
    //     // Send a new message to the same chat
    //     client.sendMessage(msg.from, 'resposta Fala');

    // }
    if (msg.body !== 'Oie') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'resposta Oie');

    }
});
