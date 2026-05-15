const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
const PDFDocument = require('pdfkit')
function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toISOString().split('T')[0]
  } catch (err) {
    return ''
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch (err) {
    const match = String(text || '').match(/\[[\s\S]*\]/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw err
  }
}

function buatPromptRekomendasiAI(data) {
  const laporanText = (data.laporan || []).map((item, index) => {
    return `${index + 1}. Ruangan: ${item.nama_ruangan || '-'} (${item.lokasi || '-'}) | Barang laporan: ${item.nama_barang || '-'} | Kondisi: ${item.kondisi || '-'} | Status: ${item.status || '-'} | Keterangan user: ${item.keterangan || '-'}`
  }).join('\n')

  const inventarisText = (data.inventaris || []).map((item, index) => {
    return `${index + 1}. ${item.nama_barang || '-'} | Merk/Tipe: ${item.merk || item.tipe || '-'} | Kategori: ${item.kategori || '-'} | Ruangan: ${item.nama_ruangan || '-'} | Lokasi: ${item.lokasi || '-'}`
  }).join('\n')

  const ruanganText = (data.ruangan || []).map((item, index) => {
    return `${index + 1}. id_ruangan=${item.id_ruangan}, ${item.nama_ruangan || '-'}, ${item.kode_ruangan || '-'}, lokasi ${item.lokasi || '-'}`
  }).join('\n')

  return `
Anda adalah asisten admin sistem pengajuan barang inventaris kampus.
Tugas Anda hanya membuat rekomendasi pengajuan barang berdasarkan SEMUA laporan user dan data inventaris.
Jangan membuat penjelasan panjang. Kembalikan JSON array valid saja.

Aturan output JSON:
[
  {
    "id_ruangan": 1,
    "nama_ruangan": "Ruang Lab 1",
    "lokasi": "pamolokan",
    "barang_rekomendasi_diajukan": "LCD Projector/Infocus, Kabel HDMI, Adaptor Proyektor",
    "nama_barang": "LCD Projector/Infocus",
    "alasan": "Banyak laporan terkait proyektor/layer mati pada ruangan tersebut dan inventaris pendukung perlu dicek/diajukan."
  }
]

Ketentuan:
- Pilih id_ruangan yang tersedia dari daftar ruangan.
- Buat maksimal 8 rekomendasi paling penting.
- Gabungkan barang yang masih satu kebutuhan dalam satu rekomendasi.
- Alasan harus singkat, jelas, dan berdasarkan laporan + inventaris.
- Kalau data laporan sangat sedikit, tetap buat rekomendasi paling masuk akal dari laporan yang ada.

DAFTAR RUANGAN:
${ruanganText || '-'}

DATA LAPORAN USER:
${laporanText || '-'}

DATA INVENTARIS:
${inventarisText || '-'}
`
}

async function generateRekomendasiDenganOpenAI(data) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY belum diisi di file .env')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Jawab hanya dengan JSON array valid tanpa markdown.' },
        { role: 'user', content: buatPromptRekomendasiAI(data) }
      ]
    })
  })

  const result = await response.json()

  if (!response.ok) {
    const message = result && result.error && result.error.message ? result.error.message : 'Gagal memanggil OpenAI'
    throw new Error(message)
  }

  const content = result.choices && result.choices[0] && result.choices[0].message
    ? result.choices[0].message.content
    : '[]'

  const parsed = safeJsonParse(content)

  if (!Array.isArray(parsed)) {
    throw new Error('Format hasil AI tidak sesuai. AI harus mengembalikan JSON array.')
  }

  return parsed.map(item => ({
    id_ruangan: item.id_ruangan || null,
    nama_ruangan: item.nama_ruangan || '-',
    lokasi: item.lokasi || '-',
    barang_rekomendasi_diajukan: item.barang_rekomendasi_diajukan || item.nama_barang || '-',
    nama_barang: item.nama_barang || item.barang_rekomendasi_diajukan || '-',
    alasan: item.alasan || '-'
  }))
}

class AdminController {
  static async dashboard(req, res) {
    try {
      const stats = await Admin.dashboardStats()
      return res.render('admin/dashboard', stats)
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat dashboard')
      return res.redirect('/login')
    }
  }

  static formBuatAkun(req, res) {
    return res.render('admin/buat-akun')
  }

  static async storeBuatAkun(req, res) {
    try {
      const { email, role } = req.body
      if (!email || !role) {
        req.flash('error', 'Email dan role wajib diisi')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']
      if (!allowedRoles.includes(role)) {
        req.flash('error', 'Role tidak valid')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      const existing = await Admin.findUserByEmail(email)
      if (existing) {
        req.flash('error', 'Email sudah terdaftar')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      await Admin.createUser({ email, role, kaleb: role === 'dosen' ? '1' : '0', password: 'user123' })
      req.flash('success', 'Akun berhasil dibuat')
      return res.redirect('/admin/buat-akun')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal membuat akun')
      req.flash('oldInput', req.body)
      return res.redirect('/admin/buat-akun')
    }
  }

  static async daftarAkun(req, res) {
    try {
      const users = await Admin.getUsers(req.query.search || '')
      return res.render('admin/daftar-akun', { users, search: req.query.search || '' })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat daftar akun')
      return res.redirect('/dashboard')
    }
  }

  static async users(req, res) {
    try {
      const users = await Admin.getUsers(req.query.search || '')
      return res.render('admin/users/index', { users, search: req.query.search || '' })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat data user')
      return res.redirect('/dashboard')
    }
  }

  static createUserPage(req, res) {
    return res.render('admin/users/create')
  }

  static async storeUser(req, res) {
    try {
      const { email, role } = req.body
      if (!email || !role) {
        req.flash('error', 'Email dan role wajib diisi')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/users/create')
      }

      const existing = await Admin.findUserByEmail(email)
      if (existing) {
        req.flash('error', 'Email sudah digunakan')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/users/create')
      }

      await Admin.createUser(req.body)
      req.flash('success', 'User berhasil ditambahkan')
      return res.redirect('/admin/users')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menambahkan user')
      req.flash('oldInput', req.body)
      return res.redirect('/admin/users/create')
    }
  }

  static async editUserPage(req, res) {
    try {
      const user = await Admin.getUserById(req.params.id)
      if (!user) {
        req.flash('error', 'User tidak ditemukan')
        return res.redirect('/admin/users')
      }
      return res.render('admin/users/edit', { user })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat edit user')
      return res.redirect('/admin/users')
    }
  }

  static async updateUser(req, res) {
    try {
      await Admin.updateUser(req.params.id, req.body)
      req.flash('success', 'User berhasil diupdate')
      return res.redirect('/admin/users')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal update user')
      return res.redirect('/admin/users')
    }
  }

  static async deleteUser(req, res) {
    try {
      await Admin.deleteUser(req.params.id)
      req.flash('success', 'User berhasil dihapus')
      return res.redirect('/admin/users')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal hapus user')
      return res.redirect('/admin/users')
    }
  }

  static async inventaris(req, res) {
    try {
      const inventaris = await Admin.getInventaris(req.query.search || '')
      return res.render('admin/inventaris/index', { inventaris, search: req.query.search || '', formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat inventaris')
      return res.redirect('/dashboard')
    }
  }

  static createInventarisPage(req, res) {
    return res.render('admin/inventaris/create')
  }

  static async storeInventaris(req, res) {
    try {
      await Admin.createInventaris(req.body)
      req.flash('success', 'Inventaris berhasil ditambahkan')
      return res.redirect('/admin/inventaris')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menambahkan inventaris')
      req.flash('oldInput', req.body)
      return res.redirect('/admin/inventaris/create')
    }
  }

  static async editInventarisPage(req, res) {
    try {
      const item = await Admin.getInventarisById(req.params.id)
      if (!item) {
        req.flash('error', 'Inventaris tidak ditemukan')
        return res.redirect('/admin/inventaris')
      }
      return res.render('admin/inventaris/edit', { item, formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat edit inventaris')
      return res.redirect('/admin/inventaris')
    }
  }

  static async updateInventaris(req, res) {
    try {
      await Admin.updateInventaris(req.params.id, req.body)
      req.flash('success', 'Inventaris berhasil diupdate')
      return res.redirect('/admin/inventaris')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal update inventaris')
      return res.redirect('/admin/inventaris')
    }
  }

  static async deleteInventaris(req, res) {
    try {
      await Admin.deleteInventaris(req.params.id)
      req.flash('success', 'Inventaris berhasil dihapus')
      return res.redirect('/admin/inventaris')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal hapus inventaris')
      return res.redirect('/admin/inventaris')
    }
  }

  static async ruangan(req, res) {
    try {
      const ruangan = await Admin.getRuangan(req.query.search || '')
      return res.render('admin/ruangan/index', { ruangan, search: req.query.search || '' })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat ruangan')
      return res.redirect('/dashboard')
    }
  }

  static createRuanganPage(req, res) {
    return res.render('admin/ruangan/create')
  }

  static async storeRuangan(req, res) {
    try {
      await Admin.createRuangan(req.body)
      req.flash('success', 'Ruangan berhasil ditambahkan')
      return res.redirect('/admin/ruangan')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menambahkan ruangan')
      req.flash('oldInput', req.body)
      return res.redirect('/admin/ruangan/create')
    }
  }

  static async editRuanganPage(req, res) {
    try {
      const item = await Admin.getRuanganById(req.params.id)
      if (!item) {
        req.flash('error', 'Ruangan tidak ditemukan')
        return res.redirect('/admin/ruangan')
      }
      return res.render('admin/ruangan/edit', { item })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat edit ruangan')
      return res.redirect('/admin/ruangan')
    }
  }

  static async updateRuangan(req, res) {
    try {
      await Admin.updateRuangan(req.params.id, req.body)
      req.flash('success', 'Ruangan berhasil diupdate')
      return res.redirect('/admin/ruangan')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal update ruangan')
      return res.redirect('/admin/ruangan')
    }
  }

  static async deleteRuangan(req, res) {
    try {
      await Admin.deleteRuangan(req.params.id)
      req.flash('success', 'Ruangan berhasil dihapus')
      return res.redirect('/admin/ruangan')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal hapus ruangan')
      return res.redirect('/admin/ruangan')
    }
  }


  static async laporan(req, res) {
    try {
      const laporan = await Admin.getLaporan(req.query.search || '', req.query.status || '', req.query.tanggal || '')
      return res.render('admin/laporan/index', { laporan, search: req.query.search || '', status: req.query.status || '', tanggal: req.query.tanggal || '', formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat laporan pengajuan')
      return res.redirect('/dashboard')
    }
  }

  static async detailLaporan(req, res) {
    try {
      const laporan = await Admin.getLaporanById(req.params.id)

      if (!laporan) {
        req.flash('error', 'Laporan tidak ditemukan')
        return res.redirect('/admin/laporan')
      }

      return res.render('admin/laporan/detail', { laporan, formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat detail laporan')
      return res.redirect('/admin/laporan')
    }
  }

  static async updateKeteranganAdmin(req, res) {
    try {
      const laporan = await Admin.getLaporanById(req.params.id)

      if (!laporan) {
        req.flash('error', 'Laporan tidak ditemukan')
        return res.redirect('/admin/laporan')
      }

      await Admin.updateKeteranganAdmin(req.params.id, req.body.keterangan_admin || '')
      req.flash('success', 'Keterangan admin berhasil disimpan dan bisa dilihat user')
      return res.redirect(`/admin/laporan/detail/${req.params.id}`)
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menyimpan keterangan admin')
      return res.redirect('/admin/laporan')
    }
  }

  static async updateStatusLaporan(req, res) {
    try {
      const { status } = req.body
      const item = await Admin.getLaporanById(req.params.id)

      if (!item) {
        req.flash('error', 'Laporan pengajuan tidak ditemukan')
        return res.redirect('/admin/laporan')
      }

      await Admin.updateStatusLaporan(req.params.id, status)

      const statusText = status === 'selesai' ? 'diselesaikan' : status === 'ditolak' ? 'ditolak' : 'dikembalikan ke proses'
      req.flash('success', `Laporan pengajuan berhasil ${statusText}`)
      return res.redirect('/admin/laporan')
    } catch (err) {
      console.log(err)
      req.flash('error', err.message || 'Gagal update status laporan')
      return res.redirect('/admin/laporan')
    }
  }

  static async rekomendasi(req, res) {
    try {
      const rekomendasi = await Admin.getRekomendasi(req.query.search || '')
      const aiResults = req.session.aiResults || []
      return res.render('admin/rekomendasi/index', { rekomendasi, aiResults, search: req.query.search || '', formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat rekomendasi')
      return res.redirect('/dashboard')
    }
  }

  static async generateRekomendasiAI(req, res) {
    try {
      const data = await Admin.getDataUntukAI()
      const aiResults = await generateRekomendasiDenganOpenAI(data)

      req.session.aiResults = aiResults
      req.flash('success', 'Hasil rekomendasi AI berhasil dibuat. Review dulu, lalu klik Simpan ke Database.')
      return res.redirect('/admin/rekomendasi')
    } catch (err) {
      console.log(err)
      req.flash('error', err.message || 'Gagal generate rekomendasi AI')
      return res.redirect('/admin/rekomendasi')
    }
  }

  static async saveRekomendasiAI(req, res) {
    try {
      const aiResults = req.session.aiResults || []

      if (!aiResults.length) {
        req.flash('error', 'Belum ada hasil AI yang bisa disimpan')
        return res.redirect('/admin/rekomendasi')
      }

      await Admin.simpanRekomendasiAI(aiResults)
      req.session.aiResults = null
      req.flash('success', 'Hasil rekomendasi AI berhasil disimpan ke database')
      return res.redirect('/admin/rekomendasi')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menyimpan hasil rekomendasi AI')
      return res.redirect('/admin/rekomendasi')
    }
  }

  static async clearRekomendasiAI(req, res) {
    req.session.aiResults = null
    req.flash('success', 'Hasil sementara AI dibuang')
    return res.redirect('/admin/rekomendasi')
  }

  static async createRekomendasiPage(req, res) {
    try {
      const ruangan = await Admin.getRuangan()
      return res.render('admin/rekomendasi/create', { ruangan })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat form rekomendasi')
      return res.redirect('/admin/rekomendasi')
    }
  }

  static async storeRekomendasi(req, res) {
    try {
      await Admin.createRekomendasi(req.body)
      req.flash('success', 'Rekomendasi berhasil ditambahkan')
      return res.redirect('/admin/rekomendasi')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal menambahkan rekomendasi')
      return res.redirect('/admin/rekomendasi/create')
    }
  }

  static async editRekomendasiPage(req, res) {
    try {
      const item = await Admin.getRekomendasiById(req.params.id)
      const ruangan = await Admin.getRuangan()
      if (!item) {
        req.flash('error', 'Rekomendasi tidak ditemukan')
        return res.redirect('/admin/rekomendasi')
      }
      return res.render('admin/rekomendasi/edit', { item, ruangan, formatDate })
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal memuat edit rekomendasi')
      return res.redirect('/admin/rekomendasi')
    }
  }

  static async updateRekomendasi(req, res) {
    try {
      await Admin.updateRekomendasi(req.params.id, req.body)
      req.flash('success', 'Rekomendasi berhasil diupdate')
      return res.redirect('/admin/rekomendasi')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal update rekomendasi')
      return res.redirect('/admin/rekomendasi')
    }
  }

  static async deleteRekomendasi(req, res) {
    try {
      await Admin.deleteRekomendasi(req.params.id)
      req.flash('success', 'Rekomendasi berhasil dihapus')
      return res.redirect('/admin/rekomendasi')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal hapus rekomendasi')
      return res.redirect('/admin/rekomendasi')
    }
  }

static async exportInventarisPDF(req, res) {
  try {
    const inventaris = await Admin.getInventaris('')

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 28
    })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))

    const columns = [
      { label: 'No', key: 'no', width: 30 },
      { label: 'Kode Barang', key: 'kode_barang', width: 85 },
      { label: 'NUP', key: 'nup', width: 55 },
      { label: 'Nama Barang', key: 'nama_barang', width: 160 },
      { label: 'Merk', key: 'merk', width: 90 },
      { label: 'Tipe', key: 'tipe', width: 90 },
      { label: 'Kategori', key: 'kategori', width: 85 },
      { label: 'Tgl Buku', key: 'tanggal_buku_pertama', width: 85 },
      { label: 'Tgl Perolehan', key: 'tanggal_perolehan', width: 105 }
    ]

    const pageBottom = doc.page.height - doc.page.margins.bottom
    const tableLeft = doc.page.margins.left
    let y = doc.page.margins.top

    const drawHeader = () => {
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#111827')
        .text('LAPORAN DATA INVENTARIS', tableLeft, y, { align: 'center' })

      y += 20

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#4b5563')
        .text('Sistem Manajemen Inventaris', tableLeft, y, { align: 'center' })

      y += 24

      doc
        .fontSize(9)
        .fillColor('#111827')
        .text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, tableLeft, y)

      y += 20
    }

    const drawTableHeader = () => {
      let x = tableLeft
      const headerHeight = 22

      doc.rect(tableLeft, y, columns.reduce((sum, column) => sum + column.width, 0), headerHeight).fill('#2563eb')

      columns.forEach(column => {
        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#ffffff')
          .text(column.label, x + 4, y + 7, {
            width: column.width - 8,
            align: 'center'
          })

        x += column.width
      })

      y += headerHeight
    }

    const drawCellBorder = (x, rowY, width, height) => {
      doc
        .lineWidth(0.5)
        .strokeColor('#cbd5e1')
        .rect(x, rowY, width, height)
        .stroke()
    }

    const drawRow = (row, index) => {
      const values = columns.map(column => String(row[column.key] || '-'))
      const rowHeight = Math.max(
        24,
        ...values.map((value, columnIndex) => {
          return doc.heightOfString(value, {
            width: columns[columnIndex].width - 8,
            align: columnIndex === 0 ? 'center' : 'left'
          }) + 10
        })
      )

      if (y + rowHeight > pageBottom) {
        doc.addPage()
        y = doc.page.margins.top
        drawTableHeader()
      }

      let x = tableLeft

      if (index % 2 === 1) {
        doc
          .rect(tableLeft, y, columns.reduce((sum, column) => sum + column.width, 0), rowHeight)
          .fill('#f8fafc')
      }

      values.forEach((value, columnIndex) => {
        drawCellBorder(x, y, columns[columnIndex].width, rowHeight)
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#111827')
          .text(value, x + 4, y + 5, {
            width: columns[columnIndex].width - 8,
            align: columnIndex === 0 ? 'center' : 'left'
          })

        x += columns[columnIndex].width
      })

      y += rowHeight
    }

    const rows = inventaris.map((item, index) => ({
      no: index + 1,
      kode_barang: item.kode_barang || '-',
      nup: item.nup || '-',
      nama_barang: item.nama_barang || '-',
      merk: item.merk || '-',
      tipe: item.tipe || '-',
      kategori: item.kategori || '-',
      tanggal_buku_pertama: formatDate(item.tanggal_buku_pertama) || '-',
      tanggal_perolehan: formatDate(item.tanggal_perolehan) || '-'
    }))

    drawHeader()
    drawTableHeader()

    if (rows.length === 0) {
      drawRow({
        no: '-',
        kode_barang: 'Data inventaris kosong',
        nup: '-',
        nama_barang: '-',
        merk: '-',
        tipe: '-',
        kategori: '-',
        tanggal_buku_pertama: '-',
        tanggal_perolehan: '-'
      }, 0)
    } else {
      rows.forEach(drawRow)
    }

    y += 14
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#111827')
      .text(`Total Data: ${inventaris.length}`, tableLeft, y, { align: 'right' })

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
      doc.end()
    })

    res.setHeader('Content-Type', 'application/pdf')

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=laporan-inventaris.pdf'
    )

    return res.send(pdfBuffer)

  } catch (err) {

    console.log(err)

    req.flash('error', 'Gagal export PDF')

    return res.redirect('/admin/inventaris')

  }
}



static async exportInventarisExcel(req, res) {
  try {

    const inventaris = await Admin.getInventaris('')

    let csv = ''

    csv += 'No,Kode Barang,NUP,Nama Barang,Merk,Tipe,Kategori,Tanggal Buku,Tanggal Perolehan\n'

    inventaris.forEach((item, index) => {

      csv += `${index + 1},`
      csv += `"${item.kode_barang || '-'}",`
      csv += `"${item.nup || '-'}",`
      csv += `"${item.nama_barang || '-'}",`
      csv += `"${item.merk || '-'}",`
      csv += `"${item.tipe || '-'}",`
      csv += `"${item.kategori || '-'}",`
      csv += `"${formatDate(item.tanggal_buku_pertama) || '-'}",`
      csv += `"${formatDate(item.tanggal_perolehan) || '-'}"\n`

    })

    res.setHeader('Content-Type', 'text/csv')

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=laporan-inventaris.csv'
    )

    return res.send(csv)

  } catch (err) {

    console.log(err)

    req.flash('error', 'Gagal export Excel')

    return res.redirect('/admin/inventaris')

  }
}



static async exportInventarisWord(req, res) {
  try {

    const inventaris = await Admin.getInventaris('')

    let html = `
    <!DOCTYPE html>
    <html lang="id">

    <head>

      <meta charset="UTF-8">

      <style>

        body{
          font-family:Arial;
          padding:20px;
        }

        h1{
          text-align:center;
          margin-bottom:20px;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        table, th, td{
          border:1px solid black;
        }

        th{
          background:#2563eb;
          color:white;
        }

        th, td{
          padding:8px;
          font-size:12px;
        }

      </style>

    </head>

    <body>

      <h1>Laporan Data Inventaris</h1>

      <table>

        <tr>
          <th>No</th>
          <th>Kode Barang</th>
          <th>NUP</th>
          <th>Nama Barang</th>
          <th>Merk</th>
          <th>Tipe</th>
          <th>Kategori</th>
          <th>Tanggal Buku</th>
          <th>Tanggal Perolehan</th>
        </tr>
    `

    inventaris.forEach((item, index) => {

      html += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.kode_barang || '-'}</td>
        <td>${item.nup || '-'}</td>
        <td>${item.nama_barang || '-'}</td>
        <td>${item.merk || '-'}</td>
        <td>${item.tipe || '-'}</td>
        <td>${item.kategori || '-'}</td>
        <td>${formatDate(item.tanggal_buku_pertama) || '-'}</td>
        <td>${formatDate(item.tanggal_perolehan) || '-'}</td>
      </tr>
      `

    })

    html += `
      </table>

    </body>

    </html>
    `

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=laporan-inventaris.doc'
    )

    return res.send(html)

  } catch (err) {

    console.log(err)

    req.flash('error', 'Gagal export Word')

    return res.redirect('/admin/inventaris')

  }
}
  


  static pengaturan(req, res) {
    return res.render('admin/pengaturan', {
      admin: req.session.user || {}
    })
  }

  static logout(req, res) {
    req.session.destroy(() => {
      return res.redirect('/login')
    })
  }
}

module.exports = AdminController
