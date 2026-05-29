const connection = require('../config/db')

class Lokasi {
  static async getAll(search = '') {
    try {
      const params = []
      let where = ''

      if (search) {
        where = 'WHERE nama LIKE ?'
        params.push(`%${search}%`)
      }

      const [rows] = await connection.query(
        `SELECT id, nama FROM lokasi ${where} ORDER BY id DESC`,
        params
      )

      return rows
    } catch (error) {
      console.log('Error getAll lokasi:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await connection.query('SELECT id, nama FROM lokasi WHERE id = ?', [id])
      return rows[0] || null
    } catch (error) {
      console.log('Error getById lokasi:', error)
      throw error
    }
  }

  static async create(data) {
    try {
      await connection.query('INSERT INTO lokasi (nama) VALUES (?)', [data.nama])
    } catch (error) {
      console.log('Error create lokasi:', error)
      throw error
    }
  }

  static async update(id, data) {
    try {
      await connection.query('UPDATE lokasi SET nama = ? WHERE id = ?', [data.nama, id])
    } catch (error) {
      console.log('Error update lokasi:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await connection.query('DELETE FROM lokasi WHERE id = ?', [id])
    } catch (error) {
      console.log('Error delete lokasi:', error)
      throw error
    }
  }
}

module.exports = Lokasi
