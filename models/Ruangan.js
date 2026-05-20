const connection = require('../config/db')

class Ruangan {
  static async getRuangan(search = '') {
    try {
      return search ? await Ruangan.searchRuangan(search) : await Ruangan.getAllRuangan()
    } catch (error) {
      console.log('Error getRuangan:', error)
      throw error
    }
  }

  static async searchRuangan(search) {
    try {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT * FROM ruangan
         WHERE nama_ruangan LIKE ? OR kode_ruangan LIKE ? OR lokasi LIKE ?
         ORDER BY id_ruangan DESC`,
        [keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchRuangan:', error)
      throw error
    }
  }

  static async getAllRuangan() {
    try {
      const [rows] = await connection.query(`SELECT * FROM ruangan ORDER BY id_ruangan DESC`)
      return rows
    } catch (error) {
      console.log('Error getAllRuangan:', error)
      throw error
    }
  }

  static async getRuanganPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi
         FROM ruangan
         ORDER BY id_ruangan DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getRuanganPengguna:', error)
      throw error
    }
  }

  static async getAllRuanganPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT id_ruangan AS id, nama_ruangan, kode_ruangan, lokasi
         FROM ruangan
         ORDER BY id_ruangan DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllRuanganPengguna:', error)
      throw error
    }
  }

  static async getRuanganById(idRuangan) {
    try {
      const [rows] = await connection.query(`SELECT * FROM ruangan WHERE id_ruangan = ?`, [idRuangan])
      return rows[0]
    } catch (error) {
      console.log('Error getRuanganById:', error)
      throw error
    }
  }

  static async createRuangan(data) {
    try {
      await connection.query(
        `INSERT INTO ruangan (nama_ruangan, kode_ruangan, lokasi) VALUES (?, ?, ?)`,
        [data.nama_ruangan, data.kode_ruangan, data.lokasi]
      )
    } catch (error) {
      console.log('Error createRuangan:', error)
      throw error
    }
  }

  static async updateRuangan(idRuangan, data) {
    try {
      await connection.query(
        `UPDATE ruangan SET nama_ruangan = ?, kode_ruangan = ?, lokasi = ? WHERE id_ruangan = ?`,
        [data.nama_ruangan, data.kode_ruangan, data.lokasi, idRuangan]
      )
    } catch (error) {
      console.log('Error updateRuangan:', error)
      throw error
    }
  }

  static async deleteRuangan(idRuangan) {
    try {
      await connection.query(`DELETE FROM ruangan WHERE id_ruangan = ?`, [idRuangan])
    } catch (error) {
      console.log('Error deleteRuangan:', error)
      throw error
    }
  }

  static async getRuanganUntukAI() {
    try {
      const [rows] = await connection.query(`SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi FROM ruangan ORDER BY nama_ruangan ASC`)
      return rows
    } catch (error) {
      console.log('Error getRuanganUntukAI:', error)
      throw error
    }
  }
}

module.exports = Ruangan
