const connection = require('../config/db')

class Dashboard {
  static async countUsers() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM user WHERE role != ?`, ['admin'])
      return row.total || 0
    } catch (error) {
      console.log('Error countUsers:', error)
      throw error
    }
  }

  static async countInventaris() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM inventaris`)
      return row.total || 0
    } catch (error) {
      console.log('Error countInventaris:', error)
      throw error
    }
  }

  static async countRuangan() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM ruangan`)
      return row.total || 0
    } catch (error) {
      console.log('Error countRuangan:', error)
      throw error
    }
  }

  static async countRekomendasi() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM rekomendasi_pengajuan_barang`)
      return row.total || 0
    } catch (error) {
      console.log('Error countRekomendasi:', error)
      throw error
    }
  }

  static async countLaporan() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM laporan`)
      return row.total || 0
    } catch (error) {
      console.log('Error countLaporan:', error)
      throw error
    }
  }

  static async countLaporanSelesai() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM laporan WHERE status = ?`, ['selesai'])
      return row.total || 0
    } catch (error) {
      console.log('Error countLaporanSelesai:', error)
      throw error
    }
  }

  static async getGrafikLaporanBulanan() {
    try {
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
    } catch (error) {
      console.log('Error getGrafikLaporanBulanan:', error)
      throw error
    }
  }
}

module.exports = Dashboard
