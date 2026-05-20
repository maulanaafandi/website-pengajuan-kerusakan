const connection = require('../config/db')

class Inventaris {
  static async getInventaris(search = '') {
    return search ? Inventaris.searchInventaris(search) : Inventaris.getAllInventaris()
  }

  static async searchInventaris(search) {
    const keyword = `%${search}%`
    const [rows] = await connection.query(
      `SELECT * FROM inventaris
       WHERE kode_barang LIKE ? OR nup LIKE ? OR nama_barang LIKE ? OR merk LIKE ? OR tipe LIKE ? OR kategori LIKE ?
       ORDER BY id_inventaris DESC`,
      [keyword, keyword, keyword, keyword, keyword, keyword]
    )

    return rows
  }

  static async getAllInventaris() {
    const [rows] = await connection.query(`SELECT * FROM inventaris ORDER BY id_inventaris DESC`)
    return rows
  }

  static async getInventarisPengguna() {
    const [rows] = await connection.query(
      `SELECT id_inventaris, kode_barang, nup, nama_barang, merk, kategori
       FROM inventaris
       ORDER BY id_inventaris DESC`
    )

    return rows
  }

  static async getInventarisById(idInventaris) {
    const [rows] = await connection.query(`SELECT * FROM inventaris WHERE id_inventaris = ?`, [idInventaris])
    return rows[0]
  }

  static async createInventaris(data) {
    await connection.query(
      `INSERT INTO inventaris
       (kode_barang, nup, nama_barang, merk, tipe, kategori, tanggal_buku_pertama, tanggal_perolehan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.kode_barang,
        data.nup || null,
        data.nama_barang,
        data.merk || null,
        data.tipe || null,
        data.kategori,
        data.tanggal_buku_pertama || null,
        data.tanggal_perolehan || null
      ]
    )
  }

  static async updateInventaris(idInventaris, data) {
    await connection.query(
      `UPDATE inventaris SET
       kode_barang = ?, nup = ?, nama_barang = ?, merk = ?, tipe = ?, kategori = ?, tanggal_buku_pertama = ?, tanggal_perolehan = ?
       WHERE id_inventaris = ?`,
      [
        data.kode_barang,
        data.nup || null,
        data.nama_barang,
        data.merk || null,
        data.tipe || null,
        data.kategori,
        data.tanggal_buku_pertama || null,
        data.tanggal_perolehan || null,
        idInventaris
      ]
    )
  }

  static async deleteInventaris(idInventaris) {
    await connection.query(`DELETE FROM inventaris WHERE id_inventaris = ?`, [idInventaris])
  }

  static async getInventarisUntukAI() {
    const [rows] = await connection.query(`
      SELECT
        i.id_inventaris,
        i.kode_barang,
        i.nup,
        i.nama_barang,
        i.merk,
        i.tipe,
        i.kategori,
        r.id_ruangan,
        r.nama_ruangan,
        r.kode_ruangan,
        r.lokasi
      FROM inventaris i
      LEFT JOIN ruangan r ON i.id_ruangan = r.id_ruangan
      GROUP BY i.kode_barang, i.nama_barang, i.merk, i.tipe, i.kategori, r.id_ruangan, r.nama_ruangan, r.kode_ruangan, r.lokasi
      ORDER BY i.nama_barang ASC
      LIMIT 200
    `)

    return rows
  }

  static async getInventarisUntukAIFallback() {
    const [rows] = await connection.query(`
      SELECT
        id_inventaris, kode_barang, nup, nama_barang, merk, tipe, kategori,
        NULL AS id_ruangan, NULL AS nama_ruangan, NULL AS kode_ruangan, NULL AS lokasi
      FROM inventaris
      GROUP BY kode_barang, nama_barang, merk, tipe, kategori
      ORDER BY nama_barang ASC
      LIMIT 200
    `)

    return rows
  }
}

module.exports = Inventaris
