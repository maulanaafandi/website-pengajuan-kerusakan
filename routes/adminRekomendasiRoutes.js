const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')

const Rekomendasi = require('../models/Rekomendasi')
const Ruangan = require('../models/Ruangan')
const Laporan = require('../models/Laporan')
const Inventaris = require('../models/Inventaris')

const {
  formatDate,
  paginateRows,
  generateRekomendasiDenganOpenAI
} = require('../utils/adminHelpers')

router.get('/admin/rekomendasi', authAdmin, async (req, res) => {
  try {
    const allRekomendasi = await Rekomendasi.getRekomendasi(req.query.search || '')

    const {
      rows: rekomendasi,
      pagination
    } = paginateRows(allRekomendasi, req.query)
    const aiResults = req.session.aiResults || []
    return res.render('admin/rekomendasi/index', {
      rekomendasi,
      pagination,
      aiResults,
      search: req.query.search || '',
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat rekomendasi')
    return res.redirect('/dashboard')
  }
})

router.post('/admin/rekomendasi/generate-ai', authAdmin, async (req, res) => {
  try {

    const [laporan, ruangan] = await Promise.all([
      Laporan.getLaporanUntukAI(),
      Ruangan.getRuanganUntukAI()
    ])
    let inventaris = []
    try {
      inventaris = await Inventaris.getInventarisUntukAI()
    } catch (err) {
      inventaris = await Inventaris.getInventarisUntukAIFallback()
    }
    const data = { laporan, inventaris, ruangan }
    const aiResults = await generateRekomendasiDenganOpenAI(data)
    req.session.aiResults = aiResults
    req.flash('success', 'Hasil rekomendasi AI berhasil dibuat')
    return res.redirect('/admin/rekomendasi')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal generate AI')
    return res.redirect('/admin/rekomendasi')
  }
})

module.exports = router