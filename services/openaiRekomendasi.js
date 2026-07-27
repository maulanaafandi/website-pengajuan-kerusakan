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

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY belum diatur')
  return new OpenAI({ apiKey })
}

function getModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}

const SYSTEM_CONTEXT_PENS = `Anda adalah asisten AI untuk sistem manajemen inventaris di PENS (Politeknik Elektronika Negeri Surabaya) PSDKU Sumenep.
Konteks kampus:
- PENS adalah Perguruan Tinggi Negeri di bawah Kemendikbudristek, pengadaan menggunakan APBN.
- Semester Ganjil: Agustus-Januari, Semester Genap: Februari-Juli.
- Pengadaan barang dilakukan di akhir semester.
- Ruangan terdiri dari Lab komputer, Studio Multimedia, Kelas, dan Gudang.
- PLP adalah bagian yang memperbaiki barang. Kaleb (Kepala Lab) adalah dosen yang mengawasi ruangan.

Aturan pengadaan pemerintah yang WAJIB dipatuhi:
- Perpres 46/2025: Wajib prioritaskan Produk Dalam Negeri (PDN).
- TKDN + BMP minimal 40%. Jika tidak tersedia, minimal TKDN 25%.
- PP 29/2018: Kewajiban penggunaan PDN di instansi pemerintah.
- Produk impor hanya jika tidak ada alternatif lokal.
- Brand lokal ber-TKDN tinggi untuk IT: ADVAN, AXIOO, ZYREX.
- Gunakan E-Katalog jika tersedia.

PENTING: Anda TIDAK bisa memverifikasi tingkat kerusakan secara fisik. PLP harus cek manual terlebih dahulu. Jangan langsung menyimpulkan bahwa barang harus masuk pengadaan kecuali PLP sudah memvalidasi tingkat kerusakan sebagai rusak_total.`

function buildTriaseInput(laporanRows) {
  return laporanRows.map((l) => ({
    id: l.id,
    kode_laporan: l.kode_laporan || null,
    waktu_laporan: l.waktu_lapor || l.waktu_laporan || null,
    kategori_laporan: l.kategori || l.kategori_laporan || null,
    nama_barang: l.nama_barang || null,
    merk: l.merk || null,
    tipe: l.tipe || null,
    kategori_inventaris: l.kategori_inventaris || l.kategori_barang || null,
    tingkat_kerusakan: l.tingkat_kerusakan || null,
    deskripsi: toCleanText(l.deskripsi, 800),
    nama_ruangan: l.nama_ruangan || null,
    kode_ruangan: l.kode_ruangan || null,
    tanggal_perolehan: l.tanggal_perolehan || null
  }))
}

async function rekomendasiTriaseLaporan(laporanRows, waktuSekarang) {
  const client = getClient()
  const input = buildTriaseInput(laporanRows)
  if (!input.length) return []

  const system = `${SYSTEM_CONTEXT_PENS}

Tugas Anda: Berikan REKOMENDASI triase (klasifikasi jalur + prioritas) pada laporan inventaris yang masuk.
Ini hanya rekomendasi — PLP/Kaleb yang akan memvalidasi dan memutuskan.

Aturan klasifikasi jalur:
1. kategori "kerusakan" dengan tingkat_kerusakan ringan/sedang/berat → jalur "perbaikan" (PLP harus cek fisik dulu)
2. kategori "kerusakan" dengan tingkat_kerusakan "rusak_total" → jalur "pengadaan" (TAPI PLP harus validasi dulu apakah memang benar rusak total)
3. kategori "kehilangan" → jalur "pending_kehilangan" (tunggu minimal 2 bulan sebelum bisa masuk pengadaan)
4. kategori "barang_baru" → jalur "pengadaan" (evaluasi apakah relevan dengan fungsi ruangan)

Aturan prioritas (Eisenhower Matrix):
- "Penting dan Mendesak": Barang krusial untuk kegiatan akademik (PC lab, projector) + kerusakan berat/rusak total
- "Penting tapi Tidak Mendesak": Barang penting tapi masih bisa ditunda (AC, kursi cadangan)
- "Tidak Penting tapi Mendesak": Barang pendukung yang perlu segera (lampu, kabel)
- "Tidak Penting dan Tidak Mendesak": Barang non-esensial (dekorasi, barang gudang)

Pertimbangkan:
- Semakin lama laporan belum ditangani, semakin mendesak
- Barang lab aktif > barang gudang
- PC/projector untuk pembelajaran > furnitur
- Untuk kerusakan: SELALU ingatkan PLP untuk validasi fisik terlebih dahulu

Waktu sekarang: ${waktuSekarang}

Output HARUS JSON valid:
{
  "rekomendasi": [
    {
      "id": number,
      "jalur": "perbaikan" | "pengadaan" | "pending_kehilangan",
      "prioritas_saran": string (salah satu dari 4 prioritas di atas),
      "alasan_singkat": string (maks 180 karakter),
      "catatan_untuk_plp": string (maks 200 karakter, WAJIB ingatkan untuk cek fisik jika kerusakan)
    }
  ]
}`

  const completion = await client.chat.completions.create({
    model: getModel(),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Triase laporan berikut:\n${JSON.stringify({ laporan: input })}` }
    ]
  })

  const text = completion.choices?.[0]?.message?.content || ''
  const parsed = safeParseJson(text)
  const list = Array.isArray(parsed?.rekomendasi) ? parsed.rekomendasi : []

  const allowedJalur = ['perbaikan', 'pengadaan', 'pending_kehilangan']

  return list
    .filter((x) =>
      x &&
      Number.isFinite(Number(x.id)) &&
      allowedJalur.includes(String(x.jalur)) &&
      allowedPrioritas.includes(String(x.prioritas_saran))
    )
    .map((x) => ({
      id: Number(x.id),
      jalur: String(x.jalur),
      prioritas_saran: String(x.prioritas_saran),
      alasan_singkat: toCleanText(x.alasan_singkat, 180),
      catatan_untuk_plp: toCleanText(x.catatan_untuk_plp, 200)
    }))
}

function buildPrioritasInput(laporanRows) {
  return laporanRows.map((l) => ({
    id: l.id,
    kode_laporan: l.kode_laporan || null,
    waktu_laporan: l.waktu_lapor || l.waktu_laporan || null,
    kategori_laporan: l.kategori || l.kategori_laporan || null,
    NUP: l.NUP || null,
    nama_barang: l.nama_barang || null,
    merk: l.merk || null,
    tipe: l.tipe || null,
    kategori_inventaris: l.kategori_inventaris || l.kategori_barang || null,
    tingkat_kerusakan: l.tingkat_kerusakan || null,
    deskripsi: toCleanText(l.deskripsi, 800)
  }))
}

async function rekomendasiPrioritasLaporan(laporanRows) {
  const client = getClient()
  const input = buildPrioritasInput(laporanRows)
  if (!input.length) return []

  const system = `${SYSTEM_CONTEXT_PENS}

Tugas: Beri rekomendasi prioritas laporan kerusakan/kehilangan inventaris.
- Pilih laporan yang paling perlu diprioritaskan terlebih dahulu.
- Kembalikan maksimal 7 item.
- prioritas_saran HARUS salah satu dari: ${allowedPrioritas.map((p) => `"${p}"`).join(', ')}.
- alasan_singkat maksimal 180 karakter.
- Output HARUS JSON valid sesuai skema.`

  const completion = await client.chat.completions.create({
    model: getModel(),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Buat rekomendasi prioritas dari data berikut dan kembalikan JSON:\n{\n  "rekomendasi": [\n    {\n      "id": number,\n      "kode_laporan": string|null,\n      "kategori_laporan": string|null,\n      "nama_barang": string|null,\n      "merk": string|null,\n      "tipe": string|null,\n      "kategori_inventaris": string|null,\n      "prioritas_saran": string,\n      "alasan_singkat": string\n    }\n  ]\n}\nData: ${JSON.stringify({ laporan: input })}`
      }
    ]
  })

  const text = completion.choices?.[0]?.message?.content || ''
  const parsed = safeParseJson(text)
  const list = Array.isArray(parsed?.rekomendasi) ? parsed.rekomendasi : []

  return list
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
      prioritas_saran: String(x.prioritas_saran),
      alasan_singkat: toCleanText(x.alasan_singkat, 180)
    }))
}

async function rekomendasiPengadaan(laporanData, konteksLab) {
  const client = getClient()

  const input = {
    laporan: {
      id: laporanData.id,
      kode_laporan: laporanData.kode_laporan || null,
      kategori_laporan: laporanData.kategori || laporanData.kategori_laporan || null,
      nama_barang: laporanData.nama_barang || null,
      merk: laporanData.merk || null,
      tipe: laporanData.tipe || null,
      tingkat_kerusakan: laporanData.tingkat_kerusakan || null,
      deskripsi: toCleanText(laporanData.deskripsi, 800),
      nama_ruangan: laporanData.nama_ruangan || null,
      kode_ruangan: laporanData.kode_ruangan || null
    },
    konteks_ruangan: {
      nama_ruangan: konteksLab.nama_ruangan || null,
      kode_ruangan: konteksLab.kode_ruangan || null,
      total_inventaris: konteksLab.total_inventaris || 0,
      daftar_barang: (konteksLab.daftar_barang || []).map((b) => ({
        nama_barang: b.nama_barang,
        merk: b.merk,
        jumlah: b.jumlah
      }))
    }
  }

  const system = `${SYSTEM_CONTEXT_PENS}

Tugas: Evaluasi kelayakan pengadaan barang dan berikan rekomendasi spesifikasi + harga.
Ini hanya rekomendasi — Kaleb/PLP yang memutuskan final.

Aturan evaluasi:
1. Cek apakah jenis barang sesuai dengan fungsi ruangan (Lab komputer → PC/monitor wajar, bukan piano)
2. Cek jumlah barang existing di ruangan (jangan over-supply)
3. Untuk Lab: kapasitas standar 30-35 mahasiswa
4. Barang habis pakai boleh diadakan kapan saja jika stok menipis
5. Harga harus realistis sesuai pasar Indonesia
6. WAJIB rekomendasikan produk yang memenuhi TKDN+BMP >= 40%
7. Jika tidak ada produk TKDN >= 40%, rekomendasikan TKDN minimal 25%
8. Prioritaskan brand lokal: ADVAN, AXIOO, ZYREX untuk perangkat IT

Output HARUS JSON valid:
{
  "layak": boolean,
  "alasan": string (maks 300 karakter),
  "spesifikasi_saran": string (detail spesifikasi teknis),
  "estimasi_harga_satuan": number (dalam Rupiah),
  "jumlah_saran": number,
  "catatan_tkdn": string (rekomendasi terkait TKDN dan brand),
  "regulasi_terkait": string (peraturan yang relevan)
}`

  const completion = await client.chat.completions.create({
    model: getModel(),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Evaluasi pengadaan berikut:\n${JSON.stringify(input)}` }
    ]
  })

  const text = completion.choices?.[0]?.message?.content || ''
  const parsed = safeParseJson(text)

  if (!parsed) return null

  return {
    layak: !!parsed.layak,
    alasan: toCleanText(parsed.alasan, 300),
    spesifikasi_saran: toCleanText(parsed.spesifikasi_saran, 1000),
    estimasi_harga_satuan: Number(parsed.estimasi_harga_satuan) || 0,
    jumlah_saran: Number(parsed.jumlah_saran) || 1,
    catatan_tkdn: toCleanText(parsed.catatan_tkdn, 500),
    regulasi_terkait: toCleanText(parsed.regulasi_terkait, 300)
  }
}

module.exports = {
  rekomendasiTriaseLaporan,
  rekomendasiPrioritasLaporan,
  rekomendasiPengadaan,
  allowedPrioritas
}
