const connection = require('../config/db')
const bcrypt = require('bcryptjs')

class Admin {
  static async dashboardStats() {
    const [[userStats]] = await connection.query(`SELECT COUNT(*) AS totalUser FROM user WHERE role != ?`, ['admin'])
    const [[inventarisStats]] = await connection.query(`SELECT COUNT(*) AS totalInventaris FROM inventaris`)
    const [[ruanganStats]] = await connection.query(`SELECT COUNT(*) AS totalRuangan FROM ruangan`)
    const [[rekomendasiStats]] = await connection.query(`SELECT COUNT(*) AS totalRekomendasi FROM rekomendasi_pengajuan_barang`)
    const [[laporanStats]] = await connection.query(`SELECT COUNT(*) AS totalLaporan FROM laporan`)
    const [[laporanSelesaiStats]] = await connection.query(`SELECT COUNT(*) AS totalLaporanSelesai FROM laporan WHERE status = ?`, ['selesai'])
    const [grafikLaporanBulanan] = await connection.query(`
      SELECT
        DATE_FORMAT(tanggal, '%Y-%m') AS bulan_key,
        CASE MONTH(tanggal)
          WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar' WHEN 4 THEN 'Apr'
          WHEN 5 THEN 'Mei' WHEN 6 THEN 'Jun' WHEN 7 THEN 'Jul' WHEN 8 THEN 'Agu'
          WHEN 9 THEN 'Sep' WHEN 10 THEN 'Okt' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Des'
        END AS bulan,
        COUNT(*) AS total
      FROM laporan
      WHERE tanggal IS NOT NULL
      GROUP BY DATE_FORMAT(tanggal, '%Y-%m'), MONTH(tanggal)
      ORDER BY bulan_key ASC
    `)

    return {
      totalUser: userStats.totalUser || 0,
      totalInventaris: inventarisStats.totalInventaris || 0,
      totalRuangan: ruanganStats.totalRuangan || 0,
      totalRekomendasi: rekomendasiStats.totalRekomendasi || 0,
      totalLaporan: laporanStats.totalLaporan || 0,
      totalLaporanSelesai: laporanSelesaiStats.totalLaporanSelesai || 0,
      grafikLaporanBulanan: grafikLaporanBulanan || []
    }
  }

  static async getUsers(search = '') {
    if (search) {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT id_user, email, role, kaleb FROM user
         WHERE email LIKE ? OR role LIKE ? OR kaleb LIKE ?
         ORDER BY id_user DESC`,
        [keyword, keyword, keyword]
      )
      return rows
    }

    const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user ORDER BY id_user DESC`)
    return rows
  }

  static async getUserById(idUser) {
    const [rows] = await connection.query(`SELECT id_user, email, role, kaleb FROM user WHERE id_user = ?`, [idUser])
    return rows[0]
  }

  static async findUserByEmail(email) {
    const [rows] = await connection.query(`SELECT id_user FROM user WHERE email = ?`, [email])
    return rows[0]
  }

  static async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password || 'user123', 10)
    await connection.query(
      `INSERT INTO user (email, password, role, kaleb) VALUES (?, ?, ?, ?)`,
      [data.email, hashedPassword, data.role, data.kaleb || '0']
    )
  }

  static async updateUser(idUser, data) {
    await connection.query(
      `UPDATE user SET email = ?, role = ?, kaleb = ? WHERE id_user = ?`,
      [data.email, data.role, data.kaleb || '0', idUser]
    )
  }

  static async deleteUser(idUser) {
    await connection.query(`DELETE FROM user WHERE id_user = ? AND role != ?`, [idUser, 'admin'])
  }

  static async getInventaris(search = '') {
    if (search) {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT * FROM inventaris
         WHERE kode_barang LIKE ? OR nup LIKE ? OR nama_barang LIKE ? OR merk LIKE ? OR tipe LIKE ? OR kategori LIKE ?
         ORDER BY id_inventaris DESC`,
        [keyword, keyword, keyword, keyword, keyword, keyword]
      )
      return rows
    }

    const [rows] = await connection.query(`SELECT * FROM inventaris ORDER BY id_inventaris DESC`)
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

  static async getRuangan(search = '') {
    if (search) {
      const keyword = `%${search}%`
      const [rows] = await connection.query(
        `SELECT * FROM ruangan
         WHERE nama_ruangan LIKE ? OR kode_ruangan LIKE ? OR lokasi LIKE ?
         ORDER BY id_ruangan DESC`,
        [keyword, keyword, keyword]
      )
      return rows
    }

    const [rows] = await connection.query(`SELECT * FROM ruangan ORDER BY id_ruangan DESC`)
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


  static async getLaporan(search = '', status = '', tanggal = '') {
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
  }

  static async getLaporanById(idLaporan) {
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
  }

  static async updateStatusLaporan(idLaporan, status) {
    const allowedStatus = ['diproses', 'ditolak', 'selesai']

    if (!allowedStatus.includes(status)) {
      throw new Error('Status laporan tidak valid')
    }

    await connection.query(
      `UPDATE laporan SET status = ? WHERE id_laporan = ?`,
      [status, idLaporan]
    )
  }

  static async updateKeteranganAdmin(idLaporan, keteranganAdmin) {
    await connection.query(
      `UPDATE laporan SET keterangan_admin = ? WHERE id_laporan = ?`,
      [keteranganAdmin || null, idLaporan]
    )
  }

  static async getDataUntukAI() {
    const [laporan] = await connection.query(`
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

    const [inventaris] = await connection.query(`
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
    `).catch(async () => {
      const [fallback] = await connection.query(`
        SELECT
          id_inventaris, kode_barang, nup, nama_barang, merk, tipe, kategori,
          NULL AS id_ruangan, NULL AS nama_ruangan, NULL AS kode_ruangan, NULL AS lokasi
        FROM inventaris
        GROUP BY kode_barang, nama_barang, merk, tipe, kategori
        ORDER BY nama_barang ASC
        LIMIT 200
      `)
      return [fallback]
    })

    const [ruangan] = await connection.query(`SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi FROM ruangan ORDER BY nama_ruangan ASC`)

    return { laporan, inventaris, ruangan }
  }

  static async simpanRekomendasiAI(list = []) {
    for (const item of list) {
      await connection.query(
        `INSERT INTO rekomendasi_pengajuan_barang
         (id_ruangan, barang_rekomendasi_diajukan, tanggal, nama_barang, alasan)
         VALUES (?, ?, CURDATE(), ?, ?)`,
        [
          item.id_ruangan || null,
          item.barang_rekomendasi_diajukan || item.nama_barang || '-',
          item.nama_barang || item.barang_rekomendasi_diajukan || '-',
          item.alasan || '-'
        ]
      )
    }
  }

  static async getRekomendasi(search = '') {
    if (search) {
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
}

module.exports = Admin
