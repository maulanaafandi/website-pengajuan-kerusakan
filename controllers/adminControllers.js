const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
const PDFDocument = require('pdfkit')
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

function normalizePromptKey(value) {
  return String(value || '-').trim().toLowerCase()
}

function getLaporanTime(item) {
  const tanggal = String(item.tanggal || '')
  const match = tanggal.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const time = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime()
    : new Date(item.tanggal || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

function pilihLaporanTerbaru(laporan = []) {
  const latestByKey = new Map()

  laporan.forEach(item => {
    const key = [
      item.id_ruangan || normalizePromptKey(item.nama_ruangan),
      normalizePromptKey(item.nama_barang || item.kode_barang),
      normalizePromptKey(item.kondisi)
    ].join('|')

    const current = latestByKey.get(key)
    const itemTime = getLaporanTime(item)
    const currentTime = current ? getLaporanTime(current) : 0
    const itemId = Number(item.id_laporan || 0)
    const currentId = current ? Number(current.id_laporan || 0) : 0

    if (!current || itemTime > currentTime || (itemTime === currentTime && itemId > currentId)) {
      latestByKey.set(key, item)
    }
  })

  return Array.from(latestByKey.values()).sort((a, b) => {
    const dateDiff = getLaporanTime(b) - getLaporanTime(a)
    if (dateDiff !== 0) return dateDiff
    return Number(b.id_laporan || 0) - Number(a.id_laporan || 0)
  })
}

function cariTanggalLaporanTerbaru(rekomendasi, laporan = []) {
  const idRuangan = rekomendasi.id_ruangan ? String(rekomendasi.id_ruangan) : ''
  const barang = normalizePromptKey(rekomendasi.nama_barang || rekomendasi.barang_rekomendasi_diajukan)

  const cocok = laporan.find(item => {
    const sameRoom = idRuangan && String(item.id_ruangan || '') === idRuangan
    const itemBarang = normalizePromptKey(item.nama_barang || item.kode_barang)
    const sameBarang = barang && barang !== '-' && itemBarang !== '-' && (
      barang.includes(itemBarang) || itemBarang.includes(barang)
    )

    return sameRoom && sameBarang
  })

  if (cocok) return cocok.tanggal || null

  const sameRoom = laporan.find(item => idRuangan && String(item.id_ruangan || '') === idRuangan)
  return sameRoom ? sameRoom.tanggal || null : (laporan[0] ? laporan[0].tanggal || null : null)
}

function buatPromptRekomendasiAI(data) {
  const laporanTerbaru = pilihLaporanTerbaru(data.laporan || [])

  const laporanText = laporanTerbaru.map((item, index) => {
    return `${index + 1}. Tanggal: ${item.tanggal || '-'} | Ruangan: ${item.nama_ruangan || '-'} (${item.lokasi || '-'}) | Barang laporan: ${item.nama_barang || '-'} | Kondisi: ${item.kondisi || '-'} | Status: ${item.status || '-'} | Keterangan user: ${item.keterangan || '-'}`
  }).join('\n')

  const inventarisText = (data.inventaris || []).map((item, index) => {
    return `${index + 1}. ${item.nama_barang || '-'} | Merk/Tipe: ${item.merk || item.tipe || '-'} | Kategori: ${item.kategori || '-'} | Ruangan: ${item.nama_ruangan || '-'} | Lokasi: ${item.lokasi || '-'}`
  }).join('\n')

  const ruanganText = (data.ruangan || []).map((item, index) => {
    return `${index + 1}. id_ruangan=${item.id_ruangan}, ${item.nama_ruangan || '-'}, ${item.kode_ruangan || '-'}, lokasi ${item.lokasi || '-'}`
  }).join('\n')

  return `
Anda adalah asisten admin sistem pengajuan barang inventaris kampus.
Tugas Anda hanya membuat rekomendasi pengajuan barang berdasarkan laporan user terbaru dan data inventaris.
Jangan membuat penjelasan panjang. Kembalikan JSON array valid saja.

Aturan output JSON:
[
  {
    "id_ruangan": 1,
    "nama_ruangan": "Ruang Lab 1",
    "lokasi": "pamolokan",
    "tanggal": "2026-05-18",
    "barang_rekomendasi_diajukan": "LCD Projector/Infocus, Kabel HDMI, Adaptor Proyektor",
    "nama_barang": "LCD Projector/Infocus",
    "alasan": "Banyak laporan terkait proyektor/layer mati pada ruangan tersebut dan inventaris pendukung perlu dicek/diajukan."
  }
]

Ketentuan:
- Pilih id_ruangan yang tersedia dari daftar ruangan.
- Abaikan duplikasi laporan lama. Jika ada laporan lama dan baru untuk ruangan, barang, dan kondisi yang sama, gunakan laporan terbaru saja.
- Isi tanggal dengan tanggal laporan terbaru yang menjadi dasar rekomendasi, bukan tanggal hari ini.
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
  const laporanTerbaru = pilihLaporanTerbaru(data.laporan || [])

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
    tanggal: item.tanggal || cariTanggalLaporanTerbaru(item, laporanTerbaru),
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
      const allUsers = await Admin.getUsers(req.query.search || '')
      const { rows: users, pagination } = paginateRows(allUsers, req.query)
      return res.render('admin/users/index', { users, pagination, search: req.query.search || '' })
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

      if (user.role === 'admin') {
        req.flash('error', 'Akun admin tidak bisa diedit')
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
      const user = await Admin.getUserById(req.params.id)
      if (!user) {
        req.flash('error', 'User tidak ditemukan')
        return res.redirect('/admin/users')
      }

      if (user.role === 'admin') {
        req.flash('error', 'Akun admin tidak bisa diedit')
        return res.redirect('/admin/users')
      }

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
      const user = await Admin.getUserById(req.params.id)
      if (!user) {
        req.flash('error', 'User tidak ditemukan')
        return res.redirect('/admin/users')
      }

      if (user.role === 'admin') {
        req.flash('error', 'Akun admin tidak bisa dihapus')
        return res.redirect('/admin/users')
      }

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
      const allInventaris = await Admin.getInventaris(req.query.search || '')
      const { rows: inventaris, pagination } = paginateRows(allInventaris, req.query)
      return res.render('admin/inventaris/index', { inventaris, pagination, search: req.query.search || '', formatDate })
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
      const allRuangan = await Admin.getRuangan(req.query.search || '')
      const { rows: ruangan, pagination } = paginateRows(allRuangan, req.query)
      return res.render('admin/ruangan/index', { ruangan, pagination, search: req.query.search || '' })
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

      if (item.status === 'selesai') {
        req.flash('error', 'Laporan yang sudah selesai tidak bisa diupdate lagi')
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
      const allRekomendasi = await Admin.getRekomendasi(req.query.search || '')
      const { rows: rekomendasi, pagination } = paginateRows(allRekomendasi, req.query)
      const aiResults = req.session.aiResults || []
      return res.render('admin/rekomendasi/index', { rekomendasi, pagination, aiResults, search: req.query.search || '', formatDate })
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
