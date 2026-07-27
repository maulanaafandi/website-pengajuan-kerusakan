const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { getWaktuLaporSemester } = require('../../../middleware/generateWaktuLaporSemester')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

const deleteUploadedFile = (file) => {
  if (file) {
    const filePath = path.join(__dirname, '../../../public/uploads', file.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

router.get('/API/semester-laporan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const result = await Laporan.getSemesterOptionsRiwayatLaporanKaleb(req.user.id)
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const { result, pagination } = await Laporan.getAllRiwayatLaporanKalebPaginated(
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

router.get('/API/cari-laporan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const { result, pagination } = await Laporan.cariRiwayatLaporanKaleb(
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

router.get('/API/detail-laporan-kaleb/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const data = await Laporan.getLaporanByIdKaleb(req.params.id, req.user.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail laporan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})



router.patch('/API/update-laporan-kaleb/:id', verifyToken, authorize(['dosen']), upload.single('foto_selesai'), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      deleteUploadedFile(req.file)
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const { tingkat_kerusakan, status, prioritas, keterangan } = req.body || {}

    if (tingkat_kerusakan === undefined && status === undefined && prioritas === undefined) {
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

    const affectedRows = await Laporan.updateLaporanByKaleb(
      req.params.id,
      req.user.id,
      {
        tingkat_kerusakan,
        status,
        prioritas,
        keterangan: (status === 'selesai' || status === 'ditolak') ? String(keterangan).trim() : undefined
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
        err.message === 'Minimal satu field diperlukan') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
