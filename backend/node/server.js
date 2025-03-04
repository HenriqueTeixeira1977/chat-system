const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

//const mysql = require('mysql2/promise');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});


/*
// Configuração do MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat_system'
};

// Middleware para conexão com banco
async function getDbConnection() {
    return await mysql.createConnection(dbConfig);
}

app.get('/api/contacts', async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM contacts');
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/send-messages', async (req, res) => {
    const { message } = req.body;
    
    try {
        const connection = await getDbConnection();
        
        // Salva a mensagem
        await connection.execute(
            'INSERT INTO messages (content) VALUES (?)',
            [message]
        );
        
        // Aqui você integraria com uma API de envio real (WhatsApp, SMS, etc.)
        // Por enquanto, apenas simulamos o envio
        const [contacts] = await connection.execute('SELECT * FROM contacts');
        
        // Simulação de envio
        console.log(`Enviando "${message}" para ${contacts.length} contatos`);
        
        await connection.end();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(8080, () => {
    console.log('Server running on port 8080');
});

*/