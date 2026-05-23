const connection = require('../config/db')

class Laporan {
  static async getUpdateStatusKaleb() {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            l.id_user,
            u.email,
            l.id_inventaris,
            l.id_ruangan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.keterangan,
            l.keterangan_admin,
            l.status,
            l.bukti_foto,
            l.kondisi,
            i.nama_barang,
            i.kode_barang,
            i.merk,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN user u ON l.id_user = u.id_user
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         ORDER BY l.id_laporan DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getUpdateStatusKaleb:', error)
      throw error
    }
  }

  static async createLaporan(data) {
    try {
      const [result] = await connection.query(
        `INSERT INTO laporan
        (id_user, id_inventaris, id_ruangan, tanggal, keterangan, status, bukti_foto, kondisi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id_user,
          data.id_inventaris,
          data.id_ruangan,
          data.tanggal || null,
          data.keterangan,
          data.status || 'pending',
          data.bukti_foto || null,
          data.kondisi
        ]
      )

      return result.insertId
    } catch (error) {
      console.log('Error createLaporan:', error)
      throw error
    }
  }

  static async getRiwayatLaporan(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.status,
            i.nama_barang
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         WHERE l.id_user = ?
         ORDER BY l.id_laporan DESC`,
        [idUser]
      )

      return rows
    } catch (error) {
      console.log('Error getRiwayatLaporan:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanAdmin() {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.status,
            i.nama_barang,
            r.id_ruangan,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         ORDER BY l.id_laporan DESC`
      )

      return rows
    } catch (error) {
      console.log('Error getAllRiwayatLaporanAdmin:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanAdminByPemilikRuangan(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.status,
            i.nama_barang,
            r.id_ruangan,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         WHERE r.id_user = ?
         ORDER BY l.id_laporan DESC`,
        [idUser]
      )

      return rows
    } catch (error) {
      console.log('Error getAllRiwayatLaporanAdminByPemilikRuangan:', error)
      throw error
    }
  }

  static async getDetailLaporan(idLaporan, idUser) {
  try {
    const [rows] = await connection.query(
      `SELECT
          l.id_laporan,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
          l.keterangan,
          l.keterangan_admin,
          l.status,
          l.bukti_foto,
          l.kondisi,
          i.nama_barang,
          i.kode_barang,
          i.merk,
          i.kategori,
          r.nama_ruangan,
          r.kode_ruangan,
          r.lokasi
       FROM laporan l
       LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
       LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
       WHERE l.id_laporan = ? AND l.id_user = ?
       LIMIT 1`,
      [idLaporan, idUser]
    )

    return rows[0] || null
  } catch (error) {
    console.log('Error getDetailLaporan:', error)
    throw error
  }
}

  static async getLaporanKalebById(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT id_laporan, status
         FROM laporan
         WHERE id_laporan = ?
         LIMIT 1`,
        [idLaporan]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error getLaporanKalebById:', error)
      throw error
    }
  }

  static async updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan
         SET status = ?,
             keterangan_admin = ?
         WHERE id_laporan = ?
           AND status != 'selesai'`,
        [status, keteranganAdmin, idLaporan]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateStatusDanKeteranganKaleb:', error)
      throw error
    }
  }

  static async updateStatusDanKeteranganByPemilikRuangan(idLaporan, idUser, status, keteranganAdmin) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan l
         INNER JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         SET l.status = ?,
             l.keterangan_admin = ?
         WHERE l.id_laporan = ?
           AND r.id_user = ?
           AND l.status != 'selesai'`,
        [status, keteranganAdmin, idLaporan, idUser]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateStatusDanKeteranganByPemilikRuangan:', error)
      throw error
    }
  }

  static async getLaporan(search = '', status = '', tanggal = '') {
    try {
      const params = []
      const conditions = []

      if (search) {
        const keyword = `%${search}%`
        conditions.push(`(u.email LIKE ? OR i.nama_barang LIKE ? OR i.kode_barang LIKE ? OR r.nama_ruangan LIKE ? OR l.status LIKE ?)`)
        params.push(keyword, keyword, keyword, keyword, keyword)
      }

      if (status) {
        conditions.push(`l.status = ?`)
        params.push(status)
      }

      if (tanggal) {
        conditions.push(`DATE(l.tanggal) = ?`)
        params.push(tanggal)
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            l.id_user,
            l.id_inventaris,
            l.id_ruangan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            DATE_FORMAT(l.tanggal, '%H:%i') AS jam,
            l.keterangan,
            l.keterangan_admin,
            l.status,
            l.bukti_foto,
            l.kondisi,
            u.email,
            u.role,
            i.nama_barang,
            i.kode_barang,
            i.nup,
            i.merk,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN user u ON l.id_user = u.id_user
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         ${where}
         ORDER BY l.id_laporan DESC`,
        params
      )

      return rows
    } catch (error) {
      console.log('Error getLaporan:', error)
      throw error
    }
  }

  static async getLaporanById(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            l.id_user,
            l.id_inventaris,
            l.id_ruangan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            DATE_FORMAT(l.tanggal, '%H:%i') AS jam,
            l.keterangan,
            l.keterangan_admin,
            l.status,
            l.bukti_foto,
            l.kondisi,
            u.email,
            u.role,
            i.nama_barang,
            i.kode_barang,
            i.nup,
            i.merk,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN user u ON l.id_user = u.id_user
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         WHERE l.id_laporan = ?
         LIMIT 1`,
        [idLaporan]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error getLaporanById:', error)
      throw error
    }
  }

  static async getLaporanByIdForPemilikRuangan(idLaporan, idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
            l.id_laporan,
            l.id_user,
            l.id_inventaris,
            l.id_ruangan,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            DATE_FORMAT(l.tanggal, '%H:%i') AS jam,
            l.keterangan,
            l.keterangan_admin,
            l.status,
            l.bukti_foto,
            l.kondisi,
            u.email,
            u.role,
            i.nama_barang,
            i.kode_barang,
            i.nup,
            i.merk,
            r.nama_ruangan,
            r.kode_ruangan,
            r.lokasi
         FROM laporan l
         LEFT JOIN user u ON l.id_user = u.id_user
         LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
         LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
         WHERE l.id_laporan = ?
           AND r.id_user = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )

      return rows[0] || null
    } catch (error) {
      console.log('Error getLaporanByIdForPemilikRuangan:', error)
      throw error
    }
  }

  static async updateStatusLaporan(idLaporan, status) {
    try {
      const allowedStatus = ['diproses_internal', 'diproses_eksternal', 'ditolak', 'selesai']

      if (!allowedStatus.includes(status)) {
        throw new Error('Status laporan tidak valid')
      }

      await connection.query(
        `UPDATE laporan SET status = ? WHERE id_laporan = ?`,
        [status, idLaporan]
      )
    } catch (error) {
      console.log('Error updateStatusLaporan:', error)
      throw error
    }
  }

  static async updateKeteranganAdmin(idLaporan, keteranganAdmin) {
    try {
      await connection.query(
        `UPDATE laporan SET keterangan_admin = ? WHERE id_laporan = ?`,
        [keteranganAdmin || null, idLaporan]
      )
    } catch (error) {
      console.log('Error updateKeteranganAdmin:', error)
      throw error
    }
  }

  static async getLaporanUntukAI() {
    try {
      const [rows] = await connection.query(`
        SELECT
          l.id_laporan,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
          l.keterangan,
          l.kondisi,
          l.status,
          u.email,
          i.nama_barang,
          i.kode_barang,
          i.merk,
          i.kategori,
          r.id_ruangan,
          r.nama_ruangan,
          r.kode_ruangan,
          r.lokasi
        FROM laporan l
        LEFT JOIN user u ON l.id_user = u.id_user
        LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
        LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan
        ORDER BY l.id_laporan DESC
        LIMIT 100
      `)

      return rows
    } catch (error) {
      console.log('Error getLaporanUntukAI:', error)
      throw error
    }
  }
}

module.exports = Laporan
