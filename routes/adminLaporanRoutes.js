const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Laporan = require('../models/Laporan')
const User = require('../models/User')
const Inventaris = require('../models/Inventaris')

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

    const parseAuditData = (value) => {
      if (!value) return {}

      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (error) {
        return {}
      }
    }

    const userIds = []
    const inventarisIds = []

    auditLaporan.forEach((audit) => {
      const dataLama = parseAuditData(audit.data_lama)
      const dataBaru = parseAuditData(audit.data_baru)

      ;[dataLama, dataBaru].forEach((data) => {
        if (data && data.id_pelapor !== undefined && data.id_pelapor !== null && data.id_pelapor !== '') {
          userIds.push(data.id_pelapor)
        }

        if (data && data.id_inventaris !== undefined && data.id_inventaris !== null && data.id_inventaris !== '') {
          inventarisIds.push(data.id_inventaris)
        }
      })
    })

    const [users, inventarisList] = await Promise.all([
      User.getUsersByIds(userIds),
      Inventaris.getInventarisByIds(inventarisIds)
    ])

    const userMap = users.reduce((acc, user) => {
      acc[String(user.id)] = user
      return acc
    }, {})

    const inventarisMap = inventarisList.reduce((acc, inventaris) => {
      acc[String(inventaris.id)] = inventaris
      return acc
    }, {})

    return res.render('admin/laporan/audit-detail', {
      auditLaporan,
      laporanInfo: auditLaporan[0],
      userMap,
      inventarisMap
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
