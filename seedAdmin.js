require('dotenv').config()

const connection = require('./config/db')
const bcrypt = require('bcryptjs')

async function seedAdmin() {
    try {
        const [rows] = await connection.query(
            `SELECT id FROM users WHERE email = ? AND role = ?`,
            [
                process.env.ADMIN_EMAIL,
                'admin'
            ]
        )

        if (rows.length > 0) {
            console.log('Admin sudah ditambahkan sebelumnya.')

        } else {
            const hashedPassword = bcrypt.hashSync(
                process.env.ADMIN_PASSWORD,
                10
            )

            await connection.query(
                `INSERT INTO users (nama, email, kata_sandi, role, kaleb, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    'Administrator',process.env.ADMIN_EMAIL,hashedPassword,'admin','0','aktif'
                ]
            )

            console.log('Akun Admin berhasil ditambahkan.')
        }

    } catch (err) {

        console.error(err)

    } finally {

        process.exit()
    }
}

seedAdmin()
