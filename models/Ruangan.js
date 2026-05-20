const connection = require('../config/db')

class Ruangan {
  static async getRuangan(search = '') {
    return search ? Ruangan.searchRuangan(search) : Ruangan.getAllRuangan()
  }

  static async searchRuangan(search) {
    const keyword = `%${search}%`
    const [rows] = await connection.query(
      `SELECT * FROM ruangan
       WHERE nama_ruangan LIKE ? OR kode_ruangan LIKE ? OR lokasi LIKE ?
       ORDER BY id_ruangan DESC`,
      [keyword, keyword, keyword]
    )

    return rows
  }

  static async getAllRuangan() {
    const [rows] = await connection.query(`SELECT * FROM ruangan ORDER BY id_ruangan DESC`)
    return rows
  }

  static async getRuanganPengguna() {
    const [rows] = await connection.query(
      `SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi
       FROM ruangan
       ORDER BY id_ruangan DESC`
    )

    return rows
  }

  static async getRuanganById(idRuangan) {
    const [rows] = await connection.query(`SELECT * FROM ruangan WHERE id_ruangan = ?`, [idRuangan])
    return rows[0]
  }

  static async createRuangan(data) {
    await connection.query(
      `INSERT INTO ruangan (nama_ruangan, kode_ruangan, lokasi) VALUES (?, ?, ?)`,
      [data.nama_ruangan, data.kode_ruangan, data.lokasi]
    )
  }

  static async updateRuangan(idRuangan, data) {
    await connection.query(
      `UPDATE ruangan SET nama_ruangan = ?, kode_ruangan = ?, lokasi = ? WHERE id_ruangan = ?`,
      [data.nama_ruangan, data.kode_ruangan, data.lokasi, idRuangan]
    )
  }

  static async deleteRuangan(idRuangan) {
    await connection.query(`DELETE FROM ruangan WHERE id_ruangan = ?`, [idRuangan])
  }

  static async getRuanganUntukAI() {
    const [rows] = await connection.query(`SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi FROM ruangan ORDER BY nama_ruangan ASC`)
    return rows
  }
}

module.exports = Ruangan
