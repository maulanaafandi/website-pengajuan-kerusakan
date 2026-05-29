const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Lantai = require('../models/Lantai')

const {
  masterDataConfig,
  paginateRows,
  validateLantai
} = require('../utils/adminHelpers')

const { type, label } = masterDataConfig.lantai

router.get('/admin/master/lantai', authAdmin, async (req, res) => {
  try {
    const allRows = await Lantai.getAll(req.query.search || '')
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
    req.flash('error', 'Gagal memuat data lantai')
    return res.redirect('/dashboard')
  }
})

router.get('/admin/master/lantai/create', authAdmin, (req, res) => {
  return res.render('admin/master/form', {
    type,
    label,
    item: null
  })
})

router.post('/admin/master/lantai/create', authAdmin, async (req, res) => {
  try {
    const data = await validateLantai(req.body)
    await Lantai.create(data)
    req.flash('success', 'Lantai berhasil ditambahkan')
    return res.redirect('/admin/master/lantai')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal menambahkan lantai')
    req.flash('oldInput', req.body)
    return res.redirect('/admin/master/lantai/create')
  }
})

router.get('/admin/master/lantai/edit/:id', authAdmin, async (req, res) => {
  try {
    const item = await Lantai.getById(req.params.id)
    if (!item) {
      req.flash('error', 'Lantai tidak ditemukan')
      return res.redirect('/admin/master/lantai')
    }

    return res.render('admin/master/form', {
      type,
      label,
      item
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat form lantai')
    return res.redirect('/admin/master/lantai')
  }
})

router.patch('/admin/master/lantai/edit/:id', authAdmin, async (req, res) => {
  try {
    const data = await validateLantai(req.body, req.params.id)
    await Lantai.update(req.params.id, data)
    req.flash('success', 'Lantai berhasil diupdate')
    return res.redirect('/admin/master/lantai')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal update lantai')
    return res.redirect('/admin/master/lantai')
  }
})

router.delete('/admin/master/lantai/delete/:id', authAdmin, async (req, res) => {
  try {
    await Lantai.delete(req.params.id)
    req.flash('success', 'Lantai berhasil dihapus')
    return res.redirect('/admin/master/lantai')
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal hapus lantai')
    return res.redirect('/admin/master/lantai')
  }
})

module.exports = router
