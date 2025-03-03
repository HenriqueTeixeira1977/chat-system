const express = require('express');
const mysql = require('mysql2/promise');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dbConfig = require('../config/db');

const router = express.Router();

// Configuração do WhatsApp
const whatsappClient = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão localmente
    puppeteer: { headless: true }  // Executa o navegador em segundo plano
});

// Inicialização do cliente WhatsApp
whatsappClient.on('qr', (qr) => {
    console.log('Escaneie o QR code abaixo com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

whatsappClient.on('authenticated', () => {
    console.log('Autenticado com sucesso');
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

whatsappClient.initialize();

async function getDbConnection() {
    return await mysql.createConnection(dbConfig);
}

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

router.post('/contacts', async (req, res) => {
    const { name, phone, email } = req.body;
    console.log('Recebido POST /contacts:', { name, phone, email });
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
            [name, phone, email]
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
    console.log('Recebido PUT /contacts/:id:', { id, name, phone, email });
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name, phone, email, id]
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
    console.log('Recebido DELETE /contacts/:id:', { id });
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
    console.log('Recebido POST /send-messages:', { message });
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    try {
        const connection = await getDbConnection();
        console.log('Conexão com o banco estabelecida');
        await connection.execute('INSERT INTO messages (content) VALUES (?)', [message]);
        console.log('Mensagem salva no banco');
        const [contacts] = await connection.execute('SELECT * FROM contacts');
        console.log('Contatos carregados:', contacts);

        if (contacts.length > 0) {
            for (const contact of contacts) {
                const phoneNumber = `${contact.phone}@c.us`; // Formato do WhatsApp: 5511987654321@c.us
                try {
                    await whatsappClient.sendMessage(phoneNumber, message);
                    console.log(`Mensagem enviada para ${contact.name} (${contact.phone})`);
                } catch (sendError) {
                    console.error(`Erro ao enviar para ${contact.phone}:`, sendError.message);
                }
            }
        } else {
            console.log('Nenhum contato encontrado para envio');
        }

        await connection.end();
        res.json({ success: true });
    } catch (error) {
        console.error('Erro POST /send-messages:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;