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
const generateWaktuLaporSemester = require('../../../middleware/generateWaktuLaporSemester')

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

const allowedTingkatKerusakan = ['ringan', 'sedang', 'berat', 'rusak_total']

router.get('/API/ruangan', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const result = await Ruangan.getAllRuanganPengguna()
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/inventaris/:id', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const { id } = req.params

    const result = await Inventaris.getAllInventarisPenggunaByRuangan(id)
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/buat-laporan', verifyToken, authorize(allowedRoles), generateKodeLaporan, generateWaktuLaporSemester, upload.single('bukti_foto'), async (req, res) => {
  try {
    const id_pelapor = req.user.id
    const { id_ruangan, id_inventaris, kategori, tingkat_kerusakan, deskripsi } = req.body
    const bukti_foto = req.file ? req.file.filename : null

    if (!kategori) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Kategori diperlukan.' })
    }

    const allowedKategori = ['kerusakan', 'kehilangan', 'barang_baru']
    if (!allowedKategori.includes(kategori)) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Kategori tidak valid.' })
    }

    if (!deskripsi) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Deskripsi diperlukan.' })
    }

    if (kategori === 'barang_baru') {
      if (!id_ruangan) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Ruangan diperlukan.' })
      }

      if (id_inventaris) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Inventaris tidak diperlukan.' })
      }

      if (req.file) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Bukti foto tidak diperlukan.' })
      }

      if (!(tingkat_kerusakan === undefined || tingkat_kerusakan === null || tingkat_kerusakan === '')) {
        return res.status(400).json({ message: 'Tingkat kerusakan tidak diperlukan.' })
      }

      const ruanganBaru = await Ruangan.getRuanganById(id_ruangan)
      if (!ruanganBaru) {
        deleteUploadedFile(req.file)
        return res.status(404).json({ message: 'Ruangan tidak ditemukan.' })
      }

      await Laporan.createLaporan({
        id_pelapor,
        id_ruangan,
        id_inventaris: null,
        kategori,
        deskripsi,
        bukti_foto: null,
        tingkat_kerusakan: null,
        kode_laporan: req.kode_laporan,
        waktu_lapor_semester: req.waktu_lapor_semester
      })

      return res.status(201).json({ message: 'Laporan Berhasil dibuat' })
    }

    if (!id_ruangan) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Ruangan diperlukan.' })
    }

    const ruangan = await Ruangan.getRuanganById(id_ruangan)
    if (!ruangan) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Ruangan tidak ditemukan.' })
    }

    if (kategori === 'kerusakan') {
      if (!id_inventaris) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Inventaris diperlukan.' })
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Bukti foto diperlukan.' })
      }

      if (tingkat_kerusakan === undefined || tingkat_kerusakan === null || tingkat_kerusakan === '') {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Tingkat kerusakan diperlukan.' })
      }

      if (!allowedTingkatKerusakan.includes(String(tingkat_kerusakan).trim().toLowerCase())) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Tingkat kerusakan tidak valid.' })
      }

      if (req.file && req.file.size > 5 * 1024 * 1024) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Ukuran bukti foto tidak boleh lebih dari 5Mb.' })
      }

      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/x-png',
        'image/webp',
        'application/octet-stream',
      ]
      const allowedExt = ['.jpg', '.jpeg', '.png', '.webp']
      const ext = path.extname(req.file.originalname || '').toLowerCase()

      if (
        req.file &&
        (!allowedMimeTypes.includes(req.file.mimetype) ||
          (req.file.mimetype === 'application/octet-stream' && !allowedExt.includes(ext)))
      ) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Format foto harus JPG, JPEG, PNG, atau WEBP.' })
      }
    }

    if (kategori === 'kehilangan') {
      if (!id_inventaris) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Inventaris diperlukan.' })
      }

      if (req.file) {
        deleteUploadedFile(req.file)
        return res.status(400).json({ message: 'Bukti foto tidak diperlukan.' })
      }

      if (!(tingkat_kerusakan === undefined || tingkat_kerusakan === null || tingkat_kerusakan === '')) {
        return res.status(400).json({ message: 'Tingkat kerusakan tidak diperlukan.' })
      }
    }

    const inventaris = await Inventaris.getInventarisById(id_inventaris)
    if (!inventaris) {
      deleteUploadedFile(req.file)
      return res.status(404).json({ message: 'Inventaris tidak ditemukan.' })
    }

    if (String(inventaris.id_ruangan) !== String(id_ruangan)) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Inventaris tidak berada di ruangan yang dipilih.' })
    }

    await Laporan.createLaporan({
      id_pelapor,
      id_inventaris,
      kategori,
      deskripsi,
      bukti_foto: kategori === 'kerusakan' ? bukti_foto : null,
      tingkat_kerusakan: kategori === 'kerusakan' ? tingkat_kerusakan : null,
      kode_laporan: req.kode_laporan,
      waktu_lapor_semester: req.waktu_lapor_semester
    })

    res.status(201).json({ message: 'Laporan Berhasil dibuat' })
  } catch (err) {
    deleteUploadedFile(req.file)
    if (err.message === 'Tingkat kerusakan tidak valid') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
