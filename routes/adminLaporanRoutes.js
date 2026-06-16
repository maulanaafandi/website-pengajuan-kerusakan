const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Laporan = require('../models/Laporan')

const {
  formatDate
} = require('../utils/adminHelpers')

router.get('/admin/laporan', authAdmin, async (req, res) => {
  try {
    const laporan = await Laporan.getLaporan(
      req.query.search || '',
      req.query.status || '',
      req.query.tanggal || ''
    )
    return res.render('admin/laporan/index', {
      laporan,
      search: req.query.search || '',
      status: req.query.status || '',
      tanggal: req.query.tanggal || '',
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat laporan')
    return res.redirect('/dashboard')

  }
})

router.get('/admin/laporan/audit', authAdmin, async (req, res) => {
  try {
    const auditLaporan = await Laporan.getAllAuditLaporan(req.query.search || '')

    return res.render('admin/laporan/audit', {
      auditLaporan,
      search: req.query.search || ''
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat audit laporan')
    return res.redirect('/dashboard')
  }
})

router.get('/admin/laporan/audit/:id', authAdmin, async (req, res) => {
  try {
    const auditLaporan = await Laporan.getAuditLaporanDetail(req.params.id)

    if (!auditLaporan || auditLaporan.length === 0) {
      req.flash('error', 'Detail audit laporan tidak ditemukan')
      return res.redirect('/admin/laporan/audit')
    }

    return res.render('admin/laporan/audit-detail', {
      auditLaporan,
      laporanInfo: auditLaporan[0]
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat detail audit laporan')
    return res.redirect('/admin/laporan/audit')
  }
})

router.get('/admin/laporan/detail/:id', authAdmin, async (req, res) => {
  try {
    const laporan = await Laporan.getLaporanById(req.params.id)
    if (!laporan) {
      req.flash('error', 'Laporan tidak ditemukan')
      return res.redirect('/admin/laporan')
    }

    return res.render('admin/laporan/detail', {
      laporan,
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat detail laporan')
    return res.redirect('/admin/laporan')
  }
})

module.exports = router
