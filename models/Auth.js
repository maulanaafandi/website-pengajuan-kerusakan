const connection = require('../config/db')
const bcrypt = require('bcryptjs')

class Auth {
  static async findUserByEmail(email) {
    try {
      const [rows] = await connection.query(
        `SELECT
            id AS id_user,
            nama,
            email,
            kata_sandi AS password,
            role,
            kaleb,
            status
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error findUserByEmail:', error)
      throw error
    }
  }

  static async checkEmail(email) {
    try {
      const [rows] = await connection.query('SELECT email FROM users WHERE email = ?', [email])
      return rows.length > 0
    } catch (error) {
      console.log('Error checkEmail:', error)
      throw error
    }
  }

  static async loginMobile(data) {
    try {
      const [rows] = await connection.query(
        `SELECT id, nama, email, kata_sandi, role, kaleb, status FROM users WHERE email = ? LIMIT 1`,
        [data.email]
      )
      return rows[0] || null
    } catch (error) {
      console.log('Error loginMobile:', error)
      throw error
    }
  }

  static async register(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.kata_sandi, 10)
      const [result] = await connection.query(
        `INSERT INTO users (nama, email, kata_sandi, role, kaleb, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [data.nama, data.email, hashedPassword, data.role, '0', 'proses']
      )
      return result
    } catch (error) {
      console.log('Error register:', error)
      throw error
    }
  }
}

module.exports = Auth
