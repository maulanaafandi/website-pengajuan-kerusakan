const connection = require('../config/db')
const bcrypt = require('bcryptjs')

class User {
  static async getUsers(search = '') {
    try {
      return search ? await User.searchUsers(search) : await User.getAllUsers()
    } catch (error) {
      console.log('Error getUsers:', error)
      throw error
    }
  }

  static async searchUsers(search) {
    try {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT id_user, email, role, kaleb FROM user
         WHERE email LIKE ? OR role LIKE ? OR kaleb LIKE ?
         ORDER BY id_user DESC`,
        [keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchUsers:', error)
      throw error
    }
  }

  static async getAllUsers() {
    try {
      const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user ORDER BY id_user DESC`)
      return rows
    } catch (error) {
      console.log('Error getAllUsers:', error)
      throw error
    }
  }

  static async getUserById(idUser) {
    try {
      const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user WHERE id_user = ?`, [idUser])
      return rows[0]
    } catch (error) {
      console.log('Error getUserById:', error)
      throw error
    }
  }

  static async getProfile(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT id_user, email, role, kaleb
         FROM user
         WHERE id_user = ?`,
        [idUser]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error getProfile:', error)
      throw error
    }
  }

  static async findUserById(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT id_user, email, password, role, kaleb
         FROM user
         WHERE id_user = ?`,
        [idUser]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error findUserById:', error)
      throw error
    }
  }

  static async findUserByEmail(email) {
    try {
      const [rows] = await connection.query(`SELECT id_user FROM user WHERE email = ?`, [email])
      return rows[0]
    } catch (error) {
      console.log('Error findUserByEmail:', error)
      throw error
    }
  }

  static async createUser(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password || 'user123', 10)
      await connection.query(
        `INSERT INTO user (email, password, role, kaleb) VALUES (?, ?, ?, ?)`,
        [data.email, hashedPassword, data.role, data.kaleb || '0']
      )
    } catch (error) {
      console.log('Error createUser:', error)
      throw error
    }
  }

  static async updateUser(idUser, data) {
    try {
      await connection.query(
        `UPDATE user SET email = ?, role = ?, kaleb = ? WHERE id_user = ?`,
        [data.email, data.role, data.kaleb || '0', idUser]
      )
    } catch (error) {
      console.log('Error updateUser:', error)
      throw error
    }
  }

  static async deleteUser(idUser) {
    try {
      await connection.query(`DELETE FROM user WHERE id_user = ? AND role != ?`, [idUser, 'admin'])
    } catch (error) {
      console.log('Error deleteUser:', error)
      throw error
    }
  }

  static async updatePassword(idUser, hashedPassword) {
    try {
      await connection.query(
        `UPDATE user
         SET password = ?
         WHERE id_user = ?`,
        [hashedPassword, idUser]
      )
    } catch (error) {
      console.log('Error updatePassword:', error)
      throw error
    }
  }
}

module.exports = User
