const express = require('express');
const mysql = require('mysql2/promise');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode'); // Usaremos qrcode para gerar imagem
const dbConfig = require('../config/db');

const router = express.Router();

const whatsappClient = new Client({
    authStrategy: new LocalAuth({ dataPath: '/opt/render/.whatsapp-session' }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

let qrCodeData = null; // Armazena o QR code atual
let isConnected = false; // Estado da conexão

whatsappClient.on('qr', (qr) => {
    console.log('Novo QR code gerado');
    qrCodeData = qr; // Armazena o QR code
    isConnected = false;
});

whatsappClient.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
    qrCodeData = null; // Limpa o QR code quando conectado
    isConnected = true;
});

whatsappClient.on('authenticated', () => {
    console.log('Autenticado com sucesso');
});

whatsappClient.on('disconnected', (reason) => {
    console.log('Desconectado:', reason);
    isConnected = false;
});

whatsappClient.initialize();

async function getDbConnection() {
    return await mysql.createConnection(dbConfig);
}

// Rota para verificar status e obter QR code
router.get('/whatsapp-status', async (req, res) => {
    try {
        if (isConnected) {
            res.json({ connected: true });
        } else if (qrCodeData) {
            const qrImage = await qrcode.toDataURL(qrCodeData); // Gera QR code como imagem base64
            res.json({ connected: false, qrCode: qrImage });
        } else {
            res.json({ connected: false, qrCode: null });
        }
    } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        res.status(500).json({ error: 'Erro ao verificar status do WhatsApp' });
    }
});

router.get('/contacts', async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM contacts');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Erro GET /contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Outras rotas (POST /contacts, PUT /contacts/:id, etc.) permanecem iguais
router.post('/contacts', async (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
            [name, phone, email || null]
        );
        await connection.end();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro POST /contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name, phone, email || null, id]
        );
        await connection.end();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro PUT /contacts/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getDbConnection();
        await connection.execute('DELETE FROM contacts WHERE id = ?', [id]);
        await connection.end();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro DELETE /contacts/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/send-messages', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    try {
        const connection = await getDbConnection();
        await connection.execute('INSERT INTO messages (content) VALUES (?)', [message]);
        const [contacts] = await connection.execute('SELECT * FROM contacts');

        if (contacts.length > 0 && isConnected) {
            for (const contact of contacts) {
                const phoneNumber = `${contact.phone}@c.us`;
                await whatsappClient.sendMessage(phoneNumber, message);
            }
        }

        await connection.end();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro POST /send-messages:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM messages');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Erro GET /messages:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;