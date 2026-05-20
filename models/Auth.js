const connection = require('../config/db')

class Auth {
  static async findUserByEmail(email) {
    const [rows] = await connection.query(
      `SELECT * FROM user WHERE email = ? LIMIT 1`,
      [email]
    )

    return rows[0] || null
  }
}

module.exports = Auth
