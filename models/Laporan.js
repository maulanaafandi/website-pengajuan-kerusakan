const connection = require('../config/db')
const { getWaktuLaporSemester } = require('../middleware/generateWaktuLaporSemester')

class Laporan {
  static get selectFields() {
    return `
      l.id AS id_laporan,
      l.id AS id,
      l.kode_laporan,
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
      l.foto_selesai,
      l.tingkat_kerusakan,
      l.spesifikasi,
      l.harga,
      l.jumlah,
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

  static normalizeTingkatKerusakan(value) {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const allowed = ['ringan', 'sedang', 'berat', 'rusak_total']
    const tingkat = String(value).trim().toLowerCase()

    if (!allowed.includes(tingkat)) {
      throw new Error('Tingkat kerusakan tidak valid')
    }

    return tingkat
  }

  static async getUpdateStatusKaleb() {
    return Laporan.getLaporan()
  }

  static async createLaporan(data) {
    try {
      const [result] = await connection.query(
        `INSERT INTO laporan
        (id_pelapor, id_inventaris, id_ruangan, kategori, deskripsi, bukti_foto, tingkat_kerusakan, kode_laporan, status, foto_selesai, waktu_lapor_semester)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`,
        [
          data.id_pelapor,
          data.id_inventaris || null,
          data.id_ruangan || null,
          data.kategori,
          data.deskripsi,
          data.bukti_foto || null,
          Laporan.normalizeTingkatKerusakan(data.tingkat_kerusakan),
          data.kode_laporan,
          data.waktu_lapor_semester || null
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
          l.id,
          l.kode_laporan,
          CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
          l.status,
          CASE
            WHEN l.kategori = 'barang_baru' THEN 'Pengajuan Barang Baru'
            ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
          END AS nama_barang
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
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

  static addOptionalFields(target, source, keys) {
    keys.forEach((key) => {
      const value = source[key]
      if (value !== null && value !== undefined && value !== '') {
        target[key] = value
      }
    })
    return target
  }

  static formatDetailRiwayat(row) {
    if (!row) return null

    const kategori = row.kategori_laporan
    const optional = ['nama_teknisi', 'keterangan', 'selesai_pada', 'foto_selesai']
    const optionalPengadaan = [...optional, 'spesifikasi', 'jumlah']

    if (kategori === 'kerusakan') {
      const base = {
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        ruangan: row.ruangan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        bukti_foto: row.bukti_foto,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        tingkat_kerusakan: row.tingkat_kerusakan,
        status: row.status,
        prioritas: row.prioritas
      }
      return Laporan.addOptionalFields(base, row, optional)
    }

    if (kategori === 'kehilangan') {
      const base = {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        ruangan: row.ruangan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        kategori_inventaris: row.kategori_inventaris,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        status: row.status,
        prioritas: row.prioritas
      }
      return Laporan.addOptionalFields(base, row, optionalPengadaan)
    }

    if (kategori === 'barang_baru') {
      const base = {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        nama_ruangan: row.nama_ruangan,
        kode_ruangan: row.kode_ruangan,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        status: row.status,
        prioritas: row.prioritas
      }
      return Laporan.addOptionalFields(base, row, optionalPengadaan)
    }

    return row
  }

  static formatDetailRiwayatPlp(row) {
    if (!row) return null

    const kategori = row.kategori_laporan

    if (kategori === 'kerusakan') {
      return {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        ruangan: row.ruangan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        kategori_inventaris: row.kategori_inventaris,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        bukti_foto: row.bukti_foto,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        tingkat_kerusakan: row.tingkat_kerusakan,
        status: row.status,
        prioritas: row.prioritas,
        keterangan: row.keterangan,
        foto_selesai: row.foto_selesai,
        nama_teknisi: row.nama_teknisi,
        selesai_pada: row.selesai_pada
      }
    }

    if (kategori === 'kehilangan') {
      return {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        ruangan: row.ruangan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        kategori_inventaris: row.kategori_inventaris,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        status: row.status,
        prioritas: row.prioritas,
        keterangan: row.keterangan,
        foto_selesai: row.foto_selesai,
        nama_teknisi: row.nama_teknisi,
        selesai_pada: row.selesai_pada
      }
    }

    if (kategori === 'barang_baru') {
      return {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        ruangan: row.ruangan,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        kategori_laporan: row.kategori_laporan,
        status: row.status,
        prioritas: row.prioritas,
        keterangan: row.keterangan,
        foto_selesai: row.foto_selesai,
        nama_teknisi: row.nama_teknisi,
        selesai_pada: row.selesai_pada
      }
    }

    return row
  }

  static getAllowedStatusByKategori(kategori) {
    if (kategori === 'barang_baru') {
      return ['diproses_internal', 'ditolak']
    }
    if (kategori === 'kehilangan') {
      return ['diproses_internal', 'selesai']
    }
    if (kategori === 'kerusakan') {
      return ['diproses_internal', 'diproses_eksternal', 'selesai']
    }
    return ['diproses_internal', 'diproses_eksternal', 'ditolak', 'selesai']
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
        `SELECT
          l.kategori AS kategori_laporan,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          teknisi.nama AS nama_teknisi,
          l.keterangan,
          l.selesai_pada,
          l.foto_selesai,
          l.spesifikasi,
          l.harga,
          l.jumlah
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         WHERE l.id = ? AND l.id_pelapor = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )

      return Laporan.formatDetailRiwayat(rows[0] || null)
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

  static async updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin, teknisiId = null, fotoSelesai = null) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan
         SET status = ?,
             keterangan = ?,
             id_teknisi = IF(? = 'selesai' AND ? IS NOT NULL, ?, id_teknisi),
             selesai_pada = IF(? = 'selesai', COALESCE(selesai_pada, NOW()), selesai_pada),
             foto_selesai = IF(? = 'selesai' AND ? IS NOT NULL, ?, foto_selesai)
         WHERE id = ?
           AND (status IS NULL OR status != 'selesai')`,
        [status, keteranganAdmin, status, teknisiId, teknisiId, status, status, fotoSelesai, fotoSelesai, idLaporan]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateStatusDanKeteranganKaleb:', error)
      throw error
    }
  }

  static async updateStatusDanKeteranganByPemilikRuangan(idLaporan, idUser, status, keteranganAdmin, teknisiId = null, fotoSelesai = null) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         SET l.status = ?,
             l.keterangan = ?,
             l.id_teknisi = IF(? = 'selesai' AND ? IS NOT NULL, ?, l.id_teknisi),
             l.selesai_pada = IF(? = 'selesai', COALESCE(l.selesai_pada, NOW()), l.selesai_pada),
             l.foto_selesai = IF(? = 'selesai' AND ? IS NOT NULL, ?, l.foto_selesai)
         WHERE l.id = ?
           AND r.id_kaleb = ?
           AND (l.status IS NULL OR l.status != 'selesai')`,
        [status, keteranganAdmin, status, teknisiId, teknisiId, status, status, fotoSelesai, fotoSelesai, idLaporan, idUser]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateStatusDanKeteranganByPemilikRuangan:', error)
      throw error
    }
  }

  static formatSemesterLabel(value) {
    const raw = String(value || '').trim()
    const match = /^(\w+)_(\d+\/\d+)$/.exec(raw)
    if (!match) return raw
    const nama = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
    return `${nama} ${match[2]}`
  }

  static resolveSemesterRiwayatPlp(semesterParam) {
    const trimmed = String(semesterParam || '').trim()
    if (trimmed) return trimmed
    return getWaktuLaporSemester(new Date())
  }

  static async getSemesterOptionsRiwayatLaporanPlp() {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND l.status IS NULL
           AND l.prioritas IS NULL
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsRiwayatLaporanPlp:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanPlp(page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.status IS NULL
         AND l.prioritas IS NULL`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan Barang Baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor DESC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllRiwayatLaporanPlp:', error)
      throw error
    }
  }

  static async cariRiwayatLaporanPlp(keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, `%${search}%`]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.status IS NULL
         AND l.prioritas IS NULL
         AND l.kode_laporan LIKE ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan Barang Baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor DESC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariRiwayatLaporanPlp:', error)
      throw error
    }
  }

  static getPengajuanPerbaikanPlpWhereClause(extra = '') {
    const base = `l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (l.status IS NULL OR l.status <> 'diajukan')
         AND l.kategori = 'kerusakan'
         AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')`
    return extra ? `${base} AND ${extra}` : base
  }

  static getPengajuanPerbaikanPlpOrderBy() {
    return `FIELD(l.prioritas,
      'Penting dan Mendesak',
      'Penting tapi Tidak Mendesak',
      'Tidak Penting tapi Mendesak',
      'Tidak Penting dan Tidak Mendesak') ASC, l.waktu_lapor ASC`
  }

  static async getSemesterOptionsPengajuanPerbaikanPlp() {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (l.status IS NULL OR l.status <> 'diajukan')
           AND l.kategori = 'kerusakan'
           AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsPengajuanPerbaikanPlp:', error)
      throw error
    }
  }

  static async getAllPengajuanPerbaikanPlp(page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester]
      const where = `WHERE ${Laporan.getPengajuanPerbaikanPlpWhereClause()}`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                r.nama AS nama_ruangan,
                r.kode_ruangan,
                i.nama_barang,
                i.merk,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}
         ORDER BY ${Laporan.getPengajuanPerbaikanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllPengajuanPerbaikanPlp:', error)
      throw error
    }
  }

  static async cariPengajuanPerbaikanPlp(keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, `%${search}%`]
      const where = `WHERE ${Laporan.getPengajuanPerbaikanPlpWhereClause('l.kode_laporan LIKE ?')}`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                r.nama AS nama_ruangan,
                r.kode_ruangan,
                i.nama_barang,
                i.merk,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}
         ORDER BY ${Laporan.getPengajuanPerbaikanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariPengajuanPerbaikanPlp:', error)
      throw error
    }
  }

  static formatDetailPerbaikanPlp(row) {
    if (!row) return null

    const base = {
      nama_pelapor: row.nama_pelapor,
      nama_lokasi: row.nama_lokasi,
      nama_lantai: row.nama_lantai,
      nama_ruangan: row.nama_ruangan,
      kode_ruangan: row.kode_ruangan,
      kode_barang: row.kode_barang,
      NUP: row.NUP,
      nama_barang: row.nama_barang,
      merk: row.merk,
      tipe: row.tipe,
      kategori_inventaris: row.kategori_inventaris,
      waktu_lapor: row.waktu_lapor,
      waktu_lapor_semester: row.waktu_lapor_semester,
      bukti_foto: row.bukti_foto,
      kode_laporan: row.kode_laporan,
      deskripsi: row.deskripsi,
      kategori_laporan: row.kategori_laporan,
      tingkat_kerusakan: row.tingkat_kerusakan,
      status: row.status,
      prioritas: row.prioritas
    }

    return Laporan.addOptionalFields(base, row, ['nama_teknisi', 'keterangan', 'foto_selesai', 'selesai_pada'])
  }

  static async getLaporanPerbaikanByIdPlp(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          l.keterangan,
          l.foto_selesai,
          l.selesai_pada,
          teknisi.nama AS nama_teknisi
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE l.id = ?
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND l.prioritas IS NOT NULL
           AND (l.status IS NULL OR l.status <> 'diajukan')
           AND l.kategori = 'kerusakan'
           AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
         LIMIT 1`,
        [idLaporan]
      )

      return Laporan.formatDetailPerbaikanPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanPerbaikanByIdPlp:', error)
      throw error
    }
  }

  static getPengajuanPengadaanPlpWhereClause(extra = '') {
    const base = `l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (
           l.kategori IN ('kehilangan', 'barang_baru')
           OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
         )`
    return extra ? `${base} AND ${extra}` : base
  }

  static getPengajuanPengadaanPlpOrderBy() {
    return Laporan.getPengajuanPerbaikanPlpOrderBy()
  }

  static mapPengajuanPengadaanListItem(row) {
    const item = {
      id: row.id,
      kode_laporan: row.kode_laporan,
      nama_pelapor: row.nama_pelapor,
      nama_barang: row.nama_barang,
      ruangan: row.ruangan,
      status: row.status
    }
    if (row.rekomendasi_ai === 1 || row.rekomendasi_ai === true) {
      item.rekomendasi_ai = 1
    }
    return item
  }

  static formatDetailPengadaanPlp(row) {
    if (!row) return null

    const kategori = row.kategori_laporan
    const optionalBase = ['nama_teknisi', 'keterangan', 'selesai_pada', 'foto_selesai']
    const optionalRusakTotal = [...optionalBase, 'spesifikasi', 'harga', 'jumlah']

    if (kategori === 'kehilangan') {
      const base = {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        nama_ruangan: row.nama_ruangan,
        kode_ruangan: row.kode_ruangan,
        nama_kalep: row.nama_kalep,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kode_laporan: row.kode_laporan,
        kategori_laporan: row.kategori_laporan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        kategori_inventaris: row.kategori_inventaris,
        deskripsi: row.deskripsi,
        prioritas: row.prioritas,
        status: row.status
      }
      return Laporan.addOptionalFields(base, row, optionalRusakTotal)
    }

    if (kategori === 'kerusakan' && row.tingkat_kerusakan === 'rusak_total') {
      const base = {
        nama_pelapor: row.nama_pelapor,
        nama_lokasi: row.nama_lokasi,
        nama_lantai: row.nama_lantai,
        nama_ruangan: row.nama_ruangan,
        kode_ruangan: row.kode_ruangan,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kategori_laporan: row.kategori_laporan,
        kode_barang: row.kode_barang,
        NUP: row.NUP,
        nama_barang: row.nama_barang,
        merk: row.merk,
        tipe: row.tipe,
        kategori_inventaris: row.kategori_inventaris,
        tingkat_kerusakan: row.tingkat_kerusakan,
        bukti_foto: row.bukti_foto,
        kode_laporan: row.kode_laporan,
        deskripsi: row.deskripsi,
        status: row.status,
        prioritas: row.prioritas
      }
      return Laporan.addOptionalFields(base, row, optionalRusakTotal)
    }

    if (kategori === 'barang_baru') {
      const base = {
        nama_pelapor: row.nama_pelapor,
        waktu_lapor: row.waktu_lapor,
        waktu_lapor_semester: row.waktu_lapor_semester,
        kategori_laporan: row.kategori_laporan,
        status: row.status,
        prioritas: row.prioritas
      }
      return Laporan.addOptionalFields(base, row, optionalRusakTotal)
    }

    return null
  }

  static async getSemesterOptionsPengajuanPengadaanPlp() {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (
             l.kategori IN ('kehilangan', 'barang_baru')
             OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
           )
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsPengajuanPengadaanPlp:', error)
      throw error
    }
  }

  static async getAllPengajuanPengadaanPlp(page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester]
      const where = `WHERE ${Laporan.getPengajuanPengadaanPlpWhereClause()}`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN NULL
                  ELSE NULLIF(CONCAT_WS(' - ', NULLIF(r.nama, ''), NULLIF(r.kode_ruangan, '-')), '')
                END AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan barang baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}
         ORDER BY ${Laporan.getPengajuanPengadaanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows.map((row) => Laporan.mapPengajuanPengadaanListItem(row)),
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllPengajuanPengadaanPlp:', error)
      throw error
    }
  }

  static async cariPengajuanPengadaanPlp(keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, `%${search}%`]
      const where = `WHERE ${Laporan.getPengajuanPengadaanPlpWhereClause('l.kode_laporan LIKE ?')}`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN NULL
                  ELSE NULLIF(CONCAT_WS(' - ', NULLIF(r.nama, ''), NULLIF(r.kode_ruangan, '-')), '')
                END AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan barang baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         ${where}
         ORDER BY ${Laporan.getPengajuanPengadaanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows.map((row) => Laporan.mapPengajuanPengadaanListItem(row)),
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariPengajuanPengadaanPlp:', error)
      throw error
    }
  }

  static async getLaporanPengadaanByIdPlp(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          kaleb.nama AS nama_kalep,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          teknisi.nama AS nama_teknisi,
          l.keterangan,
          l.selesai_pada,
          l.foto_selesai,
          l.spesifikasi,
          l.harga,
          l.jumlah
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         LEFT JOIN users kaleb ON r.id_kaleb = kaleb.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         WHERE l.id = ?
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (
             l.kategori IN ('kehilangan', 'barang_baru')
             OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
           )
         LIMIT 1`,
        [idLaporan]
      )

      return Laporan.formatDetailPengadaanPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanPengadaanByIdPlp:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanKaleb(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor, i.nama_barang, l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         WHERE r.id_kaleb = ?
         ORDER BY l.id DESC`,
        [idUser]
      )

      return rows
    } catch (error) {
      console.log('Error getAllRiwayatLaporanKaleb:', error)
      throw error
    }
  }

  static async getLaporanByIdKaleb(idLaporan, idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          teknisi.nama AS nama_teknisi,
          l.keterangan,
          l.selesai_pada,
          l.foto_selesai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE l.id = ?
           AND r.id_kaleb = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )

      return Laporan.formatDetailRiwayatPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanByIdKaleb:', error)
      throw error
    }
  }

  static async getSemesterOptionsRiwayatLaporanKaleb(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND l.status IS NULL
           AND l.prioritas IS NULL
           AND r.id_kaleb = ?
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`,
        [idUser]
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsRiwayatLaporanKaleb:', error)
      throw error
    }
  }

  static async getAllRiwayatLaporanKalebPaginated(idUser, page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester, idUser]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.status IS NULL
         AND l.prioritas IS NULL
         AND r.id_kaleb = ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT_WS(' - ', r.nama, r.kode_ruangan) AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan Barang Baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor DESC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllRiwayatLaporanKalebPaginated:', error)
      throw error
    }
  }

  static async cariRiwayatLaporanKaleb(idUser, keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, idUser, `%${search}%`]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.status IS NULL
         AND l.prioritas IS NULL
         AND r.id_kaleb = ?
         AND l.kode_laporan LIKE ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT_WS(' - ', r.nama, r.kode_ruangan) AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan Barang Baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor DESC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariRiwayatLaporanKaleb:', error)
      throw error
    }
  }

  static async getSemesterOptionsPengajuanPerbaikanKaleb(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (l.status IS NULL OR l.status <> 'diajukan')
           AND l.kategori = 'kerusakan'
           AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
           AND r.id_kaleb = ?
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`,
        [idUser]
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsPengajuanPerbaikanKaleb:', error)
      throw error
    }
  }

  static async getAllPengajuanPerbaikanKaleb(idUser, page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester, idUser]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (l.status IS NULL OR l.status <> 'diajukan')
         AND l.kategori = 'kerusakan'
         AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
         AND r.id_kaleb = ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
         params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                r.nama AS nama_ruangan,
                r.kode_ruangan,
                i.nama_barang,
                i.merk,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY ${Laporan.getPengajuanPerbaikanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllPengajuanPerbaikanKaleb:', error)
      throw error
    }
  }

  static async cariPengajuanPerbaikanKaleb(idUser, keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, idUser, `%${search}%`]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (l.status IS NULL OR l.status <> 'diajukan')
         AND l.kategori = 'kerusakan'
         AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
         AND r.id_kaleb = ?
         AND l.kode_laporan LIKE ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
         params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                r.nama AS nama_ruangan,
                r.kode_ruangan,
                i.nama_barang,
                i.merk,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY ${Laporan.getPengajuanPerbaikanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariPengajuanPerbaikanKaleb:', error)
      throw error
    }
  }

  static async getLaporanPerbaikanByIdKaleb(idLaporan, idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          l.keterangan,
          l.foto_selesai,
          l.selesai_pada,
          teknisi.nama AS nama_teknisi
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE l.id = ?
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND l.prioritas IS NOT NULL
           AND (l.status IS NULL OR l.status <> 'diajukan')
           AND l.kategori = 'kerusakan'
           AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
           AND r.id_kaleb = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )

      return Laporan.formatDetailPerbaikanPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanPerbaikanByIdKaleb:', error)
      throw error
    }
  }

  static async getSemesterOptionsPengajuanPengadaanKaleb(idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT l.waktu_lapor_semester AS value, MIN(l.waktu_lapor) AS first_lapor
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.waktu_lapor_semester IS NOT NULL
           AND TRIM(l.waktu_lapor_semester) != ''
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (
             l.kategori IN ('kehilangan', 'barang_baru')
             OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
           )
           AND r.id_kaleb = ?
         GROUP BY l.waktu_lapor_semester
         ORDER BY first_lapor ASC`,
        [idUser]
      )

      return rows.map((row) => ({
        value: row.value,
        label: Laporan.formatSemesterLabel(row.value)
      }))
    } catch (error) {
      console.log('Error getSemesterOptionsPengajuanPengadaanKaleb:', error)
      throw error
    }
  }

  static async getAllPengajuanPengadaanKaleb(idUser, page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester, idUser]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (
           l.kategori IN ('kehilangan', 'barang_baru')
           OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
         )
         AND r.id_kaleb = ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
         params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN NULL
                  ELSE NULLIF(CONCAT_WS(' - ', NULLIF(r.nama, ''), NULLIF(r.kode_ruangan, '-')), '')
                END AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan barang baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY ${Laporan.getPengajuanPengadaanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows.map((row) => Laporan.mapPengajuanPengadaanListItem(row)),
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getAllPengajuanPengadaanKaleb:', error)
      throw error
    }
  }

  static async cariPengajuanPengadaanKaleb(idUser, keyword = '', page = 1, limit = 10, semesterParam) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const search = String(keyword || '').trim()

      if (!search) {
        return {
          result: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      }

      const params = [semester, idUser, `%${search}%`]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
         AND (
           l.kategori IN ('kehilangan', 'barang_baru')
           OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
         )
         AND r.id_kaleb = ?
         AND l.kode_laporan LIKE ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
         params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN NULL
                  ELSE NULLIF(CONCAT_WS(' - ', NULLIF(r.nama, ''), NULLIF(r.kode_ruangan, '-')), '')
                END AS ruangan,
                CASE
                  WHEN l.kategori = 'barang_baru' THEN 'Pengajuan barang baru'
                  ELSE CONCAT_WS(' - ', i.nama_barang, i.merk)
                END AS nama_barang,
                l.status, l.rekomendasi_ai
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY ${Laporan.getPengajuanPengadaanPlpOrderBy()}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows.map((row) => Laporan.mapPengajuanPengadaanListItem(row)),
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error cariPengajuanPengadaanKaleb:', error)
      throw error
    }
  }

  static async getLaporanPengadaanByIdKaleb(idLaporan, idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          r.nama AS nama_ruangan,
          r.kode_ruangan,
          kaleb.nama AS nama_kalep,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          teknisi.nama AS nama_teknisi,
          l.keterangan,
          l.selesai_pada,
          l.foto_selesai,
          l.spesifikasi,
          l.harga,
          l.jumlah
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         LEFT JOIN users kaleb ON r.id_kaleb = kaleb.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         WHERE l.id = ?
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (
             l.kategori IN ('kehilangan', 'barang_baru')
             OR (l.kategori = 'kerusakan' AND (l.tingkat_kerusakan = 'rusak_total' OR l.tingkat_kerusakan IS NULL))
           )
           AND r.id_kaleb = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )

      return Laporan.formatDetailPengadaanPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanPengadaanByIdKaleb:', error)
      throw error
    }
  }

  static async updatePengajuanPengadaanKaleb(idLaporan, idUser, data = {}, options = {}) {
    try {
      const { teknisiId = null, fotoSelesai = null } = options
      const sets = []
      const params = []

      const [laporanRows] = await connection.query(
        `SELECT l.kategori, l.status, l.tingkat_kerusakan, l.jumlah
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.id = ? AND r.id_kaleb = ?
           AND l.status IS NOT NULL
           AND l.prioritas IS NOT NULL
           AND (
             l.kategori IN ('kehilangan', 'barang_baru')
             OR (l.kategori = 'kerusakan' AND l.tingkat_kerusakan = 'rusak_total')
           )
         LIMIT 1`,
        [idLaporan, idUser]
      )
      if (!laporanRows.length) return 0

      const status = data.status === null ? null : String(data.status).trim()

      if (status !== 'ditolak' && status !== 'diajukan' && status !== 'selesai') {
        throw new Error('Status tidak valid')
      }

      sets.push('status = ?')
      params.push(status)

      if (status === 'ditolak') {
        if (data.keterangan === undefined || String(data.keterangan).trim() === '') {
          throw new Error('Keterangan diperlukan.')
        }
        sets.push('keterangan = ?')
        params.push(String(data.keterangan).trim())
        sets.push('id_teknisi = ?')
        params.push(teknisiId || idUser)
        sets.push('selesai_pada = NOW()')
      } else if (status === 'diajukan') {
        if (data.spesifikasi === undefined || String(data.spesifikasi).trim() === '') {
          throw new Error('Spesifikasi diperlukan.')
        }
        if (data.harga === undefined || data.harga === null || String(data.harga).trim() === '') {
          throw new Error('Harga diperlukan.')
        }
        if (data.jumlah === undefined || data.jumlah === null || String(data.jumlah).trim() === '') {
          throw new Error('Jumlah diperlukan.')
        }

        sets.push('spesifikasi = ?')
        params.push(String(data.spesifikasi).trim())
        sets.push('harga = ?')
        params.push(parseFloat(data.harga) || 0)
        sets.push('jumlah = ?')
        params.push(parseInt(data.jumlah, 10) || 0)
      } else if (status === 'selesai') {
        if (data.keterangan === undefined || String(data.keterangan).trim() === '') {
          throw new Error('Keterangan diperlukan.')
        }
        if (!fotoSelesai) {
          throw new Error('Foto selesai diperlukan.')
        }

        sets.push('keterangan = ?')
        params.push(String(data.keterangan).trim())
        sets.push('foto_selesai = ?')
        params.push(fotoSelesai)
        sets.push('id_teknisi = ?')
        params.push(teknisiId || idUser)
        sets.push('selesai_pada = NOW()')
      }

      params.push(idLaporan)
      const [result] = await connection.query(
        `UPDATE laporan SET ${sets.join(', ')} WHERE id = ?`,
        params
      )
      return result.affectedRows
    } catch (error) {
      console.log('Error updatePengajuanPengadaanKaleb:', error)
      throw error
    }
  }

  static async updateLaporanByKaleb(idLaporan, idUser, data = {}, options = {}) {
    try {
      const { teknisiId = null, fotoSelesai = null } = options
      const allowedPrioritas = [
        'Penting dan Mendesak',
        'Penting tapi Tidak Mendesak',
        'Tidak Penting tapi Mendesak',
        'Tidak Penting dan Tidak Mendesak'
      ]
      const sets = []
      const params = []

      const [laporanRows] = await connection.query(
        `SELECT l.kategori FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.id = ? AND r.id_kaleb = ? LIMIT 1`,
        [idLaporan, idUser]
      )
      if (!laporanRows.length) return 0

      const kategori = laporanRows[0].kategori
      const allowedStatus = Laporan.getAllowedStatusByKategori(kategori)

      if (data.tingkat_kerusakan !== undefined) {
        sets.push('tingkat_kerusakan = ?')
        params.push(Laporan.normalizeTingkatKerusakan(data.tingkat_kerusakan))
      }

      let nextStatus = null
      if (data.status !== undefined) {
        nextStatus = data.status === null ? null : String(data.status).trim()
        if (nextStatus !== null && !allowedStatus.includes(nextStatus)) {
          throw new Error('Status tidak valid')
        }
        sets.push('status = ?')
        params.push(nextStatus)
      }

      if (data.prioritas !== undefined) {
        const prioritas = data.prioritas === null ? null : String(data.prioritas).trim()
        if (prioritas !== null && !allowedPrioritas.includes(prioritas)) {
          throw new Error('Prioritas tidak valid')
        }
        sets.push('prioritas = ?')
        params.push(prioritas)
      }

      if (nextStatus === 'selesai' || nextStatus === 'ditolak') {
        if (data.keterangan !== undefined) {
          sets.push('keterangan = ?')
          params.push(String(data.keterangan).trim())
        }
        if (teknisiId) {
          sets.push('id_teknisi = ?')
          params.push(teknisiId)
        }
        sets.push('selesai_pada = COALESCE(selesai_pada, NOW())')
        if (nextStatus === 'selesai' && fotoSelesai) {
          sets.push('foto_selesai = ?')
          params.push(fotoSelesai)
        }
      }

      if (!sets.length) {
        throw new Error('Minimal satu field diperlukan')
      }

      params.push(idLaporan)

      const [result] = await connection.query(
        `UPDATE laporan SET ${sets.join(', ')} WHERE id = ?`,
        params
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateLaporanByKaleb:', error)
      throw error
    }
  }

  static async getLaporanUntukRekomendasiAiKaleb(idUser, limit = 30) {
    try {
      const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 30
      const [rows] = await connection.query(
        `SELECT
          l.id,
          l.waktu_lapor AS waktu_laporan,
          l.kategori AS kategori_laporan,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.kondisi,
          l.deskripsi,
          l.kode_laporan
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON i.id_ruangan = r.id
         WHERE r.id_kaleb = ?
           AND l.status IS NULL
           AND l.prioritas IS NULL
         ORDER BY l.id DESC
         LIMIT ${safeLimit}`,
        [idUser]
      )

      return rows
    } catch (error) {
      console.log('Error getLaporanUntukRekomendasiAiKaleb:', error)
      throw error
    }
  }

  static async applyRekomendasiAiPrioritas(idLaporan, idUser, prioritas) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan l
         INNER JOIN inventaris i ON l.id_inventaris = i.id
         INNER JOIN ruangan r ON i.id_ruangan = r.id
         SET l.prioritas = ?,
             l.rekomendasi_ai = 1
         WHERE l.id = ?
           AND r.id_kaleb = ?`,
        [prioritas, idLaporan, idUser]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error applyRekomendasiAiPrioritas:', error)
      throw error
    }
  }

  static async updateStatusDanKeteranganByPlp(idLaporan, status, keteranganAdmin, teknisiId = null, fotoSelesai = null) {
    return Laporan.updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin, teknisiId, fotoSelesai)
  }

  static async selesaiPengajuanPerbaikanByPlp(idLaporan, keterangan, teknisiId, fotoSelesai) {
    try {
      const [result] = await connection.query(
        `UPDATE laporan l
         SET l.status = 'selesai',
             l.keterangan = ?,
             l.id_teknisi = ?,
             l.selesai_pada = COALESCE(l.selesai_pada, NOW()),
             l.foto_selesai = ?
         WHERE l.id = ?
           AND l.kategori = 'kerusakan'
           AND l.prioritas IS NOT NULL
           AND (l.status IS NOT NULL OR l.prioritas IS NOT NULL)
           AND (l.status IS NULL OR l.status <> 'diajukan')
           AND (l.tingkat_kerusakan IS NULL OR l.tingkat_kerusakan <> 'rusak_total')
           AND (l.status IS NULL OR l.status <> 'selesai')`,
        [keterangan, teknisiId, fotoSelesai, idLaporan]
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error selesaiPengajuanPerbaikanByPlp:', error)
      throw error
    }
  }

  static async getLaporanByIdPlp(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.kategori AS kategori_laporan,
          u.nama AS nama_pelapor,
          lok.nama AS nama_lokasi,
          lan.nama AS nama_lantai,
          CONCAT(r.nama, ' - ', r.kode_ruangan) AS ruangan,
          l.waktu_lapor,
          l.waktu_lapor_semester,
          l.kode_laporan,
          i.kode_barang,
          i.NUP,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          l.tingkat_kerusakan,
          l.bukti_foto,
          l.deskripsi,
          l.prioritas,
          l.status,
          l.keterangan,
          l.foto_selesai,
          l.selesai_pada,
          teknisi.nama AS nama_teknisi
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN users teknisi ON l.id_teknisi = teknisi.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         LEFT JOIN lokasi lok ON r.id_lokasi = lok.id
         LEFT JOIN lantai lan ON r.id_lantai = lan.id
         WHERE l.id = ?
         LIMIT 1`,
        [idLaporan]
      )

      return Laporan.formatDetailRiwayatPlp(rows[0] || null)
    } catch (error) {
      console.log('Error getLaporanByIdPlp:', error)
      throw error
    }
  }

  static async updateLaporanByPlp(idLaporan, data = {}, options = {}) {
    try {
      const { teknisiId = null, fotoSelesai = null } = options
      const allowedPrioritas = [
        'Penting dan Mendesak',
        'Penting tapi Tidak Mendesak',
        'Tidak Penting tapi Mendesak',
        'Tidak Penting dan Tidak Mendesak'
      ]
      const sets = []
      const params = []

      const [laporanRows] = await connection.query(
        'SELECT kategori FROM laporan WHERE id = ? LIMIT 1',
        [idLaporan]
      )
      if (!laporanRows.length) return 0

      const kategori = laporanRows[0].kategori
      const allowedStatus = Laporan.getAllowedStatusByKategori(kategori)

      if (data.tingkat_kerusakan !== undefined) {
        sets.push('tingkat_kerusakan = ?')
        params.push(Laporan.normalizeTingkatKerusakan(data.tingkat_kerusakan))
      }

      let nextStatus = null
      if (data.status !== undefined) {
        nextStatus = data.status === null ? null : String(data.status).trim()
        if (nextStatus !== null && !allowedStatus.includes(nextStatus)) {
          throw new Error('Status tidak valid')
        }
        sets.push('status = ?')
        params.push(nextStatus)
      }

      if (data.prioritas !== undefined) {
        const prioritas = data.prioritas === null ? null : String(data.prioritas).trim()
        if (prioritas !== null && !allowedPrioritas.includes(prioritas)) {
          throw new Error('Prioritas tidak valid')
        }
        sets.push('prioritas = ?')
        params.push(prioritas)
      }

      if (nextStatus === 'selesai' || nextStatus === 'ditolak') {
        if (data.keterangan !== undefined) {
          sets.push('keterangan = ?')
          params.push(String(data.keterangan).trim())
        }
        if (teknisiId) {
          sets.push('id_teknisi = ?')
          params.push(teknisiId)
        }
        sets.push('selesai_pada = COALESCE(selesai_pada, NOW())')
        if (nextStatus === 'selesai' && fotoSelesai) {
          sets.push('foto_selesai = ?')
          params.push(fotoSelesai)
        }
      }

      if (!sets.length) {
        throw new Error('Minimal satu field diperlukan')
      }

      params.push(idLaporan)

      const [result] = await connection.query(
        `UPDATE laporan SET ${sets.join(', ')} WHERE id = ?`,
        params
      )

      return result.affectedRows
    } catch (error) {
      console.log('Error updateLaporanByPlp:', error)
      throw error
    }
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

  static async getAllAuditLaporan(search = '') {
    try {
      const params = []
      let where = ''

      if (search) {
        const keyword = `%${search}%`
        where = `WHERE l.kode_laporan LIKE ?
          OR u.nama LIKE ?
          OR u.email LIKE ?`
        params.push(keyword, keyword, keyword)
      }

      const [rows] = await connection.query(
        `SELECT
          a.id_laporan,
          l.kode_laporan,
          u.nama AS nama_pelapor,
          u.email AS email_pelapor,
          DATE_FORMAT(MAX(a.waktu), '%Y-%m-%d %H:%i:%s') AS waktu_terakhir,
          COUNT(a.id) AS total_audit
         FROM audit_laporan a
         LEFT JOIN laporan l ON a.id_laporan = l.id
         LEFT JOIN users u ON l.id_pelapor = u.id
         ${where}
         GROUP BY a.id_laporan, l.kode_laporan, u.nama, u.email
         ORDER BY MAX(a.waktu) DESC, a.id_laporan DESC`,
        params
      )

      return rows
    } catch (error) {
      console.log('Error getAllAuditLaporan:', error)
      throw error
    }
  }

  static async getAuditLaporanDetail(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          a.id,
          a.id_laporan,
          a.action,
          a.data_lama,
          a.data_baru,
          DATE_FORMAT(a.waktu, '%Y-%m-%d %H:%i:%s') AS waktu,
          l.kode_laporan,
          u.nama AS nama_pelapor,
          u.email AS email_pelapor
         FROM audit_laporan a
         LEFT JOIN laporan l ON a.id_laporan = l.id
         LEFT JOIN users u ON l.id_pelapor = u.id
         WHERE a.id_laporan = ?
         ORDER BY a.waktu DESC, a.id DESC`,
        [idLaporan]
      )

      return rows
    } catch (error) {
      console.log('Error getAuditLaporanDetail:', error)
      throw error
    }
  }

  static async getLaporanUntukTriaseAi(semesterParam, limit = 50) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 50
      const [rows] = await connection.query(
        `SELECT
          l.id,
          l.kode_laporan,
          l.waktu_lapor,
          l.kategori,
          l.deskripsi,
          l.tingkat_kerusakan,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          i.tanggal_perolehan,
          r.nama AS nama_ruangan,
          r.kode_ruangan
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.waktu_lapor_semester = ?
           AND l.status IS NULL
           AND l.prioritas IS NULL
         ORDER BY l.waktu_lapor ASC
         LIMIT ${safeLimit}`,
        [semester]
      )
      return rows
    } catch (error) {
      console.log('Error getLaporanUntukTriaseAi:', error)
      throw error
    }
  }

  static async getLaporanUntukTriaseAiKaleb(idUser, semesterParam, limit = 50) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 50
      const [rows] = await connection.query(
        `SELECT
          l.id,
          l.kode_laporan,
          l.waktu_lapor,
          l.kategori,
          l.deskripsi,
          l.tingkat_kerusakan,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.kategori AS kategori_inventaris,
          i.tanggal_perolehan,
          r.nama AS nama_ruangan,
          r.kode_ruangan
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.waktu_lapor_semester = ?
           AND l.status IS NULL
           AND l.prioritas IS NULL
           AND r.id_kaleb = ?
         ORDER BY l.waktu_lapor ASC
         LIMIT ${safeLimit}`,
        [semester, idUser]
      )
      return rows
    } catch (error) {
      console.log('Error getLaporanUntukTriaseAiKaleb:', error)
      throw error
    }
  }


  static async getKehilanganPendingUntukPengadaan(semesterParam, page = 1, limit = 10) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.kategori = 'kehilangan'
         AND l.waktu_lapor <= DATE_SUB(NOW(), INTERVAL 2 MONTH)
         AND (l.status IS NULL OR l.status NOT IN ('selesai', 'ditolak'))`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT_WS(' - ', i.nama_barang, i.merk) AS nama_barang,
                CONCAT_WS(' - ', r.nama, r.kode_ruangan) AS ruangan,
                l.waktu_lapor,
                DATEDIFF(NOW(), l.waktu_lapor) AS hari_sejak_lapor,
                l.status, l.prioritas
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor ASC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getKehilanganPendingUntukPengadaan:', error)
      throw error
    }
  }

  static async getKehilanganPendingUntukPengadaanKaleb(idUser, semesterParam, page = 1, limit = 10) {
    try {
      const semester = Laporan.resolveSemesterRiwayatPlp(semesterParam)
      const safePage = Math.max(1, parseInt(page, 10) || 1)
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10))
      const offset = (safePage - 1) * safeLimit
      const params = [semester, idUser]
      const where = `WHERE l.waktu_lapor_semester = ?
         AND l.kategori = 'kehilangan'
         AND l.waktu_lapor <= DATE_SUB(NOW(), INTERVAL 2 MONTH)
         AND (l.status IS NULL OR l.status NOT IN ('selesai', 'ditolak'))
         AND r.id_kaleb = ?`

      const [countRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}`,
        params
      )

      const totalItems = Number(countRows[0]?.total || 0)
      const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit))

      const [rows] = await connection.query(
        `SELECT l.id, l.kode_laporan, u.nama AS nama_pelapor,
                CONCAT_WS(' - ', i.nama_barang, i.merk) AS nama_barang,
                CONCAT_WS(' - ', r.nama, r.kode_ruangan) AS ruangan,
                l.waktu_lapor,
                DATEDIFF(NOW(), l.waktu_lapor) AS hari_sejak_lapor,
                l.status, l.prioritas
         FROM laporan l
         LEFT JOIN users u ON l.id_pelapor = u.id
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         ${where}
         ORDER BY l.waktu_lapor ASC
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
      )

      return {
        result: rows,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalItems,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      }
    } catch (error) {
      console.log('Error getKehilanganPendingUntukPengadaanKaleb:', error)
      throw error
    }
  }

  static async getKonteksLabUntukPengadaan(idRuangan) {
    try {
      const [ruanganRows] = await connection.query(
        `SELECT r.id, r.nama AS nama_ruangan, r.kode_ruangan
         FROM ruangan r
         WHERE r.id = ?
         LIMIT 1`,
        [idRuangan]
      )

      const ruangan = ruanganRows[0] || {}

      const [inventarisRows] = await connection.query(
        `SELECT nama_barang, merk, COUNT(*) AS jumlah
         FROM inventaris
         WHERE id_ruangan = ?
         GROUP BY nama_barang, merk
         ORDER BY nama_barang ASC`,
        [idRuangan]
      )

      const [totalRows] = await connection.query(
        `SELECT COUNT(*) AS total FROM inventaris WHERE id_ruangan = ?`,
        [idRuangan]
      )

      return {
        nama_ruangan: ruangan.nama_ruangan || null,
        kode_ruangan: ruangan.kode_ruangan || null,
        total_inventaris: Number(totalRows[0]?.total || 0),
        daftar_barang: inventarisRows
      }
    } catch (error) {
      console.log('Error getKonteksLabUntukPengadaan:', error)
      throw error
    }
  }

  static async getLaporanPengadaanByIdUntukAi(idLaporan) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.id,
          l.kode_laporan,
          l.kategori AS kategori_laporan,
          l.deskripsi,
          l.tingkat_kerusakan,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.id_ruangan,
          r.nama AS nama_ruangan,
          r.kode_ruangan
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.id = ?
         LIMIT 1`,
        [idLaporan]
      )
      return rows[0] || null
    } catch (error) {
      console.log('Error getLaporanPengadaanByIdUntukAi:', error)
      throw error
    }
  }

  static async getLaporanPengadaanByIdUntukAiKaleb(idLaporan, idUser) {
    try {
      const [rows] = await connection.query(
        `SELECT
          l.id,
          l.kode_laporan,
          l.kategori AS kategori_laporan,
          l.deskripsi,
          l.tingkat_kerusakan,
          i.nama_barang,
          i.merk,
          i.tipe,
          i.id_ruangan,
          r.nama AS nama_ruangan,
          r.kode_ruangan
         FROM laporan l
         LEFT JOIN inventaris i ON l.id_inventaris = i.id
         LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
         WHERE l.id = ?
           AND r.id_kaleb = ?
         LIMIT 1`,
        [idLaporan, idUser]
      )
      return rows[0] || null
    } catch (error) {
      console.log('Error getLaporanPengadaanByIdUntukAiKaleb:', error)
      throw error
    }
  }
}

module.exports = Laporan
