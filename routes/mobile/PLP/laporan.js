const express = require('express')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')

router.get('/API/laporan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getAllRiwayatLaporanPlp()
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-plp-penting-dan-mendesak', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getAllRiwayatLaporanPlp('Penting dan Mendesak')
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-plp-penting-tapi-tidak-mendesak', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getAllRiwayatLaporanPlp('Penting tapi Tidak Mendesak')
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-plp-tidak-penting-tapi-mendesak', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getAllRiwayatLaporanPlp('Tidak Penting tapi Mendesak')
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/laporan-plp-tidak-penting-dan-tidak-mendesak', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getAllRiwayatLaporanPlp('Tidak Penting dan Tidak Mendesak')
    res.status(200).json({ result })
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
    const result = ['diproses_internal', 'diproses_eksternal', 'pending', 'ditolak', 'selesai']
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
