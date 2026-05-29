const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Inventaris = require('../models/Inventaris')
const Ruangan = require('../models/Ruangan')
const ExcelJS = require('exceljs')

const {
  buildImportRows,
  formatDate,
  handleExcelUpload,
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

router.get('/admin/inventaris/export/excel', authAdmin, async (req, res) => {
  try {
    const inventaris = await Inventaris.getInventaris('')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Inventaris')

    worksheet.columns = [
      // { header: 'No', key: 'no', width: 8 },
      // { header: 'ID Ruangan', key: 'id_ruangan', width: 12 },
      // { header: 'Kode Ruangan', key: 'kode_ruangan', width: 16 },
      // { header: 'Nama Ruangan', key: 'nama_ruangan', width: 24 },
      { header: 'Kode Barang', key: 'kode_barang', width: 18 },
      { header: 'NUP', key: 'nup', width: 14 },
      { header: 'Nama Barang', key: 'nama_barang', width: 28 },
      { header: 'Merk', key: 'merk', width: 18 },
      { header: 'Tipe', key: 'tipe', width: 18 },
      { header: 'Kategori', key: 'kategori', width: 16 },
      { header: 'Tanggal Buku Pertama', key: 'tanggal_buku_pertama', width: 22 },
      { header: 'Tanggal Perolehan', key: 'tanggal_perolehan', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }

    inventaris.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        id_ruangan: item.id_ruangan || '',
        kode_ruangan: item.kode_ruangan || '',
        nama_ruangan: item.nama_ruangan || '',
        kode_barang: item.kode_barang || '',
        nup: item.nup || '',
        nama_barang: item.nama_barang || '',
        merk: item.merk || '',
        tipe: item.tipe || '',
        kategori: item.kategori || '',
        tanggal_buku_pertama: formatDate(item.tanggal_buku_pertama),
        tanggal_perolehan: formatDate(item.tanggal_perolehan)
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=inventaris.xlsx')

    await workbook.xlsx.write(res)
    return res.end()
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal export Excel')
    return res.redirect('/admin/inventaris')
  }
})

router.post('/admin/inventaris/import/excel', authAdmin, handleExcelUpload, async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Pilih file Excel terlebih dahulu')
      return res.redirect('/admin/inventaris')
    }

    if (!req.file.originalname.toLowerCase().endsWith('.xlsx')) {
      req.flash('error', 'File harus berformat .xlsx')
      return res.redirect('/admin/inventaris')
    }

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.file.buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      req.flash('error', 'Sheet Excel tidak ditemukan')
      return res.redirect('/admin/inventaris')
    }

    const ruangan = await Ruangan.getRuangan()
    const { rows, errors } = buildImportRows(worksheet, ruangan)

    if (errors.length > 0) {
      req.flash('error', errors.slice(0, 5).join('; '))
      return res.redirect('/admin/inventaris')
    }

    if (rows.length === 0) {
      req.flash('error', 'Tidak ada data inventaris yang bisa diimport')
      return res.redirect('/admin/inventaris')
    }

    await Inventaris.createManyInventaris(rows)
    req.flash('success', `${rows.length} data inventaris berhasil diimport`)
    return res.redirect('/admin/inventaris')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal import Excel')
    return res.redirect('/admin/inventaris')
  }
})

router.get('/admin/inventaris/create', authAdmin, async (req, res) => {
  try {
    const ruangan = await Ruangan.getRuangan()
    return res.render('admin/inventaris/create', { ruangan })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat data ruangan')
    return res.redirect('/admin/inventaris')
  }
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
    const ruangan = await Ruangan.getRuangan()
    return res.render('admin/inventaris/edit', {
      item,
      ruangan,
      formatDate
    })

  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat edit inventaris')
    return res.redirect('/admin/inventaris')

  }
})

async function updateInventaris(req, res) {
  try {
    const result = await Inventaris.updateInventaris(req.params.id, req.body)

    if (!result || result.affectedRows === 0) {
      req.flash('error', 'Inventaris tidak ditemukan')
      return res.redirect('/admin/inventaris')
    }

    req.flash('success', 'Inventaris berhasil diupdate')
    return res.redirect('/admin/inventaris')

  } catch (err) {
    console.log(err)

    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Kode barang sudah digunakan oleh data lain')
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      req.flash('error', 'Ruangan yang dipilih tidak valid')
    } else {
      req.flash('error', err.message || 'Gagal update inventaris')
    }

    return res.redirect('/admin/inventaris')
  }
}

router.post('/admin/inventaris/edit/:id', authAdmin, updateInventaris)
router.patch('/admin/inventaris/edit/:id', authAdmin, updateInventaris)

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
