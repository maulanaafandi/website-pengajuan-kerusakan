const multer = require('multer')

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
})

function handleExcelUpload(req, res, next) {
  uploadExcel.single('file_excel')(req, res, err => {
    if (err) {
      req.flash('error', err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file maksimal 2MB' : err.message)
      return res.redirect('/admin/inventaris')
    }

    return next()
  })
}

function formatDate(value) {
  if (!value) return ''

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) return `${match[1]}-${match[2]}-${match[3]}`
  }

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (err) {
    return ''
  }
}

function paginateRows(rows = [], query = {}, perPage = 10) {
  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const requestedPage = parseInt(query.page, 10)
  const currentPage = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), totalPages)
  const startIndex = (currentPage - 1) * perPage
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (key !== 'page' && value) {
      params.set(key, value)
    }
  })

  const baseQuery = params.toString()
  const makeUrl = page => `${baseQuery ? `?${baseQuery}&` : '?'}page=${page}`

  return {
    rows: rows.slice(startIndex, startIndex + perPage),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      perPage,
      startItem: totalItems ? startIndex + 1 : 0,
      endItem: Math.min(startIndex + perPage, totalItems),
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      prevUrl: makeUrl(currentPage - 1),
      nextUrl: makeUrl(currentPage + 1),
      baseQuery,
      pageUrls: Array.from({ length: totalPages }, (_, index) => ({
        page: index + 1,
        url: makeUrl(index + 1)
      }))
    }
  }
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeExcelDate(value) {
  if (!value) return null
  if (value instanceof Date) return formatDate(value) || null
  return formatDate(String(value).trim()) || null
}

function getCellText(rowData, keys) {
  for (const key of keys) {
    if (rowData[key] !== undefined && rowData[key] !== null && String(rowData[key]).trim() !== '') {
      return String(rowData[key]).trim()
    }
  }

  return ''
}

function getRoomId(rowData, ruanganList) {
  const idRuangan = getCellText(rowData, ['id_ruangan', 'id_ruang', 'id'])
  if (idRuangan) return idRuangan

  const kodeRuangan = normalizeText(getCellText(rowData, ['kode_ruangan', 'kode_ruang']))
  const namaRuangan = normalizeText(getCellText(rowData, ['nama_ruangan', 'ruangan']))

  const room = ruanganList.find(item => {
    return (kodeRuangan && normalizeText(item.kode_ruangan) === kodeRuangan) ||
      (namaRuangan && normalizeText(item.nama_ruangan) === namaRuangan)
  })

  return room ? room.id_ruangan : null
}

function buildImportRows(worksheet, ruanganList) {
  const headers = []
  const rows = []
  const errors = []

  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = normalizeHeader(cell.value)
  })

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const rowData = {}
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber]
      if (header) rowData[header] = cell.value
    })

    const kodeBarang = getCellText(rowData, ['kode_barang', 'kode'])
    const namaBarang = getCellText(rowData, ['nama_barang', 'barang'])

    if (!kodeBarang && !namaBarang) return

    if (!kodeBarang || !namaBarang) {
      errors.push(`Baris ${rowNumber}: Kode Barang dan Nama Barang wajib diisi`)
      return
    }

    rows.push({
      id_ruangan: getRoomId(rowData, ruanganList),
      kode_barang: kodeBarang,
      nup: getCellText(rowData, ['nup', 'NUP']),
      nama_barang: namaBarang,
      merk: getCellText(rowData, ['merk', 'merek']),
      tipe: getCellText(rowData, ['tipe', 'type']),
      kategori: getCellText(rowData, ['kategori']) || 'Alat',
      tanggal_buku_pertama: normalizeExcelDate(rowData.tanggal_buku_pertama || rowData.tgl_buku || rowData.tanggal_buku),
      tanggal_perolehan: normalizeExcelDate(rowData.tanggal_perolehan || rowData.tgl_perolehan)
    })
  })

  return { rows, errors }
}

module.exports = {
  buildImportRows,
  formatDate,
  getCellText,
  getRoomId,
  handleExcelUpload,
  normalizeExcelDate,
  normalizeHeader,
  normalizeText,
  paginateRows
}
