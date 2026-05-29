const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Dashboard = require('../models/Dashboard')

router.get('/dashboard', authAdmin, async (req, res) => {
  try {

    const [
      totalUser,
      totalInventaris,
      totalRuangan,
      totalRekomendasi,
      totalLaporan,
      totalDiprosesInternal,
      totalDiprosesEksternal,
      totalLaporanSelesai,
      grafikLaporanBulanan
    ] = await Promise.all([
      Dashboard.countUsers(),
      Dashboard.countInventaris(),
      Dashboard.countRuangan(),
      Dashboard.countRekomendasi(),
      Dashboard.countLaporan(),
      Dashboard.countDiprosesInternal(),
      Dashboard.countDiprosesEksternal(),
      Dashboard.countLaporanSelesai(),
      Dashboard.getGrafikLaporanBulanan()
    ])

    const stats = {
      totalUser,
      totalInventaris,
      totalRuangan,
      totalRekomendasi,
      totalLaporan,
      totalDiprosesInternal,
      totalDiprosesEksternal,
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