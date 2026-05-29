const connection = require('../config/db')

class Lantai {
  static async getAll(search = '') {
    try {
      const params = []
      let where = ''

      if (search) {
        where = 'WHERE nama LIKE ?'
        params.push(`%${search}%`)
      }

      const [rows] = await connection.query(
        `SELECT id, nama FROM lantai ${where} ORDER BY id DESC`,
        params
      )

      return rows
    } catch (error) {
      console.log('Error getAll lantai:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await connection.query('SELECT id, nama FROM lantai WHERE id = ?', [id])
      return rows[0] || null
    } catch (error) {
      console.log('Error getById lantai:', error)
      throw error
    }
  }

  static async create(data) {
    try {
      await connection.query('INSERT INTO lantai (nama) VALUES (?)', [data.nama])
    } catch (error) {
      console.log('Error create lantai:', error)
      throw error
    }
  }

  static async update(id, data) {
    try {
      await connection.query('UPDATE lantai SET nama = ? WHERE id = ?', [data.nama, id])
    } catch (error) {
      console.log('Error update lantai:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await connection.query('DELETE FROM lantai WHERE id = ?', [id])
    } catch (error) {
      console.log('Error delete lantai:', error)
      throw error
    }
  }
}

module.exports = Lantai
