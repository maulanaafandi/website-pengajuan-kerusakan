const connection = require('../config/db')
const bcrypt = require('bcryptjs')

class User {
  static get selectFields() {
    return `id AS id_user, nama, email, role, kaleb, status`
  }

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
        `SELECT ${User.selectFields}
         FROM users
         WHERE nama LIKE ? OR email LIKE ? OR role LIKE ? OR kaleb LIKE ? OR status LIKE ?
         ORDER BY id DESC`,
        [keyword, keyword, keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchUsers:', error)
      throw error
    }
  }

  static async getAllUsers() {
    try {
      const [rows] = await connection.query(`SELECT ${User.selectFields} FROM users ORDER BY id DESC`)
      return rows
    } catch (error) {
      console.log('Error getAllUsers:', error)
      throw error
    }
  }

  static async getDosenKalebUsers() {
    try {
      const [rows] = await connection.query(
        `SELECT ${User.selectFields}
         FROM users
         WHERE kaleb = ?
         ORDER BY nama ASC, email ASC`,
        ['1']
      )
      return rows
    } catch (error) {
      console.log('Error getDosenKalebUsers:', error)
      throw error
    }
  }

  static async getUserById(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT ${User.selectFields} FROM users WHERE id = ?`,
        [idUser]
      )
      return rows[0]
    } catch (error) {
      console.log('Error getUserById:', error)
      throw error
    }
  }

  static async getProfile(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT ${User.selectFields}
         FROM users
         WHERE id = ?`,
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
        `SELECT id AS id_user, nama, email, kata_sandi AS password, role, kaleb, status
         FROM users
         WHERE id = ?`,
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
      const [rows] = await connection.query(`SELECT id AS id_user FROM users WHERE email = ?`, [email])
      return rows[0]
    } catch (error) {
      console.log('Error findUserByEmail:', error)
      throw error
    }
  }

  static async createUser(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password || data.kata_sandi || 'user123', 10)
      const nama = data.nama || String(data.email || '').split('@')[0] || 'User'

      const [result] = await connection.query(
        `INSERT INTO users (nama, email, kata_sandi, role, kaleb, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nama, data.email, hashedPassword, data.role, data.kaleb || '0', data.status || 'proses']
      )

      return result.insertId
    } catch (error) {
      console.log('Error createUser:', error)
      throw error
    }
  }

  static async updateUser(idUser, data) {
    try {
      await connection.query(
        `UPDATE users
         SET nama = ?, email = ?, role = ?, kaleb = ?, status = ?
         WHERE id = ?`,
        [
          data.nama,
          data.email,
          data.role,
          data.kaleb || '0',
          data.status || 'proses',
          idUser
        ]
      )
    } catch (error) {
      console.log('Error updateUser:', error)
      throw error
    }
  }

  static async updateStatus(idUser, status) {
    try {
      const allowedStatus = ['proses', 'aktif', 'nonaktif']
      if (!allowedStatus.includes(status)) {
        throw new Error('Status akun tidak valid')
      }

      await connection.query(`UPDATE users SET status = ? WHERE id = ? AND role != ?`, [status, idUser, 'admin'])
    } catch (error) {
      console.log('Error updateStatus:', error)
      throw error
    }
  }

  static async deleteUser(idUser) {
    try {
      await connection.query(`DELETE FROM users WHERE id = ? AND role != ?`, [idUser, 'admin'])
    } catch (error) {
      console.log('Error deleteUser:', error)
      throw error
    }
  }

  static async updatePassword(idUser, hashedPassword) {
    try {
      await connection.query(
        `UPDATE users
         SET kata_sandi = ?
         WHERE id = ?`,
        [hashedPassword, idUser]
      )
    } catch (error) {
      console.log('Error updatePassword:', error)
      throw error
    }
  }
}

module.exports = User
