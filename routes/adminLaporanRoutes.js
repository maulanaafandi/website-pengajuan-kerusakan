const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const Laporan = require('../models/Laporan')
const User = require('../models/User')
const Inventaris = require('../models/Inventaris')
const PDFDocument = require('pdfkit')

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

        if (data && data.id_teknisi !== undefined && data.id_teknisi !== null && data.id_teknisi !== '') {
          userIds.push(data.id_teknisi)
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

router.get('/admin/laporan/ruangan', authAdmin, async (req, res) => {
  try {
    const ruanganList = await Inventaris.getRuanganDenganInventaris()
    const selectedRuanganId = req.query.id_ruangan || ''
    let inventarisItems = []
    let selectedRuangan = null

    if (selectedRuanganId) {
      inventarisItems = await Inventaris.getInventarisLaporanPerRuangan(selectedRuanganId)
      selectedRuangan = ruanganList.find((item) => String(item.id) === String(selectedRuanganId)) || null
    }

    return res.render('admin/laporan/per-ruangan', {
      ruanganList,
      selectedRuanganId,
      selectedRuangan,
      inventarisItems
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat laporan per ruangan')
    return res.redirect('/admin/laporan')
  }
})

router.get('/admin/laporan/ruangan/pdf', authAdmin, async (req, res) => {
  try {
    const selectedRuanganId = req.query.id_ruangan || ''
    const kerusakanIds = String(req.query.kerusakan_ids || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const kehilanganIds = String(req.query.kehilangan_ids || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (!selectedRuanganId) {
      req.flash('error', 'Pilih ruangan terlebih dahulu')
      return res.redirect('/admin/laporan/ruangan')
    }

    const [ruanganList, inventarisItems] = await Promise.all([
      Inventaris.getRuanganDenganInventaris(),
      Inventaris.getInventarisLaporanPerRuangan(selectedRuanganId)
    ])

    const selectedRuangan = ruanganList.find((item) => String(item.id) === String(selectedRuanganId)) || null

    if (!selectedRuangan) {
      req.flash('error', 'Ruangan tidak ditemukan')
      return res.redirect('/admin/laporan/ruangan')
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40
    })

    const safeRuanganName = String(selectedRuangan.nama || 'ruangan')
      .replace(/[^\w\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="laporan-per-ruangan-${safeRuanganName || 'ruangan'}.pdf"`)

    doc.pipe(res)

    doc.fontSize(16).text('Laporan Per Ruangan', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(11).text(`Ruangan: ${selectedRuangan.nama || '-'}`)
    doc.text(`Total Data: ${inventarisItems.length}`)
    doc.moveDown(1)

    const startX = 40
    const columnWidths = [28, 78, 60, 95, 95, 60, 79]
    const columns = [
      { label: 'No', width: columnWidths[0], align: 'center' },
      { label: 'Kode Barang', width: columnWidths[1] },
      { label: 'NUP', width: columnWidths[2] },
      { label: 'Nama Barang', width: columnWidths[3] },
      { label: 'Merk', width: columnWidths[4] },
      { label: 'Kerusakan', width: columnWidths[5] },
      { label: 'Kehilangan', width: columnWidths[6] }
    ]

    const drawTableHeader = () => {
      let x = startX
      const y = doc.y

      doc.font('Helvetica-Bold').fontSize(8)
      columns.forEach((column) => {
        doc.rect(x, y, column.width, 30).stroke()
        doc.text(column.label, x + 4, y + 8, {
          width: column.width - 8,
          align: column.align || 'left'
        })
        x += column.width
      })

      doc.moveDown(2)
      doc.font('Helvetica').fontSize(8)
    }

    const ensurePageSpace = (requiredHeight = 36) => {
      if (doc.y + requiredHeight > doc.page.height - 40) {
        doc.addPage()
        drawTableHeader()
      }
    }

    drawTableHeader()

    if (!inventarisItems.length) {
      doc.text('Tidak ada data inventaris pada ruangan ini.')
    } else {
      inventarisItems.forEach((item, index) => {
        const row = [
          String(index + 1),
          item.kode_barang || '-',
          item.nup || '-',
          item.nama_barang || '-',
          item.merk || '-',
          kerusakanIds.includes(String(item.id_inventaris)) ? 'Ya' : '',
          kehilanganIds.includes(String(item.id_inventaris)) ? 'Ya' : ''
        ]

        const heights = row.map((value, idx) =>
          doc.heightOfString(String(value), {
            width: columns[idx].width - 8,
            align: columns[idx].align || 'left'
          })
        )

        const rowHeight = Math.max(24, ...heights.map((height) => height + 10))
        ensurePageSpace(rowHeight + 4)

        let x = startX
        const y = doc.y

        row.forEach((value, idx) => {
          const column = columns[idx]
          doc.rect(x, y, column.width, rowHeight).stroke()
          doc.text(String(value), x + 4, y + 5, {
            width: column.width - 8,
            align: column.align || 'left'
          })
          x += column.width
        })

        doc.y = y + rowHeight
      })
    }

    doc.end()
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal mencetak PDF laporan per ruangan')
    return res.redirect('/admin/laporan/ruangan')
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
