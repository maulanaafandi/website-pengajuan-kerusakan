const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { getWaktuLaporSemester } = require('../../../middleware/generateWaktuLaporSemester')
const { rekomendasiTriaseLaporan, rekomendasiPengadaan } = require('../../../services/openaiRekomendasi')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

function deleteUploadedFile(file) {
  if (!file?.filename) return
  try {
    const filePath = path.join(__dirname, '../../../public/uploads', file.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (_) {}
}

router.get('/API/semester-pengajuan-pengadaan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const result = await Laporan.getSemesterOptionsPengajuanPengadaanKaleb(req.user.id)
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/pengajuan-pengadaan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const { result, pagination } = await Laporan.getAllPengajuanPengadaanKaleb(
      req.user.id,
      req.query.page,
      req.query.limit,
      req.query.semester
    )
    res.status(200).json({ result, pagination })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/cari-pengajuan-pengadaan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const { result, pagination } = await Laporan.cariPengajuanPengadaanKaleb(
      req.user.id,
      req.query.keyword,
      req.query.page,
      req.query.limit,
      req.query.semester
    )
    res.status(200).json({ result, pagination })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/detail-pengajuan-pengadaan-kaleb/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const data = await Laporan.getLaporanPengadaanByIdKaleb(req.params.id, req.user.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail pengajuan pengadaan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/update-pengajuan-pengadaan-kaleb/:id', verifyToken, authorize(['dosen']), upload.single('foto_selesai'), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      deleteUploadedFile(req.file)
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const { status, spesifikasi, harga, jumlah, keterangan } = req.body || {}

    const affectedRows = await Laporan.updatePengajuanPengadaanKaleb(
      req.params.id,
      req.user.id,
      {
        status,
        spesifikasi,
        harga,
        jumlah,
        keterangan
      },
      {
        teknisiId: req.user.id,
        fotoSelesai: req.file ? req.file.filename : null
      }
    )

    if (!affectedRows) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Laporan tidak ditemukan atau tidak bisa diperbarui' })
    }

    res.status(200).json({ message: 'Laporan berhasil diperbarui' })
  } catch (err) {
    deleteUploadedFile(req.file)
    if (err.message === 'Status tidak valid' ||
        err.message === 'Keterangan diperlukan.' ||
        err.message === 'Foto selesai diperlukan.' ||
        err.message === 'Spesifikasi diperlukan.' ||
        err.message === 'Harga diperlukan.' ||
        err.message === 'Jumlah diperlukan.') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/ai-triase-laporan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const semester = req.body.semester || undefined
    const laporanRows = await Laporan.getLaporanUntukTriaseAiKaleb(req.user.id, semester)

    if (!laporanRows.length) {
      return res.status(200).json({ message: 'Tidak ada laporan baru untuk ditriase.', rekomendasi: [] })
    }

    const waktuSekarang = new Date().toISOString()
    const rekomendasi = await rekomendasiTriaseLaporan(laporanRows, waktuSekarang)

    res.status(200).json({
      message: `Triase AI selesai. ${rekomendasi.length} rekomendasi diberikan. Silakan review dan validasi.`,
      rekomendasi
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/ai-rekomendasi-pengadaan-kaleb/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const laporan = await Laporan.getLaporanPengadaanByIdUntukAiKaleb(req.params.id, req.user.id)

    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan.' })
    }

    const idRuangan = laporan.id_ruangan
    const konteksLab = idRuangan ? await Laporan.getKonteksLabUntukPengadaan(idRuangan) : {
      nama_ruangan: null,
      kode_ruangan: null,
      total_inventaris: 0,
      daftar_barang: []
    }

    const rekomendasi = await rekomendasiPengadaan(laporan, konteksLab)

    if (!rekomendasi) {
      return res.status(500).json({ message: 'Gagal mendapatkan rekomendasi AI.' })
    }

    res.status(200).json({ data: rekomendasi })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/kehilangan-pending-pengadaan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const { result, pagination } = await Laporan.getKehilanganPendingUntukPengadaanKaleb(
      req.user.id,
      req.query.semester,
      req.query.page,
      req.query.limit
    )
    res.status(200).json({ result, pagination })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
