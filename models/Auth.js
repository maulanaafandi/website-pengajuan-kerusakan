const connection = require('../config/db')

class Auth {
  static async findUserByEmail(email) {
    try {
      const [rows] = await connection.query(
        `SELECT * FROM user WHERE email = ? LIMIT 1`,
        [email]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error findUserByEmail:', error)
      throw error
    }
  }
}

module.exports = Auth
