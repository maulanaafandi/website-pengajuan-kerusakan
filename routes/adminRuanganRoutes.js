const express = require('express')
const router = express.Router()
const authAdmin = require('../middleware/auth')
const Ruangan = require('../models/Ruangan')
const User = require('../models/User')
const Lokasi = require('../models/Lokasi')
const Lantai = require('../models/Lantai')

const {
  paginateRows
} = require('../utils/adminHelpers')

router.get('/admin/ruangan', authAdmin, async (req, res) => {
  try {
    const allRuangan = await Ruangan.getRuangan(req.query.search || '')
    const {
      rows: ruangan,
      pagination
    } = paginateRows(allRuangan, req.query)

    return res.render('admin/ruangan/index', {
      ruangan,
      pagination,
      search: req.query.search || ''
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat ruangan')
    return res.redirect('/dashboard')

  }
})

router.get('/admin/ruangan/create', authAdmin, async (req, res) => {
  try {
    const [dosenKalebUsers, lokasi, lantai] = await Promise.all([
      User.getDosenKalebUsers(),
      Lokasi.getAll(),
      Lantai.getAll()
    ])
    return res.render('admin/ruangan/create', {
      dosenKalebUsers,
      lokasi,
      lantai
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat data dosen')
    return res.redirect('/admin/ruangan')

  }
})

router.post('/admin/ruangan/create', authAdmin, async (req, res) => {
  try {
    await Ruangan.createRuangan(req.body)
    req.flash('success', 'Ruangan berhasil ditambahkan')
    return res.redirect('/admin/ruangan')
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal menambahkan ruangan')
    return res.redirect('/admin/ruangan/create')

  }
})

router.get('/admin/ruangan/edit/:id', authAdmin, async (req, res) => {
  try {
    const [item, dosenKalebUsers, lokasi, lantai] = await Promise.all([
      Ruangan.getRuanganById(req.params.id),
      User.getDosenKalebUsers(),
      Lokasi.getAll(),
      Lantai.getAll()
    ])

    if (!item) {
      req.flash('error', 'Ruangan tidak ditemukan')
      return res.redirect('/admin/ruangan')
    }

    return res.render('admin/ruangan/edit', {
      item,
      dosenKalebUsers,
      lokasi,
      lantai
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat edit ruangan')
    return res.redirect('/admin/ruangan')
  }
})

router.patch('/admin/ruangan/edit/:id', authAdmin, async (req, res) => {
  try {
    await Ruangan.updateRuangan(req.params.id, req.body)
    req.flash('success', 'Ruangan berhasil diupdate')
    return res.redirect('/admin/ruangan')
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal update ruangan')
    return res.redirect('/admin/ruangan')
  }
})

router.delete('/admin/ruangan/delete/:id', authAdmin, async (req, res) => {
  try {
    const result = await Ruangan.deleteRuangan(req.params.id)

    if (!result || result.affectedRows === 0) {
      req.flash('error', 'Ruangan tidak ditemukan')
      return res.redirect('/admin/ruangan')
    }

    req.flash('success', 'Ruangan berhasil dihapus')
    return res.redirect('/admin/ruangan')
  } catch (err) {
    console.log(err)

    if (err.code === 'RUANGAN_NOT_FOUND') {
      req.flash('error', err.message)
    } else if (err.code === 'RUANGAN_USED_IN_LAPORAN') {
      req.flash('error', err.message)
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      req.flash('error', err.message)
    } else {
      req.flash('error', err.message || 'Gagal hapus ruangan')
    }

    return res.redirect('/admin/ruangan')
  }
})

module.exports = router
