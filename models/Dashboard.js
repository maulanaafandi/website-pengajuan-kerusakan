const connection = require('../config/db')

class Dashboard {
  static async countUsers() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM user WHERE role != ?`, ['admin'])
    return row.total || 0
  }

  static async countInventaris() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM inventaris`)
    return row.total || 0
  }

  static async countRuangan() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM ruangan`)
    return row.total || 0
  }

  static async countRekomendasi() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM rekomendasi_pengajuan_barang`)
    return row.total || 0
  }

  static async countLaporan() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM laporan`)
    return row.total || 0
  }

  static async countLaporanSelesai() {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM laporan WHERE status = ?`, ['selesai'])
    return row.total || 0
  }

  static async getGrafikLaporanBulanan() {
    const [rows] = await connection.query(`
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

    return rows || []
  }
}

module.exports = Dashboard
