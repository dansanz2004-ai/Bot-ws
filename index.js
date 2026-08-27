

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// 1. Servidor web para que Render sepa que la aplicación está viva
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡El Bot de WhatsApp está activo!');
});

app.listen(port, () => {
    console.log(`Servidor web activo en el puerto ${port}`);
});

// 2. Configuración de WhatsApp con Chromium para la nube
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

// 3. Generar el código QR en los registros (Logs)
client.on('qr', (qr) => {
    console.log('--- ESCANEA ESTE CÓDIGO QR ---');
    qrcode.generate(qr, { small: true });
});

// 4. Confirmación cuando conecta
client.on('ready', () => {
    console.log('¡El bot está activo y conectado en la nube!');
});

// 5. Detectar mensajes del grupo y reaccionar
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        // Si el mensaje es en un grupo, reacciona con el emoji
        if (chat.isGroup) {
            await msg.react('👍'); // Puedes cambiar este emoji por el que gustes
        }
    } catch (error) {
        console.error('Error al reaccionar:', error);
    }
});

// Inicializar el cliente
client.initialize();
