const express = require('express')
const router = express.Router()
const Laporan = require('../../models/Laporan')
const connection = require('../../config/db')
const { verifyToken, authorize } = require('../../middleware/jwt')
const { rekomendasiTriaseLaporan, rekomendasiPengadaan } = require('../../services/openaiRekomendasi')

router.post('/API/ai-rekomendasi-pengajuan-plp', verifyToken, authorize(['plp']), async (req, res) => {
  try {
    const semester = req.body.semester || undefined
    const laporanRows = await Laporan.getLaporanUntukTriaseAi(semester)

    if (!laporanRows.length) {
      return res.status(200).json({ message: 'Tidak ada laporan baru untuk diproses AI.', rekomendasi: [], count: 0 })
    }

    const waktuSekarang = new Date().toISOString()
    const triaseList = await rekomendasiTriaseLaporan(laporanRows, waktuSekarang)

    let updatedCount = 0
    const processed = []

    for (const item of triaseList) {
      const lap = laporanRows.find((r) => r.id === item.id)
      if (!lap) continue

      if (lap.kategori === 'kerusakan') {
        const [resUpdate] = await connection.query(
          `UPDATE laporan
           SET prioritas = ?,
               rekomendasi_ai = 1
           WHERE id = ?`,
          [item.prioritas_saran, lap.id]
        )
        if (resUpdate.affectedRows > 0) {
          updatedCount++
          processed.push({ id: lap.id, tipe: 'perbaikan', prioritas: item.prioritas_saran })
        }
      } else if (lap.kategori === 'kehilangan') {
        const waktuLapor = new Date(lap.waktu_lapor)
        const diffTime = Math.abs(new Date() - waktuLapor)
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30)

        if (diffMonths >= 2) {
          const idRuangan = lap.id_ruangan
          const konteksLab = idRuangan ? await Laporan.getKonteksLabUntukPengadaan(idRuangan) : {
            nama_ruangan: null, kode_ruangan: null, total_inventaris: 0, daftar_barang: []
          }

          const recPengadaan = await rekomendasiPengadaan(lap, konteksLab)
          const spek = recPengadaan?.spesifikasi_saran || lap.deskripsi || ''
          const harga = recPengadaan?.estimasi_harga_satuan || 0
          const jumlah = recPengadaan?.jumlah_saran || 1

          const [resUpdate] = await connection.query(
            `UPDATE laporan
             SET prioritas = ?,
                 spesifikasi = ?,
                 harga = ?,
                 jumlah = ?,
                 rekomendasi_ai = 1
             WHERE id = ?`,
            [item.prioritas_saran, spek, harga, jumlah, lap.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'pengadaan_kehilangan', prioritas: item.prioritas_saran, harga, jumlah })
          }
        }
      } else if (lap.kategori === 'barang_baru') {
        const idRuangan = lap.id_ruangan
        const konteksLab = idRuangan ? await Laporan.getKonteksLabUntukPengadaan(idRuangan) : {
          nama_ruangan: null, kode_ruangan: null, total_inventaris: 0, daftar_barang: []
        }

        const recPengadaan = await rekomendasiPengadaan(lap, konteksLab)
        
        if (recPengadaan && recPengadaan.layak) {
          const spek = recPengadaan.spesifikasi_saran || lap.deskripsi || ''
          const harga = recPengadaan.estimasi_harga_satuan || 0
          const jumlah = recPengadaan.jumlah_saran || 1

          const [resUpdate] = await connection.query(
            `UPDATE laporan
             SET prioritas = ?,
                 spesifikasi = ?,
                 harga = ?,
                 jumlah = ?,
                 rekomendasi_ai = 1
             WHERE id = ?`,
            [item.prioritas_saran, spek, harga, jumlah, lap.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'pengadaan_baru', prioritas: item.prioritas_saran, harga, jumlah })
          }
        } else if (recPengadaan && !recPengadaan.layak) {
          const alasan = String(recPengadaan.alasan || 'Ditolak sistem.').substring(0, 200)
          const [resUpdate] = await connection.query(
            `UPDATE laporan
             SET status = 'ditolak',
                 keterangan = ?
             WHERE id = ?`,
            [alasan, lap.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'ditolak', alasan })
          }
        }
      }
    }

    res.status(200).json({
      message: `Proses AI selesai. ${updatedCount} laporan telah dimasukkan ke pengajuan perbaikan / pengadaan.`,
      count: updatedCount,
      rekomendasi: processed
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/ai-rekomendasi-pengajuan-kaleb', verifyToken, authorize(['dosen']), async (req, res) => {
  try {
    if (String(req.user.kaleb) !== '1') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const semester = req.body.semester || undefined
    const laporanRows = await Laporan.getLaporanUntukTriaseAiKaleb(req.user.id, semester)

    if (!laporanRows.length) {
      return res.status(200).json({ message: 'Tidak ada laporan baru untuk diproses AI.', rekomendasi: [], count: 0 })
    }

    const waktuSekarang = new Date().toISOString()
    const triaseList = await rekomendasiTriaseLaporan(laporanRows, waktuSekarang)

    let updatedCount = 0
    const processed = []

    for (const item of triaseList) {
      const lap = laporanRows.find((r) => r.id === item.id)
      if (!lap) continue

      if (lap.kategori === 'kerusakan') {
        const [resUpdate] = await connection.query(
          `UPDATE laporan l
           LEFT JOIN inventaris i ON l.id_inventaris = i.id
           LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
           SET l.prioritas = ?,
               l.rekomendasi_ai = 1
           WHERE l.id = ?
             AND r.id_kaleb = ?`,
          [item.prioritas_saran, lap.id, req.user.id]
        )
        if (resUpdate.affectedRows > 0) {
          updatedCount++
          processed.push({ id: lap.id, tipe: 'perbaikan', prioritas: item.prioritas_saran })
        }
      } else if (lap.kategori === 'kehilangan') {
        const waktuLapor = new Date(lap.waktu_lapor)
        const diffTime = Math.abs(new Date() - waktuLapor)
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30)

        if (diffMonths >= 2) {
          const idRuangan = lap.id_ruangan
          const konteksLab = idRuangan ? await Laporan.getKonteksLabUntukPengadaan(idRuangan) : {
            nama_ruangan: null, kode_ruangan: null, total_inventaris: 0, daftar_barang: []
          }

          const recPengadaan = await rekomendasiPengadaan(lap, konteksLab)
          const spek = recPengadaan?.spesifikasi_saran || lap.deskripsi || ''
          const harga = recPengadaan?.estimasi_harga_satuan || 0
          const jumlah = recPengadaan?.jumlah_saran || 1

          const [resUpdate] = await connection.query(
            `UPDATE laporan l
             LEFT JOIN inventaris i ON l.id_inventaris = i.id
             LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
             SET l.prioritas = ?,
                 l.spesifikasi = ?,
                 l.harga = ?,
                 l.jumlah = ?,
                 l.rekomendasi_ai = 1
             WHERE l.id = ?
               AND r.id_kaleb = ?`,
            [item.prioritas_saran, spek, harga, jumlah, lap.id, req.user.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'pengadaan_kehilangan', prioritas: item.prioritas_saran, harga, jumlah })
          }
        }
      } else if (lap.kategori === 'barang_baru') {
        const idRuangan = lap.id_ruangan
        const konteksLab = idRuangan ? await Laporan.getKonteksLabUntukPengadaan(idRuangan) : {
          nama_ruangan: null, kode_ruangan: null, total_inventaris: 0, daftar_barang: []
        }

        const recPengadaan = await rekomendasiPengadaan(lap, konteksLab)
        
        if (recPengadaan && recPengadaan.layak) {
          const spek = recPengadaan.spesifikasi_saran || lap.deskripsi || ''
          const harga = recPengadaan.estimasi_harga_satuan || 0
          const jumlah = recPengadaan.jumlah_saran || 1

          const [resUpdate] = await connection.query(
            `UPDATE laporan l
             LEFT JOIN inventaris i ON l.id_inventaris = i.id
             LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
             SET l.prioritas = ?,
                 l.spesifikasi = ?,
                 l.harga = ?,
                 l.jumlah = ?,
                 l.rekomendasi_ai = 1
             WHERE l.id = ?
               AND r.id_kaleb = ?`,
            [item.prioritas_saran, spek, harga, jumlah, lap.id, req.user.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'pengadaan_baru', prioritas: item.prioritas_saran, harga, jumlah })
          }
        } else if (recPengadaan && !recPengadaan.layak) {
          const alasan = String(recPengadaan.alasan || 'Ditolak sistem.').substring(0, 200)
          const [resUpdate] = await connection.query(
            `UPDATE laporan l
             LEFT JOIN inventaris i ON l.id_inventaris = i.id
             LEFT JOIN ruangan r ON r.id = COALESCE(l.id_ruangan, i.id_ruangan)
             SET l.status = 'ditolak',
                 l.keterangan = ?
             WHERE l.id = ?
               AND r.id_kaleb = ?`,
            [alasan, lap.id, req.user.id]
          )
          if (resUpdate.affectedRows > 0) {
            updatedCount++
            processed.push({ id: lap.id, tipe: 'ditolak', alasan })
          }
        }
      }
    }

    res.status(200).json({
      message: `Proses AI selesai. ${updatedCount} laporan telah dimasukkan ke pengajuan perbaikan / pengadaan.`,
      count: updatedCount,
      rekomendasi: processed
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
