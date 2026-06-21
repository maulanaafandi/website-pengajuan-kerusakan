const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Lokasi = require('../models/Lokasi')

const {
  masterDataConfig,
  paginateRows,
  validateLokasi
} = require('../utils/adminHelpers')

const { type, label } = masterDataConfig.lokasi

router.get('/admin/master/lokasi', authAdmin, async (req, res) => {
  try {
    const allRows = await Lokasi.getAll(req.query.search || '')
    const { rows, pagination } = paginateRows(allRows, req.query)

    return res.render('admin/master/index', {
      type,
      label,
      rows,
      pagination,
      search: req.query.search || ''
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat data lokasi')
    return res.redirect('/dashboard')
  }
})

router.get('/admin/master/lokasi/create', authAdmin, (req, res) => {
  return res.render('admin/master/form', {
    type,
    label,
    item: null
  })
})

router.post('/admin/master/lokasi/create', authAdmin, async (req, res) => {
  try {
    const data = await validateLokasi(req.body)
    await Lokasi.create(data)
    req.flash('success', 'Lokasi berhasil ditambahkan')
    return res.redirect('/admin/master/lokasi')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal menambahkan lokasi')
    req.flash('oldInput', req.body)
    return res.redirect('/admin/master/lokasi/create')
  }
})

router.get('/admin/master/lokasi/edit/:id', authAdmin, async (req, res) => {
  try {
    const item = await Lokasi.getById(req.params.id)
    if (!item) {
      req.flash('error', 'Lokasi tidak ditemukan')
      return res.redirect('/admin/master/lokasi')
    }

    return res.render('admin/master/form', {
      type,
      label,
      item
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat form lokasi')
    return res.redirect('/admin/master/lokasi')
  }
})

router.patch('/admin/master/lokasi/edit/:id', authAdmin, async (req, res) => {
  try {
    const data = await validateLokasi(req.body, req.params.id)
    await Lokasi.update(req.params.id, data)
    req.flash('success', 'Lokasi berhasil diupdate')
    return res.redirect('/admin/master/lokasi')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal update lokasi')
    return res.redirect('/admin/master/lokasi')
  }
})

router.delete('/admin/master/lokasi/delete/:id', authAdmin, async (req, res) => {
  try {
    const result = await Lokasi.delete(req.params.id)

    if (!result || result.affectedRows === 0) {
      req.flash('error', 'Lokasi tidak ditemukan')
      return res.redirect('/admin/master/lokasi')
    }

    req.flash('success', 'Lokasi berhasil dihapus')
    return res.redirect('/admin/master/lokasi')
  } catch (err) {
    console.log(err)

    if (err.code === 'LOKASI_NOT_FOUND') {
      req.flash('error', err.message)
    } else if (err.code === 'LOKASI_USED_IN_LAPORAN') {
      req.flash('error', err.message)
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      req.flash('error', err.message)
    } else {
      req.flash('error', err.message || 'Gagal hapus lokasi')
    }

    return res.redirect('/admin/master/lokasi')
  }
})

module.exports = router
