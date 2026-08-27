const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

let latestQR = '';
let isConnected = false;

// Muestra el QR como una imagen nítida en la página web
app.get('/', (req, res) => {
    if (isConnected) {
        res.send('<h1 style="text-align:center;font-family:sans-serif;margin-top:50px;color:green;">¡El bot de WhatsApp está conectado y activo!</h1>');
    } else if (latestQR) {
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(latestQR)}&size=300x300`;
        res.send(`
            <html style="font-family:sans-serif;text-align:center;">
                <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;">
                    <h2>Escanea este código QR con WhatsApp:</h2>
                    <img src="${qrImageUrl}" alt="Código QR" style="border: 2px solid #000; padding: 10px; border-radius: 10px; margin: 20px 0;" />
                    <p style="color:#666;">Si vence, recarga esta página para ver uno nuevo.</p>
                </body>
            </html>
        `);
    } else {
        res.send('<h2 style="text-align:center;font-family:sans-serif;margin-top:50px;">Generando código QR... Recarga esta página en 10 segundos.</h2>');
    }
});

app.listen(port, () => {
    console.log(`Servidor web activo en el puerto ${port}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- NUEVO CÓDIGO QR GENERADO ---');
    latestQR = qr;
    isConnected = false;
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡El bot está activo y conectado!');
    isConnected = true;
    latestQR = '';
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            await msg.react('🇮🇱');
        }
    } catch (error) {
        console.error('Error al reaccionar:', error);
    }
});

client.initialize();
