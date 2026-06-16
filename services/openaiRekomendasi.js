const OpenAI = require('openai')

const allowedPrioritas = [
  'Penting dan Mendesak',
  'Penting tapi Tidak Mendesak',
  'Tidak Penting tapi Mendesak',
  'Tidak Penting dan Tidak Mendesak'
]

function toCleanText(value, maxLen = 600) {
  if (value === undefined || value === null) return ''
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text.length > maxLen ? text.slice(0, maxLen) : text
}

function buildInput(laporanRows) {
  return laporanRows.map((l) => ({
    id: l.id,
    kode_laporan: l.kode_laporan || null,
    waktu_laporan: l.waktu_laporan || null,
    kategori_laporan: l.kategori_laporan || null,
    NUP: l.NUP || null,
    nama_barang: l.nama_barang || null,
    merk: l.merk || null,
    tipe: l.tipe || null,
    kategori_inventaris: l.kategori_inventaris || null,
    kondisi: l.kondisi === undefined ? null : l.kondisi,
    deskripsi: toCleanText(l.deskripsi, 800)
  }))
}

function safeParseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

async function rekomendasiPrioritasLaporan(laporanRows) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY belum diatur')
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const client = new OpenAI({ apiKey })

  const input = buildInput(laporanRows)

  const system = `Anda adalah asisten untuk memberi rekomendasi prioritas laporan kerusakan/kehilangan inventaris.
Aturan:
- Pilih laporan yang paling perlu diprioritaskan terlebih dahulu.
- Kembalikan maksimal 7 item.
- prioritas_saran HARUS salah satu dari: ${allowedPrioritas.map((p) => `"${p}"`).join(', ')}.
- alasan_singkat maksimal 180 karakter.
- Output HARUS JSON valid sesuai skema.`

  const user = {
    laporan: input
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Buat rekomendasi prioritas dari data berikut dan kembalikan JSON:
{
  "rekomendasi": [
    {
      "id": number,
      "kode_laporan": string|null,
      "kategori_laporan": string|null,
      "nama_barang": string|null,
      "merk": string|null,
      "tipe": string|null,
      "kategori_inventaris": string|null,
      "kondisi": number|null,
      "prioritas_saran": string,
      "alasan_singkat": string
    }
  ]
}
Data: ${JSON.stringify(user)}`
      }
    ]
  })

  const text = completion.choices?.[0]?.message?.content || ''
  const parsed = safeParseJson(text)

  const list = Array.isArray(parsed?.rekomendasi) ? parsed.rekomendasi : []
  const cleaned = list
    .filter((x) => x && Number.isFinite(Number(x.id)) && allowedPrioritas.includes(String(x.prioritas_saran)))
    .slice(0, 15)
    .map((x) => ({
      id: Number(x.id),
      kode_laporan: x.kode_laporan ?? null,
      kategori_laporan: x.kategori_laporan ?? null,
      nama_barang: x.nama_barang ?? null,
      merk: x.merk ?? null,
      tipe: x.tipe ?? null,
      kategori_inventaris: x.kategori_inventaris ?? null,
      kondisi: x.kondisi === undefined || x.kondisi === null ? null : Number(x.kondisi),
      prioritas_saran: String(x.prioritas_saran),
      alasan_singkat: toCleanText(x.alasan_singkat, 180)
    }))

  return cleaned
}

module.exports = { rekomendasiPrioritasLaporan, allowedPrioritas }
