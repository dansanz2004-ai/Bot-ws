const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

let latestQR = '';
let isConnected = false;

app.get('/', (req, res) => {
    if (isConnected) {
        res.send('<h1 style="text-align:center;font-family:sans-serif;margin-top:50px;color:green;">¡El bot está activo y listo!</h1>');
    } else if (latestQR) {
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(latestQR)}&size=300x300`;
        res.send(`
            <html style="font-family:sans-serif;text-align:center;">
                <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;">
                    <h2>Escanea este nuevo código QR:</h2>
                    <img src="${qrImageUrl}" alt="Código QR" style="border: 2px solid #000; padding: 10px; border-radius: 10px; margin: 20px 0;" />
                </body>
            </html>
        `);
    } else {
        res.send('<h2 style="text-align:center;font-family:sans-serif;margin-top:50px;">Cargando QR... Recarga en 10 segundos.</h2>');
    }
});

app.listen(port, () => console.log(`Servidor en puerto ${port}`));

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
    latestQR = qr;
    isConnected = false;
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡Bot conectado exitosamente!');
    isConnected = true;
    latestQR = '';
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            console.log(`Mensaje detectado en el grupo: "${chat.name}"`);
            
            // Busca la palabra "familia" ignorando mayúsculas, minúsculas y emojis
            if (chat.name.toLowerCase().includes('familia')) {
                console.log('¡Coincidencia hallada! Reaccionando...');
                await msg.react('🇮🇱');
            }
        }
    } catch (error) {
        console.error('Error al intentar reaccionar:', error);
    }
});

client.initialize();


