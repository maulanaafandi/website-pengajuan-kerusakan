const express = require('express')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')

const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']

router.get('/API/riwayat-laporan', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const result = await Laporan.getRiwayatLaporan(req.user.id)
    res.status(200).json({ result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/detail-riwayat-laporan/:id', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const data = await Laporan.getDetailLaporan(req.params.id, req.user.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail laporan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
