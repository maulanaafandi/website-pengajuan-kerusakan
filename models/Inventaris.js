const connection = require('../config/db')

class Inventaris {
  static async getInventaris(search = '') {
    try {
      return search ? await Inventaris.searchInventaris(search) : await Inventaris.getAllInventaris()
    } catch (error) {
      console.log('Error getInventaris:', error)
      throw error
    }
  }

  static async searchInventaris(search) {
    try {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT * FROM inventaris
         WHERE kode_barang LIKE ? OR nup LIKE ? OR nama_barang LIKE ? OR merk LIKE ? OR tipe LIKE ? OR kategori LIKE ?
         ORDER BY id_inventaris DESC`,
        [keyword, keyword, keyword, keyword, keyword, keyword]
      )

      return rows
    } catch (error) {
      console.log('Error searchInventaris:', error)
      throw error
    }
  }

  static async getAllInventaris() {
    try {
      const [rows] = await connection.query(`SELECT * FROM inventaris ORDER BY id_inventaris DESC`)
      return rows
    } catch (error) {
      console.log('Error getAllInventaris:', error)
      throw error
    }
  }

  static async getInventarisPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT id_inventaris, kode_barang, nup, nama_barang, merk, kategori
         FROM inventaris
         ORDER BY id_inventaris DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getInventarisPengguna:', error)
      throw error
    }
  }

  static async getAllInventarisPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT id_inventaris AS id, nama_barang, merk, tipe
         FROM inventaris
         ORDER BY id_inventaris DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllInventarisPengguna:', error)
      throw error
    }
  }

  static async getInventarisById(idInventaris) {
    try {
      const [rows] = await connection.query(`SELECT * FROM inventaris WHERE id_inventaris = ?`, [idInventaris])
      return rows[0]
    } catch (error) {
      console.log('Error getInventarisById:', error)
      throw error
    }
  }

  static async getInventarisByNamaBarang(namaBarang) {
    try {
      const [rows] = await connection.query(
        `SELECT * FROM inventaris WHERE LOWER(nama_barang) = LOWER(?) LIMIT 1`,
        [namaBarang]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error getInventarisByNamaBarang:', error)
      throw error
    }
  }

  static async createInventaris(data) {
    try {
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
    } catch (error) {
      console.log('Error createInventaris:', error)
      throw error
    }
  }

  static async createInventarisNamaBarang(namaBarang) {
    try {
      const [result] = await connection.query(
        `INSERT INTO inventaris (nama_barang) VALUES (?)`,
        [namaBarang]
      )

      return result.insertId
    } catch (error) {
      console.log('Error createInventarisNamaBarang:', error)
      throw error
    }
  }

  static async updateInventaris(idInventaris, data) {
    try {
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
    } catch (error) {
      console.log('Error updateInventaris:', error)
      throw error
    }
  }

  static async deleteInventaris(idInventaris) {
    try {
      await connection.query(`DELETE FROM inventaris WHERE id_inventaris = ?`, [idInventaris])
    } catch (error) {
      console.log('Error deleteInventaris:', error)
      throw error
    }
  }

  static async getInventarisUntukAI() {
    try {
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
    } catch (error) {
      console.log('Error getInventarisUntukAI:', error)
      throw error
    }
  }

  static async getInventarisUntukAIFallback() {
    try {
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
    } catch (error) {
      console.log('Error getInventarisUntukAIFallback:', error)
      throw error
    }
  }
}

module.exports = Inventaris
