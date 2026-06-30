const connection = require('../config/db')

class Inventaris {
  static selectFields() {
    return `
      i.id AS id_inventaris,
      i.id AS id,
      i.id_ruangan,
      i.kode_barang,
      i.NUP AS nup,
      i.NUP,
      i.nama_barang,
      i.merk,
      i.tipe,
      i.kategori,
      i.tanggal_buku_pertama,
      i.tanggal_perolehan,
      r.nama AS nama_ruangan,
      r.kode_ruangan,
      lok.nama AS lokasi,
      lan.nama AS lantai
    `
  }

  static async getInventaris(search = '') {
    try {
      return search
        ? await Inventaris.searchInventaris(search)
        : await Inventaris.getAllInventaris()
    } catch (error) {
      console.log('Error getInventaris:', error)
      throw error
    }
  }

  static async searchInventaris(search) {
    try {
      const keyword = `%${search}%`

      const [rows] = await connection.query(
        `SELECT ${Inventaris.selectFields()}
         FROM inventaris i
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE 
           i.kode_barang LIKE ? OR
           i.NUP LIKE ? OR
           i.nama_barang LIKE ? OR
           i.merk LIKE ? OR
           i.tipe LIKE ? OR
           i.kategori LIKE ? OR
           r.nama LIKE ? OR
           lok.nama LIKE ?
         ORDER BY i.id DESC`,
        [
          keyword,
          keyword,
          keyword,
          keyword,
          keyword,
          keyword,
          keyword,
          keyword
        ]
      )

      return rows
    } catch (error) {
      console.log('Error searchInventaris:', error)
      throw error
    }
  }

  static async getAllInventaris() {
    try {
      const [rows] = await connection.query(
        `SELECT ${Inventaris.selectFields()}
         FROM inventaris i
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         ORDER BY i.id DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllInventaris:', error)
      throw error
    }
  }

  static async getInventarisPengguna() {
    try {
      const [rows] = await connection.query(
        `SELECT 
          id AS id_inventaris,
          kode_barang,
          NUP AS nup,
          nama_barang,
          merk,
          kategori
         FROM inventaris
         ORDER BY id DESC`
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
        `SELECT id, CONCAT_WS(' - ', kode_barang, nama_barang, merk) AS barang
         FROM inventaris
         ORDER BY id DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllInventarisPengguna:', error)
      throw error
    }
  }

  static async getAllInventarisPenggunaByRuangan(id) {
    try {
      const [rows] = await connection.query(
        `SELECT id, CONCAT_WS(' - ', kode_barang, nama_barang, merk) AS barang
         FROM inventaris
         WHERE id_ruangan = ?
         ORDER BY id DESC`,
        [id]
      )

      return rows
    } catch (error) {
      console.log('Error getAllInventarisPenggunaByRuangan:', error)
      throw error
    }
  }

  static async getRuanganDenganInventaris() {
    try {
      const [rows] = await connection.query(
        `SELECT DISTINCT
          r.id,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          CONCAT(r.nama, ' - ', r.kode_ruangan) AS nama
         FROM inventaris i
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         ORDER BY nama_ruangan ASC, kode_ruangan ASC`
      )

      return rows
    } catch (error) {
      console.log('Error getRuanganDenganInventaris:', error)
      throw error
    }
  }

  static async getInventarisLaporanPerRuangan(idRuangan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          i.id AS id_inventaris,
          i.kode_barang,
          i.NUP AS nup,
          i.nama_barang,
          i.merk,
          i.kategori,
          r.id AS id_ruangan,
          r.nama AS nama_ruangan,
          r.kode_ruangan
         FROM inventaris i
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         WHERE r.id = ?
         ORDER BY i.id DESC`,
        [idRuangan]
      )

      return rows
    } catch (error) {
      console.log('Error getInventarisLaporanPerRuangan:', error)
      throw error
    }
  }

  static async getInventarisById(idInventaris) {
    try {
      const [rows] = await connection.query(
        `SELECT ${Inventaris.selectFields()}
         FROM inventaris i
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE i.id = ?`,
        [idInventaris]
      )

      return rows[0]
    } catch (error) {
      console.log('Error getInventarisById:', error)
      throw error
    }
  }

  static async getInventarisByIds(ids = []) {
    try {
      const uniqueIds = [...new Set(ids.map(id => Number(id)).filter(Number.isFinite))]

      if (!uniqueIds.length) {
        return []
      }

      const placeholders = uniqueIds.map(() => '?').join(', ')
      const [rows] = await connection.query(
        `SELECT id, nama_barang, kode_barang
         FROM inventaris
         WHERE id IN (${placeholders})`,
        uniqueIds
      )

      return rows
    } catch (error) {
      console.log('Error getInventarisByIds:', error)
      throw error
    }
  }

  static async getInventarisByNamaBarang(namaBarang) {
    try {
      const [rows] = await connection.query(
        `SELECT 
          id AS id_inventaris,
          nama_barang
         FROM inventaris
         WHERE LOWER(nama_barang) = LOWER(?)
         LIMIT 1`,
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
        (
          id_ruangan,
          kode_barang,
          NUP,
          nama_barang,
          merk,
          tipe,
          kategori,
          tanggal_buku_pertama,
          tanggal_perolehan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id_ruangan || null,
          data.kode_barang,
          data.nup || data.NUP || null,
          data.nama_barang,
          data.merk || null,
          data.tipe || null,
          data.kategori || 'Alat',
          data.tanggal_buku_pertama || null,
          data.tanggal_perolehan || null
        ]
      )
    } catch (error) {
      console.log('Error createInventaris:', error)
      throw error
    }
  }

  static async createManyInventaris(rows = []) {
    const conn = await connection.getConnection()

    try {
      await conn.beginTransaction()

      for (const data of rows) {
        await conn.query(
          `INSERT INTO inventaris
          (
            id_ruangan,
            kode_barang,
            NUP,
            nama_barang,
            merk,
            tipe,
            kategori,
            tanggal_buku_pertama,
            tanggal_perolehan
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id_ruangan || null,
            data.kode_barang,
            data.nup || data.NUP || null,
            data.nama_barang,
            data.merk || null,
            data.tipe || null,
            data.kategori || 'Alat',
            data.tanggal_buku_pertama || null,
            data.tanggal_perolehan || null
          ]
        )
      }

      await conn.commit()
    } catch (error) {
      await conn.rollback()
      console.log('Error createManyInventaris:', error)
      throw error
    } finally {
      conn.release()
    }
  }

  static async createInventarisNamaBarang(namaBarang) {
    try {
      const kodeBarang = `BRG-${Date.now()}`

      const [result] = await connection.query(
        `INSERT INTO inventaris
        (
          kode_barang,
          nama_barang,
          kategori
        )
        VALUES (?, ?, ?)`,
        [kodeBarang, namaBarang, 'Alat']
      )

      return result.insertId
    } catch (error) {
      console.log('Error createInventarisNamaBarang:', error)
      throw error
    }
  }

  static async updateInventaris(idInventaris, data) {
    try {
      const [result] = await connection.query(
        `UPDATE inventaris SET
          id_ruangan = ?,
          kode_barang = ?,
          NUP = ?,
          nama_barang = ?,
          merk = ?,
          tipe = ?,
          kategori = ?,
          tanggal_buku_pertama = ?,
          tanggal_perolehan = ?
         WHERE id = ?`,
        [
          data.id_ruangan || null,
          data.kode_barang,
          data.nup || data.NUP || null,
          data.nama_barang,
          data.merk || null,
          data.tipe || null,
          data.kategori || 'Alat',
          data.tanggal_buku_pertama || null,
          data.tanggal_perolehan || null,
          idInventaris
        ]
      )

      return result
    } catch (error) {
      console.log('Error updateInventaris:', error)
      throw error
    }
  }

  static async deleteInventaris(idInventaris) {
    try {
      const [inventarisRows] = await connection.query(
        `SELECT id
         FROM inventaris
         WHERE id = ?
         LIMIT 1`,
        [idInventaris]
      )

      if (!inventarisRows.length) {
        const error = new Error('Inventaris tidak ditemukan')
        error.code = 'INVENTARIS_NOT_FOUND'
        throw error
      }

      const [laporanRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan
         WHERE id_inventaris = ?`,
        [idInventaris]
      )

      if (laporanRows[0]?.total > 0) {
        const error = new Error('Inventaris tidak bisa dihapus karena sudah digunakan pada laporan')
        error.code = 'INVENTARIS_USED_IN_LAPORAN'
        throw error
      }

      const [result] = await connection.query(
        `DELETE FROM inventaris WHERE id = ?`,
        [idInventaris]
      )

      return result
    } catch (error) {
      console.log('Error deleteInventaris:', error)
      throw error
    }
  }
}

module.exports = Inventaris
