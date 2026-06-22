const connection = require('../config/db')

class Ruangan {
  static async syncKalebFlag(conn, userId) {
    const normalizedUserId = Number(userId)

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return
    }

    const [usageRows] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM ruangan
       WHERE id_kaleb = ?`,
      [normalizedUserId]
    )

    const kalebValue = usageRows[0]?.total > 0 ? '1' : '0'

    await conn.query(
      `UPDATE users
       SET kaleb = ?
       WHERE id = ?`,
      [kalebValue, normalizedUserId]
    )
  }

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
    const conn = await connection.getConnection()
    try {
      const selectedUserId = data.id_kaleb || data.id_user || null

      await conn.beginTransaction()
      await conn.query(
        `INSERT INTO ruangan (nama, kode_ruangan, id_lokasi, id_lantai, id_kaleb) VALUES (?, ?, ?, ?, ?)`,
        [
          data.nama_ruangan || data.nama,
          data.kode_ruangan,
          data.id_lokasi || null,
          data.id_lantai || null,
          selectedUserId
        ]
      )

      await Ruangan.syncKalebFlag(conn, selectedUserId)
      await conn.commit()
    } catch (error) {
      await conn.rollback()
      console.log('Error createRuangan:', error)
      throw error
    } finally {
      conn.release()
    }
  }

  static async updateRuangan(idRuangan, data) {
    const conn = await connection.getConnection()
    try {
      const selectedUserId = data.id_kaleb || data.id_user || null
      const [currentRows] = await conn.query(
        `SELECT id_kaleb
         FROM ruangan
         WHERE id = ?`,
        [idRuangan]
      )

      const previousUserId = currentRows[0]?.id_kaleb || null

      await conn.beginTransaction()
      await conn.query(
        `UPDATE ruangan
         SET nama = ?, kode_ruangan = ?, id_lokasi = ?, id_lantai = ?, id_kaleb = ?
         WHERE id = ?`,
        [
          data.nama_ruangan || data.nama,
          data.kode_ruangan,
          data.id_lokasi || null,
          data.id_lantai || null,
          selectedUserId,
          idRuangan
        ]
      )

      await Ruangan.syncKalebFlag(conn, previousUserId)
      await Ruangan.syncKalebFlag(conn, selectedUserId)
      await conn.commit()
    } catch (error) {
      await conn.rollback()
      console.log('Error updateRuangan:', error)
      throw error
    } finally {
      conn.release()
    }
  }

  static async deleteRuangan(idRuangan) {
    const conn = await connection.getConnection()
    try {
      await conn.beginTransaction()

      const [ruanganRows] = await conn.query(
        `SELECT id, id_kaleb
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

      const [laporanRows] = await conn.query(
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

      const previousUserId = ruanganRows[0]?.id_kaleb || null
      const [result] = await conn.query(`DELETE FROM ruangan WHERE id = ?`, [idRuangan])
      await Ruangan.syncKalebFlag(conn, previousUserId)
      await conn.commit()
      return result
    } catch (error) {
      await conn.rollback()
      console.log('Error deleteRuangan:', error)
      throw error
    } finally {
      conn.release()
    }
  }
}

module.exports = Ruangan
