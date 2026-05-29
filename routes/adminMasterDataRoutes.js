const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Lokasi = require('../models/Lokasi')
const Lantai = require('../models/Lantai')
const connection = require('../config/db')

const {
  paginateRows
} = require('../utils/adminHelpers')

const labels = {
  lokasi: 'Lokasi',
  lantai: 'Lantai'
}

const models = {
  lokasi: Lokasi,
  lantai: Lantai
}

const tables = {
  lokasi: 'lokasi',
  lantai: 'lantai'
}

function getType(req, res) {
  const type = req.params.type
  if (!labels[type]) {
    req.flash('error', 'Master data tidak ditemukan')
    res.redirect('/dashboard')
    return null
  }
  return type
}

function validateName(type, data) {
  const nama = String(data.nama || '').trim()

  if (!nama) {
    throw new Error(`Nama ${labels[type].toLowerCase()} wajib diisi`)
  }

  return nama
}

async function isNameExists(type, nama, excludeId = null) {
  const params = [nama]
  let excludeWhere = ''

  if (excludeId) {
    excludeWhere = 'AND id != ?'
    params.push(excludeId)
  }

  const [rows] = await connection.query(
    `SELECT id FROM ${tables[type]} WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) ${excludeWhere} LIMIT 1`,
    params
  )

  return rows.length > 0
}

async function validateMasterData(type, data, excludeId = null) {
  const nama = validateName(type, data)

  if (await isNameExists(type, nama, excludeId)) {
    throw new Error(`${labels[type]} sudah ada`)
  }

  return { nama }
}

router.get('/admin/master/:type', authAdmin, async (req, res) => {
  try {
    const type = getType(req, res)
    if (!type) return

    const allRows = await models[type].getAll(req.query.search || '')
    const { rows, pagination } = paginateRows(allRows, req.query)

    return res.render('admin/master/index', {
      type,
      label: labels[type],
      rows,
      pagination,
      search: req.query.search || ''
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat master data')
    return res.redirect('/dashboard')
  }
})

router.get('/admin/master/:type/create', authAdmin, (req, res) => {
  const type = getType(req, res)
  if (!type) return

  return res.render('admin/master/form', {
    type,
    label: labels[type],
    item: null
  })
})

router.post('/admin/master/:type/create', authAdmin, async (req, res) => {
  try {
    const type = getType(req, res)
    if (!type) return

    const data = await validateMasterData(type, req.body)
    await models[type].create(data)
    req.flash('success', `${labels[type]} berhasil ditambahkan`)
    return res.redirect(`/admin/master/${type}`)
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal menambahkan master data')
    req.flash('oldInput', req.body)
    return res.redirect(`/admin/master/${req.params.type}/create`)
  }
})

router.get('/admin/master/:type/edit/:id', authAdmin, async (req, res) => {
  try {
    const type = getType(req, res)
    if (!type) return

    const item = await models[type].getById(req.params.id)
    if (!item) {
      req.flash('error', `${labels[type]} tidak ditemukan`)
      return res.redirect(`/admin/master/${type}`)
    }

    return res.render('admin/master/form', {
      type,
      label: labels[type],
      item
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat form master data')
    return res.redirect(`/admin/master/${req.params.type}`)
  }
})

router.patch('/admin/master/:type/edit/:id', authAdmin, async (req, res) => {
  try {
    const type = getType(req, res)
    if (!type) return

    const data = await validateMasterData(type, req.body, req.params.id)
    await models[type].update(req.params.id, data)
    req.flash('success', `${labels[type]} berhasil diupdate`)
    return res.redirect(`/admin/master/${type}`)
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal update master data')
    return res.redirect(`/admin/master/${req.params.type}`)
  }
})

router.delete('/admin/master/:type/delete/:id', authAdmin, async (req, res) => {
  try {
    const type = getType(req, res)
    if (!type) return

    await models[type].delete(req.params.id)
    req.flash('success', `${labels[type]} berhasil dihapus`)
    return res.redirect(`/admin/master/${type}`)
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal hapus master data')
    return res.redirect(`/admin/master/${req.params.type}`)
  }
})

module.exports = router
