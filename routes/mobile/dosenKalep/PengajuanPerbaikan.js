const express = require('express')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { getWaktuLaporSemester } = require('../../../middleware/generateWaktuLaporSemester')

router.get('/API/semester-pengajuan-perbaikan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const result = await Laporan.getSemesterOptionsPengajuanPerbaikanKaleb(req.user.id)
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/pengajuan-perbaikan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const { result, pagination } = await Laporan.getAllPengajuanPerbaikanKaleb(
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

router.get('/API/cari-pengajuan-perbaikan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const { result, pagination } = await Laporan.cariPengajuanPerbaikanKaleb(
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

router.get('/API/detail-pengajuan-perbaikan-kaleb/:id', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    const data = await Laporan.getLaporanPerbaikanByIdKaleb(req.params.id, req.user.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail pengajuan perbaikan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
