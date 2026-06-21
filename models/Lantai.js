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
      const [lantaiRows] = await connection.query(
        `SELECT id
         FROM lantai
         WHERE id = ?
         LIMIT 1`,
        [id]
      )

      if (!lantaiRows.length) {
        const error = new Error('Lantai tidak ditemukan')
        error.code = 'LANTAI_NOT_FOUND'
        throw error
      }

      const [laporanRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         WHERE r.id_lantai = ?`,
        [id]
      )

      if (laporanRows[0]?.total > 0) {
        const error = new Error('Lantai tidak bisa dihapus karena sudah digunakan pada laporan')
        error.code = 'LANTAI_USED_IN_LAPORAN'
        throw error
      }

      const [result] = await connection.query('DELETE FROM lantai WHERE id = ?', [id])
      return result
    } catch (error) {
      console.log('Error delete lantai:', error)
      throw error
    }
  }
}

module.exports = Lantai
