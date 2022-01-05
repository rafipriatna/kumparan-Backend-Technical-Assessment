const mysql = require('mysql');

const conn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_kumparan'
});

module.exports = conn
