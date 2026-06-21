const connection = require('../config/db')

class Ruangan {
  static get selectFields() {
    return `
      r.id AS id_ruangan,
      r.id AS id,
      r.nama AS nama_ruangan,
      r.nama,
      r.kode_ruangan,
      r.id_lokasi,
      r.id_lantai,
      r.id_kaleb AS id_user,
      r.id_kaleb,
      lok.nama AS lokasi,
      lan.nama AS lantai,
      u.email AS dosen_kaleb_email,
      u.nama AS dosen_kaleb_nama,
      u.role AS dosen_kaleb_role,
      u.kaleb AS dosen_kaleb_status
    `
  }

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
        `SELECT ${Ruangan.selectFields}
         FROM ruangan r
         LEFT JOIN users u ON r.id_kaleb = u.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE r.nama LIKE ? OR r.kode_ruangan LIKE ? OR lok.nama LIKE ? OR lan.nama LIKE ? OR u.email LIKE ? OR u.nama LIKE ?
         ORDER BY r.id DESC`,
        [keyword, keyword, keyword, keyword, keyword, keyword]
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
        `SELECT ${Ruangan.selectFields}
         FROM ruangan r
         LEFT JOIN users u ON r.id_kaleb = u.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         ORDER BY r.id DESC`
      )
      return rows
    } catch (error) {
      console.log('Error getAllRuangan:', error)
      throw error
    }
  }

  static async getRuanganPengguna() {
    return Ruangan.getAllRuangan()
  }

  static async getAllRuanganPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT id, CONCAT(nama, ' - ', kode_ruangan) AS nama
         FROM ruangan
         ORDER BY id DESC`
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
        `SELECT ${Ruangan.selectFields}
         FROM ruangan r
         LEFT JOIN users u ON r.id_kaleb = u.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE r.id = ?`,
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
        `INSERT INTO ruangan (nama, kode_ruangan, id_lokasi, id_lantai, id_kaleb) VALUES (?, ?, ?, ?, ?)`,
        [
          data.nama_ruangan || data.nama,
          data.kode_ruangan,
          data.id_lokasi || null,
          data.id_lantai || null,
          data.id_kaleb || data.id_user || null
        ]
      )
    } catch (error) {
      console.log('Error createRuangan:', error)
      throw error
    }
  }

  static async updateRuangan(idRuangan, data) {
    try {
      await connection.query(
        `UPDATE ruangan
         SET nama = ?, kode_ruangan = ?, id_lokasi = ?, id_lantai = ?, id_kaleb = ?
         WHERE id = ?`,
        [
          data.nama_ruangan || data.nama,
          data.kode_ruangan,
          data.id_lokasi || null,
          data.id_lantai || null,
          data.id_kaleb || data.id_user || null,
          idRuangan
        ]
      )
    } catch (error) {
      console.log('Error updateRuangan:', error)
      throw error
    }
  }

  static async deleteRuangan(idRuangan) {
    try {
      const [ruanganRows] = await connection.query(
        `SELECT id
         FROM ruangan
         WHERE id = ?
         LIMIT 1`,
        [idRuangan]
      )

      if (!ruanganRows.length) {
        const error = new Error('Ruangan tidak ditemukan')
        error.code = 'RUANGAN_NOT_FOUND'
        throw error
      }

      const [laporanRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         WHERE i.id_ruangan = ?`,
        [idRuangan]
      )

      if (laporanRows[0]?.total > 0) {
        const error = new Error('Ruangan tidak bisa dihapus karena sudah digunakan pada laporan')
        error.code = 'RUANGAN_USED_IN_LAPORAN'
        throw error
      }

      const [result] = await connection.query(`DELETE FROM ruangan WHERE id = ?`, [idRuangan])
      return result
    } catch (error) {
      console.log('Error deleteRuangan:', error)
      throw error
    }
  }
}

module.exports = Ruangan
