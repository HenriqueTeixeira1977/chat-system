/*
module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat_system'

};
*/
module.exports = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};