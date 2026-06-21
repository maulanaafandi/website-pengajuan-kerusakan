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
      const [lokasiRows] = await connection.query(
        `SELECT id
         FROM lokasi
         WHERE id = ?
         LIMIT 1`,
        [id]
      )

      if (!lokasiRows.length) {
        const error = new Error('Lokasi tidak ditemukan')
        error.code = 'LOKASI_NOT_FOUND'
        throw error
      }

      const [laporanRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         WHERE r.id_lokasi = ?`,
        [id]
      )

      if (laporanRows[0]?.total > 0) {
        const error = new Error('Lokasi tidak bisa dihapus karena sudah digunakan pada laporan')
        error.code = 'LOKASI_USED_IN_LAPORAN'
        throw error
      }

      const [result] = await connection.query('DELETE FROM lokasi WHERE id = ?', [id])
      return result
    } catch (error) {
      console.log('Error delete lokasi:', error)
      throw error
    }
  }
}

module.exports = Lokasi
