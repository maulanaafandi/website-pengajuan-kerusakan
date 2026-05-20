const connection = require('../config/db')
const bcrypt = require('bcryptjs')

class User {
  static async getUsers(search = '') {
    return search ? User.searchUsers(search) : User.getAllUsers()
  }

  static async searchUsers(search) {
    const keyword = `%${search}%`
    const [rows] = await connection.query(
      `SELECT id_user, email, role, kaleb FROM user
       WHERE email LIKE ? OR role LIKE ? OR kaleb LIKE ?
       ORDER BY id_user DESC`,
      [keyword, keyword, keyword]
    )

    return rows
  }

  static async getAllUsers() {
    const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user ORDER BY id_user DESC`)
    return rows
  }

  static async getUserById(idUser) {
    const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user WHERE id_user = ?`, [idUser])
    return rows[0]
  }

  static async getProfile(idUser) {
    const [rows] = await connection.query(
      `SELECT id_user, email, role, kaleb
       FROM user
       WHERE id_user = ?`,
      [idUser]
    )

    return rows[0] || null
  }

  static async findUserById(idUser) {
    const [rows] = await connection.query(
      `SELECT id_user, email, password, role, kaleb
       FROM user
       WHERE id_user = ?`,
      [idUser]
    )

    return rows[0] || null
  }

  static async findUserByEmail(email) {
    const [rows] = await connection.query(`SELECT id_user FROM user WHERE email = ?`, [email])
    return rows[0]
  }

  static async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password || 'user123', 10)
    await connection.query(
      `INSERT INTO user (email, password, role, kaleb) VALUES (?, ?, ?, ?)`,
      [data.email, hashedPassword, data.role, data.kaleb || '0']
    )
  }

  static async updateUser(idUser, data) {
    await connection.query(
      `UPDATE user SET email = ?, role = ?, kaleb = ? WHERE id_user = ?`,
      [data.email, data.role, data.kaleb || '0', idUser]
    )
  }

  static async deleteUser(idUser) {
    await connection.query(`DELETE FROM user WHERE id_user = ? AND role != ?`, [idUser, 'admin'])
  }

  static async updatePassword(idUser, hashedPassword) {
    await connection.query(
      `UPDATE user
       SET password = ?
       WHERE id_user = ?`,
      [hashedPassword, idUser]
    )
  }
}

module.exports = User
