const express = require('express')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { rekomendasiPrioritasLaporan, allowedPrioritas } = require('../../../services/openaiRekomendasi')

router.get('/API/laporan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const result = await Laporan.getAllRiwayatLaporanKaleb(req.user.id)
    res.status(200).json({ result })
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

router.get('/API/rekomendasi-laporan-ai', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const limit = req.query.limit
    const laporan = await Laporan.getLaporanUntukRekomendasiAiKaleb(req.user.id, limit)
    const data = await rekomendasiPrioritasLaporan(laporan)
    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/rekomendasi-laporan-ai/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Prioritas diperlukan.' })
    }

    const { prioritas } = req.body

    if (!prioritas) {
      return res.status(400).json({ message: 'Prioritas diperlukan.' })
    }

    if (!allowedPrioritas.includes(prioritas)) {
      return res.status(400).json({ message: 'Prioritas tidak valid.' })
    }

    const affectedRows = await Laporan.applyRekomendasiAiPrioritas(req.params.id, req.user.id, prioritas)

    if (!affectedRows) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan atau bukan dari ruangan Anda' })
    }

    res.status(200).json({ message: 'Rekomendasi AI berhasil diterapkan' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/update-prioritas-laporan/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Prioritas diperlukan.' })
    }

    const { prioritas } = req.body

    if (!prioritas) {
      return res.status(400).json({ message: 'Prioritas diperlukan.' })
    }

    if (!allowedPrioritas.includes(prioritas)) {
      return res.status(400).json({ message: 'Prioritas tidak valid.' })
    }

    const affectedRows = await Laporan.updatePrioritasByPemilikRuangan(req.params.id, req.user.id, prioritas)

    if (!affectedRows) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan atau bukan dari ruangan Anda' })
    }

    res.status(200).json({ message: 'Prioritas berhasil diperbarui' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/update-status-laporan/:id', verifyToken, authorize(['plp', 'dosen']), async (req, res) => {
  try {
    const role = req.user.userType || req.user.role

    if (role === 'dosen' && String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Status diperlukan.' })
    }

    const { status, keterangan } = req.body
    const allowedStatus = ['diproses_internal', 'diproses_eksternal', 'pending', 'ditolak', 'selesai']

    if (status === undefined) {
      return res.status(400).json({ message: 'Status diperlukan.' })
    }

    if (keterangan === undefined) {
      return res.status(400).json({ message: 'Keterangan diperlukan.' })
    }

    if (status !== null && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' })
    }

    const affectedRows = role === 'plp'
      ? await Laporan.updateStatusDanKeteranganByPlp(req.params.id, status, keterangan || null, status === 'selesai' ? req.user.id : null)
      : await Laporan.updateStatusDanKeteranganByPemilikRuangan(req.params.id, req.user.id, status, keterangan || null, status === 'selesai' ? req.user.id : null)

    if (!affectedRows) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan atau tidak bisa diperbarui' })
    }

    res.status(200).json({ message: 'Status berhasil diperbarui' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
