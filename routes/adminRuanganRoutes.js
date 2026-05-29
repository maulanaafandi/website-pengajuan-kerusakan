const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')

const Ruangan = require('../models/Ruangan')
const User = require('../models/User')

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
    const dosenKalebUsers = await User.getDosenKalebUsers()
    return res.render('admin/ruangan/create', {
      dosenKalebUsers
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

module.exports = router