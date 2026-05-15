require('dotenv').config({ quiet: true })
const mysql = require('mysql2')

const pool = mysql.createPool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
    
}).promise();

(async () => {
    try {
        const conn = await pool.getConnection()
        console.log('koneksi Berhasil')
        conn.release()
    } catch (err) {
        console.log('Koneksi Gagal:', err)
    }
})()

module.exports = pool

