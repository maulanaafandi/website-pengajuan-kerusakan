const connection = require('../config/db')

class Dashboard {
  static async countUsersByRole(role) {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM users WHERE role = ?`, [role])
      return row.total || 0
    } catch (error) {
      console.log('Error countUsersByRole:', error)
      throw error
    }
  }

  static async countUsers() {
    try {
      const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM users WHERE role != ?`, ['admin'])
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

  static async countLaporan(status = '') {
    try {
      const [[row]] = status
        ? await connection.query(`SELECT COUNT(*) AS total FROM laporan WHERE status = ?`, [status])
        : await connection.query(`SELECT COUNT(*) AS total FROM laporan`)
      return row.total || 0
    } catch (error) {
      console.log('Error countLaporan:', error)
      throw error
    }
  }

  static async countDiprosesInternal() {
    return Dashboard.countLaporan('diproses_internal')
  }

  static async countDiprosesEksternal() {
    return Dashboard.countLaporan('diproses_eksternal')
  }

  static async countLaporanPending() {
    return Dashboard.countLaporan('pending')
  }

  static async countLaporanSelesai() {
    return Dashboard.countLaporan('selesai')
  }

  static async getGrafikLaporanBulanan() {
    try {
      const [rows] = await connection.query(`
        SELECT
          data_bulanan.bulan_key,
          CASE data_bulanan.bulan_num
            WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar' WHEN 4 THEN 'Apr'
            WHEN 5 THEN 'Mei' WHEN 6 THEN 'Jun' WHEN 7 THEN 'Jul' WHEN 8 THEN 'Agu'
            WHEN 9 THEN 'Sep' WHEN 10 THEN 'Okt' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Des'
          END AS bulan,
          data_bulanan.total
        FROM (
          SELECT
            DATE_FORMAT(selesai_pada, '%Y-%m') AS bulan_key,
            MONTH(selesai_pada) AS bulan_num,
            COUNT(*) AS total
          FROM laporan
          WHERE status = 'selesai' AND selesai_pada IS NOT NULL
          GROUP BY DATE_FORMAT(selesai_pada, '%Y-%m'), MONTH(selesai_pada)
        ) AS data_bulanan
        ORDER BY data_bulanan.bulan_key ASC
      `)

      return rows || []
    } catch (error) {
      console.log('Error getGrafikLaporanBulanan:', error)
      throw error
    }
  }
}

module.exports = Dashboard
