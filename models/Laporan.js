const connection = require('../config/db')

class Laporan {
  static get selectFields() {
    return `
      l.id AS id_laporan,
      l.id AS id,
      l.id_pelapor AS id_user,
      l.id_pelapor,
      l.id_inventaris,
      i.id_ruangan,
      l.id_teknisi,
      DATE_FORMAT(l.waktu_lapor, '%Y-%m-%d') AS tanggal,
      DATE_FORMAT(l.waktu_lapor, '%H:%i') AS jam,
      l.waktu_lapor,
      l.kategori,
      l.deskripsi AS keterangan,
      l.deskripsi,
      l.keterangan AS keterangan_admin,
      l.keterangan AS catatan_laporan,
      l.status,
      l.prioritas,
      l.bukti_foto,
      l.kondisi,
      l.selesai_pada,
      l.rekomendasi_ai,
      u.nama AS nama_pelapor,
      u.email,
      u.role,
      teknisi.nama AS nama_teknisi,
      teknisi.email AS email_teknisi,
      i.nama_barang,
      i.kode_barang,
      i.NUP AS nup,
      i.merk,
      i.tipe,
      i.kategori AS kategori_barang,
      r.nama AS nama_ruangan,
      r.kode_ruangan,
      lok.nama AS lokasi,
      lan.nama AS lantai
    `
  }

  static get joins() {
    return `
      LEFT JOIN users u ON l.id_pelapor = u.id
      LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
      LEFT JOIN inventaris i ON l.id_inventaris = i.id
      LEFT JOIN ruangan r ON i.id_ruangan = r.id
      LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
      LEFT JOIN lantai lan ON r.id_lantai = lan.id
    `
  }

  static normalizeKondisi(value) {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const kondisi = Number(String(value).replace(',', '.'))

    if (Number.isNaN(kondisi)) {
      throw new Error('Kondisi harus berupa angka')
    }

    if (kondisi < 0 || kondisi > 100) {
      throw new Error('Kondisi harus di antara 0 sampai 100')
    }

    return kondisi.toFixed(2)
  }

  static async getUpdateStatusKaleb() {
    return Laporan.getLaporan()
  }

  static async createLaporan(data) {
    try {
      const [result] = await connection.query(
        `INSERT INTO laporan
        (id_pelapor, id_inventaris, kategori, deskripsi, status, bukti_foto, kondisi)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id_pelapor || data.id_user,
          data.id_inventaris,
          data.kategori || 'kerusakan',
          data.deskripsi || data.keterangan,
          data.status || 'pending',
          data.bukti_foto || null,
          Laporan.normalizeKondisi(data.kondisi)
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
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         WHERE l.id_pelapor = ?
         ORDER BY l.id DESC`,
        [idUser]
      )

      return rows
    } catch (error) {
      console.log('Error getRiwayatLaporan:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanAdmin() {
    return Laporan.getLaporan()
  }

  static async getAllRiwayatLaporanAdminByPemilikRuangan(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         WHERE r.id_kaleb = ?
         ORDER BY l.id DESC`,
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
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         WHERE l.id = ? AND l.id_pelapor = ?
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
        `SELECT id AS id_laporan, status
         FROM laporan
         WHERE id = ?
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
             keterangan = ?,
             selesai_pada = IF(? = 'selesai', COALESCE(selesai_pada, NOW()), selesai_pada)
         WHERE id = ?
           AND status != 'selesai'`,
        [status, keteranganAdmin, status, idLaporan]
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
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         SET l.status = ?,
             l.keterangan = ?,
             l.selesai_pada = IF(? = 'selesai', COALESCE(l.selesai_pada, NOW()), l.selesai_pada)
         WHERE l.id = ?
           AND r.id_kaleb = ?
           AND l.status != 'selesai'`,
        [status, keteranganAdmin, status, idLaporan, idUser]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateStatusDanKeteranganByPemilikRuangan:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanPlp() {
    return Laporan.getLaporan()
  }

  static async updateStatusDanKeteranganByPlp(idLaporan, status, keteranganAdmin) {
    return Laporan.updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin)
  }

  static async getLaporanByIdPlp(idLaporan) {
    return Laporan.getLaporanById(idLaporan)
  }

  static async updatePrioritasByPemilikRuangan(idLaporan, idUser, prioritas) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         SET l.prioritas = ?
         WHERE l.id = ?
           AND r.id_kaleb = ?`,
        [prioritas, idLaporan, idUser]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updatePrioritasByPemilikRuangan:', error)
      throw error
    }
  }

  static async getLaporan(search = '', status = '', tanggal = '') {
    try {
      const params = []
      const conditions = []

      if (search) {
        const keyword = `%${search}%`
        conditions.push(`(u.nama LIKE ? OR u.email LIKE ? OR i.nama_barang LIKE ? OR i.kode_barang LIKE ? OR r.nama LIKE ? OR lok.nama LIKE ? OR l.status LIKE ?)`)
        params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword)
      }

      if (status) {
        conditions.push(`l.status = ?`)
        params.push(status)
      }

      if (tanggal) {
        conditions.push(`DATE(l.waktu_lapor) = ?`)
        params.push(tanggal)
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

      const [rows] = await connection.query(
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         ${where}
         ORDER BY l.id DESC`,
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
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         WHERE l.id = ?
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
        `SELECT ${Laporan.selectFields}
         FROM laporan l
         ${Laporan.joins}
         WHERE l.id = ?
           AND r.id_kaleb = ?
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
      const allowedStatus = ['diproses_internal', 'diproses_eksternal', 'pending', 'ditolak', 'selesai']

      if (!allowedStatus.includes(status)) {
        throw new Error('Status laporan tidak valid')
      }

      await connection.query(
        `UPDATE laporan
         SET status = ?,
             selesai_pada = IF(? = 'selesai', COALESCE(selesai_pada, NOW()), selesai_pada)
         WHERE id = ?`,
        [status, status, idLaporan]
      )
    } catch (error) {
      console.log('Error updateStatusLaporan:', error)
      throw error
    }
  }

  static async updateKeteranganAdmin(idLaporan, keteranganAdmin) {
    try {
      await connection.query(
        `UPDATE laporan SET keterangan = ? WHERE id = ?`,
        [keteranganAdmin || null, idLaporan]
      )
    } catch (error) {
      console.log('Error updateKeteranganAdmin:', error)
      throw error
    }
  }

  static async getLaporanUntukAI() {
    return Laporan.getLaporan()
  }

  static async getAuditLaporan(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT id, id_laporan, action, data_lama, data_baru, DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s') AS waktu
         FROM audit_laporan
         WHERE id_laporan = ?
         ORDER BY waktu DESC, id DESC`,
        [idLaporan]
      )

      return rows
    } catch (error) {
      console.log('Error getAuditLaporan:', error)
      throw error
    }
  }
}

module.exports = Laporan
