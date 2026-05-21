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
        `SELECT r.*, u.email AS dosen_kaleb_email, u.role AS dosen_kaleb_role, u.kaleb AS dosen_kaleb_status
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         WHERE r.nama_ruangan LIKE ? OR r.kode_ruangan LIKE ? OR r.lokasi LIKE ? OR u.email LIKE ?
         ORDER BY r.id_ruangan DESC`,
        [keyword, keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchRuangan:', error)
      throw error
    }
  }

  static async getAllRuangan() {
    try {
      const [rows] = await connection.query(
        `SELECT r.*, u.email AS dosen_kaleb_email, u.role AS dosen_kaleb_role, u.kaleb AS dosen_kaleb_status
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         ORDER BY r.id_ruangan DESC`
      )
      return rows
    } catch (error) {
      console.log('Error getAllRuangan:', error)
      throw error
    }
  }

  static async getRuanganPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT r.id_ruangan, r.nama_ruangan, r.kode_ruangan, r.lokasi, r.id_user, u.email AS dosen_kaleb_email
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         ORDER BY r.id_ruangan DESC`
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
        `SELECT r.id_ruangan AS id, r.nama_ruangan, r.kode_ruangan, r.lokasi, r.id_user, u.email AS dosen_kaleb_email
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         ORDER BY r.id_ruangan DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllRuanganPengguna:', error)
      throw error
    }
  }

  static async getRuanganById(idRuangan) {
    try {
      const [rows] = await connection.query(
        `SELECT r.*, u.email AS dosen_kaleb_email, u.role AS dosen_kaleb_role, u.kaleb AS dosen_kaleb_status
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         WHERE r.id_ruangan = ?`,
        [idRuangan]
      )
      return rows[0]
    } catch (error) {
      console.log('Error getRuanganById:', error)
      throw error
    }
  }

  static async createRuangan(data) {
    try {
      await connection.query(
        `INSERT INTO ruangan (nama_ruangan, kode_ruangan, lokasi, id_user) VALUES (?, ?, ?, ?)`,
        [data.nama_ruangan, data.kode_ruangan, data.lokasi, data.id_user || null]
      )
    } catch (error) {
      console.log('Error createRuangan:', error)
      throw error
    }
  }

  static async updateRuangan(idRuangan, data) {
    try {
      await connection.query(
        `UPDATE ruangan SET nama_ruangan = ?, kode_ruangan = ?, lokasi = ?, id_user = ? WHERE id_ruangan = ?`,
        [data.nama_ruangan, data.kode_ruangan, data.lokasi, data.id_user || null, idRuangan]
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
      const [rows] = await connection.query(
        `SELECT r.id_ruangan, r.nama_ruangan, r.kode_ruangan, r.lokasi, r.id_user, u.email AS dosen_kaleb_email
         FROM ruangan r
         LEFT JOIN user u ON r.id_user = u.id_user
         ORDER BY r.nama_ruangan ASC`
      )
      return rows
    } catch (error) {
      console.log('Error getRuanganUntukAI:', error)
      throw error
    }
  }
}

module.exports = Ruangan
