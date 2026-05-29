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

module.exports = {
  formatDate,
  paginateRows,
  safeJsonParse,
  normalizePromptKey,
  getLaporanTime,
  pilihLaporanTerbaru,
  cariTanggalLaporanTerbaru,
  buatPromptRekomendasiAI,
  generateRekomendasiDenganOpenAI
}