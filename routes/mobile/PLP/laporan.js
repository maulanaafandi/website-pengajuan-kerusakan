const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { getWaktuLaporSemester } = require('../../../middleware/generateWaktuLaporSemester')

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

router.get('/API/semester-riwayat-laporan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getSemesterOptionsRiwayatLaporanPlp()
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.getAllRiwayatLaporanPlp(
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

router.get('/API/cari-laporan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.cariRiwayatLaporanPlp(
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

router.get('/API/detail-laporan-plp/:id', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const data = await Laporan.getLaporanByIdPlp(req.params.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail laporan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/status-laporan-options', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = ['diproses_internal', 'diproses_eksternal', 'ditolak', 'selesai']
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/update-laporan-plp/:id', verifyToken, authorize(['plp']), upload.single('foto_selesai'), async (req, res) => {
  try {
    const { tingkat_kerusakan, status, prioritas, keterangan, spesifikasi, harga, jumlah } = req.body || {}

    if (tingkat_kerusakan === undefined && status === undefined && prioritas === undefined && spesifikasi === undefined && harga === undefined && jumlah === undefined) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Minimal satu field diperlukan.' })
    }

    if (status === 'selesai') {
      if (keterangan === undefined || String(keterangan).trim() === '') {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Keterangan diperlukan.' })
      }
      if (!req.file) {
        return res.status(400).json({ message: 'Foto selesai diperlukan.' })
      }
    }

    if (status === 'ditolak') {
      if (keterangan === undefined || String(keterangan).trim() === '') {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Keterangan diperlukan.' })
      }
    }

    const affectedRows = await Laporan.updateLaporanByPlp(
      req.params.id,
      {
        tingkat_kerusakan,
        status,
        prioritas,
        keterangan: (status === 'selesai' || status === 'ditolak') ? String(keterangan).trim() : undefined,
        spesifikasi,
        harga,
        jumlah
      },
      {
        teknisiId: (status === 'selesai' || status === 'ditolak') ? req.user.id : null,
        fotoSelesai: status === 'selesai' && req.file ? req.file.filename : null
      }
    )

    if (!affectedRows) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Laporan tidak ditemukan.' })
    }

    res.status(200).json({ message: 'Laporan berhasil diperbarui' })
  } catch (err) {
    deleteUploadedFile(req.file)
    if (err.message === 'Tingkat kerusakan tidak valid' ||
        err.message === 'Status tidak valid' ||
        err.message === 'Prioritas tidak valid' ||
        err.message === 'Minimal satu field diperlukan' ||
        err.message === 'Spesifikasi diperlukan.' ||
        err.message === 'Harga diperlukan.' ||
        err.message === 'Jumlah diperlukan.') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
