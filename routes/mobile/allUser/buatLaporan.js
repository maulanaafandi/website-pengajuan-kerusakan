const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Ruangan = require('../../../models/Ruangan')
const Inventaris = require('../../../models/Inventaris')
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const generateKodeLaporan = require('../../../middleware/generateKodeLaporan')

const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']

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

router.get('/API/ruangan', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const result = await Ruangan.getAllRuanganPengguna()
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/inventaris', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const result = await Inventaris.getAllInventarisPengguna()
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/buat-laporan', verifyToken, authorize(allowedRoles), generateKodeLaporan, upload.single('bukti_foto'), async (req, res) => {
  try {
    const id_pelapor = req.user.id
    const { id_inventaris, kategori, kondisi, deskripsi } = req.body
    const bukti_foto = req.file ? req.file.filename : null

    if (!id_inventaris) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Inventaris diperlukan.' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Bukti foto diperlukan.' })
    }

    if (!kategori) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Kategori diperlukan.' })
    }

    const allowedKategori = ['kerusakan', 'kehilangan']
    if (!allowedKategori.includes(kategori)) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Kategori tidak valid.' })
    }

    if (!deskripsi) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Deskripsi diperlukan.' })
    }

    if (kondisi === undefined || kondisi === null || kondisi === '') {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Kondisi diperlukan.' })
    }

    if (req.file && req.file.size > 5 * 1024 * 1024) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Ukuran bukti foto tidak boleh lebih dari 5Mb.' })
    }

    const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (req.file && !allowedFormats.includes(req.file.mimetype)) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Format foto harus JPG, JPEG, PNG, atau WEBP.' })
    }

    const inventaris = await Inventaris.getInventarisById(id_inventaris)
    if (!inventaris) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Inventaris tidak ditemukan.' })
    }

    const data = {
      id_pelapor,
      id_inventaris,
      kategori,
      deskripsi,
      bukti_foto,
      kondisi,
      kode_laporan: req.kode_laporan
    }

    await Laporan.createLaporan(data)

    res.status(201).json({ message: 'Laporan Berhasil dibuat' })
  } catch (err) {
    deleteUploadedFile(req.file)
    if (err.message === 'Kondisi harus berupa angka' || err.message === 'Kondisi harus di antara 0 sampai 100') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
