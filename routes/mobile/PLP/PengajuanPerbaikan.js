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

router.get('/API/semester-pengajuan-perbaikan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getSemesterOptionsPengajuanPerbaikanPlp()
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/pengajuan-perbaikan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.getAllPengajuanPerbaikanPlp(
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

router.get('/API/cari-pengajuan-perbaikan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.cariPengajuanPerbaikanPlp(
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

router.get('/API/detail-pengajuan-perbaikan-plp/:id', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const data = await Laporan.getLaporanPerbaikanByIdPlp(req.params.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail pengajuan perbaikan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/laporan-selesai-pengajuan-perbaikan-plp/:id', verifyToken, authorize(['plp']), upload.single('foto_selesai'), async (req, res) => {
  try {
    const { keterangan } = req.body || {}

    if (keterangan === undefined || String(keterangan).trim() === '') {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Keterangan diperlukan.' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Bukti foto diperlukan.' })
    }

    const affectedRows = await Laporan.selesaiPengajuanPerbaikanByPlp(
      req.params.id,
      String(keterangan).trim(),
      req.user.id,
      req.file.filename
    )

    if (!affectedRows) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Laporan tidak ditemukan atau tidak bisa diperbarui' })
    }

    res.status(200).json({ message: 'Laporan berhasil diselesaikan' })
  } catch (err) {
    deleteUploadedFile(req.file)
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
