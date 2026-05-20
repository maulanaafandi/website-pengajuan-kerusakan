const connection = require('../config/db')

class Rekomendasi {
  static async getRekomendasi(search = '') {
    try {
      return search ? await Rekomendasi.searchRekomendasi(search) : await Rekomendasi.getAllRekomendasi()
    } catch (error) {
      console.log('Error getRekomendasi:', error)
      throw error
    }
  }

  static async searchRekomendasi(search) {
    try {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT r.*, ru.nama_ruangan, ru.kode_ruangan, ru.lokasi
         FROM rekomendasi_pengajuan_barang r
         LEFT JOIN ruangan ru ON r.id_ruangan = ru.id_ruangan
         WHERE r.barang_rekomendasi_diajukan LIKE ? OR r.nama_barang LIKE ? OR r.alasan LIKE ? OR ru.nama_ruangan LIKE ? OR ru.kode_ruangan LIKE ? OR ru.lokasi LIKE ?
         ORDER BY r.id_rekomendasi DESC`,
        [keyword, keyword, keyword, keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchRekomendasi:', error)
      throw error
    }
  }

  static async getAllRekomendasi() {
    try {
      const [rows] = await connection.query(
        `SELECT r.*, ru.nama_ruangan, ru.kode_ruangan, ru.lokasi
         FROM rekomendasi_pengajuan_barang r
         LEFT JOIN ruangan ru ON r.id_ruangan = ru.id_ruangan
         ORDER BY r.id_rekomendasi DESC`
      )
      return rows
    } catch (error) {
      console.log('Error getAllRekomendasi:', error)
      throw error
    }
  }

  static async getRekomendasiById(idRekomendasi) {
    try {
      const [rows] = await connection.query(
        `SELECT r.*, ru.nama_ruangan, ru.kode_ruangan, ru.lokasi
         FROM rekomendasi_pengajuan_barang r
         LEFT JOIN ruangan ru ON r.id_ruangan = ru.id_ruangan
         WHERE r.id_rekomendasi = ?`,
        [idRekomendasi]
      )
      return rows[0]
    } catch (error) {
      console.log('Error getRekomendasiById:', error)
      throw error
    }
  }

  static async createRekomendasi(data) {
    try {
      await connection.query(
        `INSERT INTO rekomendasi_pengajuan_barang (id_ruangan, barang_rekomendasi_diajukan, tanggal, nama_barang, alasan)
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.id_ruangan,
          data.barang_rekomendasi_diajukan,
          data.tanggal || null,
          data.nama_barang || data.barang_rekomendasi_diajukan || null,
          data.alasan || null
        ]
      )
    } catch (error) {
      console.log('Error createRekomendasi:', error)
      throw error
    }
  }

  static async updateRekomendasi(idRekomendasi, data) {
    try {
      await connection.query(
        `UPDATE rekomendasi_pengajuan_barang
         SET id_ruangan = ?, barang_rekomendasi_diajukan = ?, tanggal = ?, nama_barang = ?, alasan = ?
         WHERE id_rekomendasi = ?`,
        [
          data.id_ruangan,
          data.barang_rekomendasi_diajukan,
          data.tanggal || null,
          data.nama_barang || data.barang_rekomendasi_diajukan || null,
          data.alasan || null,
          idRekomendasi
        ]
      )
    } catch (error) {
      console.log('Error updateRekomendasi:', error)
      throw error
    }
  }

  static async deleteRekomendasi(idRekomendasi) {
    try {
      await connection.query(`DELETE FROM rekomendasi_pengajuan_barang WHERE id_rekomendasi = ?`, [idRekomendasi])
    } catch (error) {
      console.log('Error deleteRekomendasi:', error)
      throw error
    }
  }

  static async createRekomendasiAI(item) {
    try {
      await connection.query(
        `INSERT INTO rekomendasi_pengajuan_barang
         (id_ruangan, barang_rekomendasi_diajukan, tanggal, nama_barang, alasan)
         VALUES (?, ?, ?, ?, ?)`,
        [
          item.id_ruangan || null,
          item.barang_rekomendasi_diajukan || item.nama_barang || '-',
          item.tanggal || null,
          item.nama_barang || item.barang_rekomendasi_diajukan || '-',
          item.alasan || '-'
        ]
      )
    } catch (error) {
      console.log('Error createRekomendasiAI:', error)
      throw error
    }
  }
}

module.exports = Rekomendasi
