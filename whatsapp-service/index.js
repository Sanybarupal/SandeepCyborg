require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000/api';

// Initialize WhatsApp Client with LocalAuth for persistent session
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
let currentQrUrl = null;

client.on('qr', async (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED. Scan the QR code below with WhatsApp:');
    qrcodeTerminal.generate(qr, { small: true });
    try {
        currentQrUrl = await qrcode.toDataURL(qr);
    } catch (err) {
        console.error('Failed to generate QR data URL', err);
    }
});

client.on('ready', () => {
    console.log('WhatsApp Client is READY!');
    isReady = true;
    currentQrUrl = null;
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

// Listen for incoming messages
client.on('message', async (msg) => {
    // Ignore status broadcasts and group messages (optional)
    if (msg.isStatus || msg.from.includes('@g.us')) return;

    console.log(`[MESSAGE RECEIVED] from ${msg.from}: ${msg.body}`);

    try {
        // Forward message to Python backend webhook
        await axios.post(`${PYTHON_BACKEND_URL}/whatsapp/webhook`, {
            from: msg.from,
            to: msg.to,
            body: msg.body,
            hasMedia: msg.hasMedia,
            timestamp: msg.timestamp
        });
    } catch (error) {
        console.error('Error forwarding message to backend:', error.message);
    }
});

client.initialize();

// API to send a message via WhatsApp (called by Python backend)
app.post('/send', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet' });
    }

    let { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ error: 'Missing "to" or "message" in request body' });
    }

    // Format phone number to WhatsApp format if necessary (e.g., append @c.us)
    if (!to.includes('@c.us')) {
        // basic cleanup: remove +, spaces, dashes
        to = to.replace(/[\+\s\-]/g, '');
        to = `${to}@c.us`;
    }

    try {
        // Check if number is registered on WhatsApp
        const isRegistered = await client.isRegisteredUser(to);
        if (!isRegistered) {
             return res.status(400).json({ error: 'Number is not registered on WhatsApp' });
        }

        const response = await client.sendMessage(to, message);
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

// API to get WhatsApp status
app.get('/status', (req, res) => {
    res.json({ ready: isReady, qr: currentQrUrl });
});

// API to get recent WhatsApp chats
app.get('/chats', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet' });
    }
    try {
        const chats = await client.getChats();
        // Filter out groups and broadcast lists
        const individualChats = chats.filter(chat => !chat.isGroup && chat.id.server === 'c.us');
        
        // Take top 20 recent active chats
        const recentChats = individualChats.slice(0, 20);
        const result = [];
        
        for (const chat of recentChats) {
            const messages = await chat.fetchMessages({ limit: 10 });
            result.push({
                id: chat.id._serialized,
                name: chat.name || chat.id.user,
                number: chat.id.user,
                messages: messages.map(m => ({
                    id: m.id._serialized,
                    body: m.body,
                    fromMe: m.fromMe,
                    timestamp: m.timestamp
                }))
            });
        }
        res.json({ chats: result });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Service running on port ${PORT}`);
});
