const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Inventaris = require('../models/Inventaris')
const PDFDocument = require('pdfkit')

const {
  formatDate,
  paginateRows
} = require('../utils/adminHelpers')

router.get('/admin/inventaris', authAdmin, async (req, res) => {
  try {
    const allInventaris = await Inventaris.getInventaris(req.query.search || '')
    const {
      rows: inventaris,
      pagination
    } = paginateRows(allInventaris, req.query)

    return res.render('admin/inventaris/index', {
      inventaris,
      pagination,
      search: req.query.search || '',
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat inventaris')
    return res.redirect('/dashboard')

  }
})

router.get('/admin/inventaris/create', authAdmin, (req, res) => {
  return res.render('admin/inventaris/create')
})

router.post('/admin/inventaris/create', authAdmin, async (req, res) => {
  try {
    await Inventaris.createInventaris(req.body)
    req.flash('success', 'Inventaris berhasil ditambahkan')
    return res.redirect('/admin/inventaris')
  } catch (err) {

    console.log(err)
    req.flash('error', 'Gagal menambahkan inventaris')
    req.flash('oldInput', req.body)
    return res.redirect('/admin/inventaris/create')

  }
})

router.get('/admin/inventaris/edit/:id', authAdmin, async (req, res) => {
  try {

    const item = await Inventaris.getInventarisById(req.params.id)

    if (!item) {
      req.flash('error', 'Inventaris tidak ditemukan')
      return res.redirect('/admin/inventaris')
    }
    return res.render('admin/inventaris/edit', {
      item,
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat edit inventaris')
    return res.redirect('/admin/inventaris')

  }
})

router.patch('/admin/inventaris/edit/:id', authAdmin, async (req, res) => {
  try {
    await Inventaris.updateInventaris(req.params.id, req.body)
    req.flash('success', 'Inventaris berhasil diupdate')
    return res.redirect('/admin/inventaris')

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal update inventaris')
    return res.redirect('/admin/inventaris')
  }
})

router.delete('/admin/inventaris/delete/:id', authAdmin, async (req, res) => {
  try {

    await Inventaris.deleteInventaris(req.params.id)
    req.flash('success', 'Inventaris berhasil dihapus')
    return res.redirect('/admin/inventaris')

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal hapus inventaris')
    return res.redirect('/admin/inventaris')

  }
})

module.exports = router