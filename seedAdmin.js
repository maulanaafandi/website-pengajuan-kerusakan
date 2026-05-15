require('dotenv').config()

const connection = require('./config/db')
const bcrypt = require('bcryptjs')

async function seedAdmin() {
    try {
        const [rows] = await connection.query(
            `SELECT id_user FROM user  WHERE email = ? AND role = ?`,
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
                `INSERT INTO user (email, password, role, kaleb) VALUES (?, ?, ?, ?)`,
                [
                    process.env.ADMIN_EMAIL,hashedPassword,'admin','0'
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