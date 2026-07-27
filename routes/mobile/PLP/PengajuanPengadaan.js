const express = require('express')
const router = express.Router()
const Laporan = require('../../../models/Laporan')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const { getWaktuLaporSemester } = require('../../../middleware/generateWaktuLaporSemester')
const { rekomendasiTriaseLaporan, rekomendasiPengadaan } = require('../../../services/openaiRekomendasi')

router.get('/API/semester-pengajuan-pengadaan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const result = await Laporan.getSemesterOptionsPengajuanPengadaanPlp()
    res.status(200).json({
      semesterSaatIni: getWaktuLaporSemester(new Date()),
      result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/API/pengajuan-pengadaan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.getAllPengajuanPengadaanPlp(
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

router.get('/API/cari-pengajuan-pengadaan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.cariPengajuanPengadaanPlp(
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

router.get('/API/detail-pengajuan-pengadaan-plp/:id', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const data = await Laporan.getLaporanPengadaanByIdPlp(req.params.id)

    if (!data) {
      return res.status(404).json({ message: 'Detail pengajuan pengadaan tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/ai-triase-laporan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const semester = req.body.semester || undefined
    const laporanRows = await Laporan.getLaporanUntukTriaseAi(semester)

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

router.get('/API/ai-rekomendasi-pengadaan-plp/:id', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const laporan = await Laporan.getLaporanPengadaanByIdUntukAi(req.params.id)

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

router.get('/API/kehilangan-pending-pengadaan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const { result, pagination } = await Laporan.getKehilanganPendingUntukPengadaan(
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
