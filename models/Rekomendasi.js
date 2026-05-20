const connection = require('../config/db')

class Rekomendasi {
  static async getRekomendasi(search = '') {
    return search ? Rekomendasi.searchRekomendasi(search) : Rekomendasi.getAllRekomendasi()
  }

  static async searchRekomendasi(search) {
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
  }

  static async getAllRekomendasi() {
    const [rows] = await connection.query(
      `SELECT r.*, ru.nama_ruangan, ru.kode_ruangan, ru.lokasi
       FROM rekomendasi_pengajuan_barang r
       LEFT JOIN ruangan ru ON r.id_ruangan = ru.id_ruangan
       ORDER BY r.id_rekomendasi DESC`
    )
    return rows
  }

  static async getRekomendasiById(idRekomendasi) {
    const [rows] = await connection.query(
      `SELECT r.*, ru.nama_ruangan, ru.kode_ruangan, ru.lokasi
       FROM rekomendasi_pengajuan_barang r
       LEFT JOIN ruangan ru ON r.id_ruangan = ru.id_ruangan
       WHERE r.id_rekomendasi = ?`,
      [idRekomendasi]
    )
    return rows[0]
  }

  static async createRekomendasi(data) {
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
  }

  static async updateRekomendasi(idRekomendasi, data) {
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
  }

  static async deleteRekomendasi(idRekomendasi) {
    await connection.query(`DELETE FROM rekomendasi_pengajuan_barang WHERE id_rekomendasi = ?`, [idRekomendasi])
  }

  static async createRekomendasiAI(item) {
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
  }
}

module.exports = Rekomendasi
