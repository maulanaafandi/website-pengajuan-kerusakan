const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Dashboard = require('../models/Dashboard')

router.get('/dashboard', authAdmin, async (req, res) => {
  try {

    const [
      totalMahasiswa,
      totalDosen,
      totalSatpam,
      totalTendik,
      totalPlp,
      totalInventaris,
      totalRuangan,
      totalLaporan,
      totalDiprosesInternal,
      totalDiprosesEksternal,
      totalLaporanPending,
      totalLaporanSelesai,
      grafikLaporanBulanan
    ] = await Promise.all([
      Dashboard.countUsersByRole('mahasiswa'),
      Dashboard.countUsersByRole('dosen'),
      Dashboard.countUsersByRole('satpam'),
      Dashboard.countUsersByRole('tendik'),
      Dashboard.countUsersByRole('plp'),
      Dashboard.countInventaris(),
      Dashboard.countRuangan(),
      Dashboard.countLaporan(),
      Dashboard.countDiprosesInternal(),
      Dashboard.countDiprosesEksternal(),
      Dashboard.countLaporanPending(),
      Dashboard.countLaporanSelesai(),
      Dashboard.getGrafikLaporanBulanan()
    ])

    const stats = {
      totalMahasiswa,
      totalDosen,
      totalSatpam,
      totalTendik,
      totalPlp,
      totalInventaris,
      totalRuangan,
      totalLaporan,
      totalDiprosesInternal,
      totalDiprosesEksternal,
      totalLaporanPending,
      totalLaporanSelesai,
      grafikLaporanBulanan
    }

    return res.render('admin/dashboard', stats)

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat dashboard')
    return res.redirect('/')
  }
})

module.exports = router
