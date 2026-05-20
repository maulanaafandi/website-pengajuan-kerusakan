const express = require('express');
const router = express.Router();

const authUser = require('../middleware/jwt');
const uploadLaporan = require('../middleware/uploadLaporan');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Inventaris = require('../models/Inventaris');
const Ruangan = require('../models/Ruangan');
const Laporan = require('../models/Laporan');

const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp'];

function checkRole(req) {
  return req.user && allowedRoles.includes(req.user.role);
}

router.get('/api/pengguna/profile', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      upload.deleteUploadFile(req.file && req.file.filename);
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const profile = await User.getProfile(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: 'Data profil berhasil diambil',
      data: profile
    });
  } catch (error) {
    console.log('Error profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/master-data', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const inventaris = await Inventaris.getInventarisPengguna();
    const ruangan = await Ruangan.getRuanganPengguna();

    return res.status(200).json({
      success: true,
      message: 'Data master berhasil diambil',
      data: { inventaris, ruangan }
    });
  } catch (error) {
    console.log('Error masterData:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/ruangan', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const ruangan = await Ruangan.getAllRuanganPengguna();

    return res.status(200).json({
      success: true,
      message: 'Data ruangan berhasil diambil',
      data: ruangan
    });
  } catch (error) {
    console.log('Error getAllRuanganPengguna:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/inventaris', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const inventaris = await Inventaris.getAllInventarisPengguna();

    return res.status(200).json({
      success: true,
      message: 'Data inventaris berhasil diambil',
      data: inventaris
    });
  } catch (error) {
    console.log('Error getAllInventarisPengguna:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.post('/api/pengguna/laporan', authUser, uploadLaporan, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const { id_inventaris, id_ruangan, tanggal, keterangan, kondisi } = req.body;

    if (!id_inventaris || !id_ruangan || !tanggal || !keterangan || !kondisi) {
      upload.deleteUploadFile(req.file && req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    const bukti_foto = req.file ? req.file.filename : null;
    const data = {
      id_user: req.user.id_user,
      id_inventaris,
      id_ruangan,
      tanggal,
      keterangan,
      status: 'diproses',
      bukti_foto,
      kondisi
    };

    const idLaporan = await Laporan.createLaporan(data);

    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dibuat',
      data: {
        id_laporan: idLaporan
      }
    });
  } catch (error) {
    console.log('ERROR createLaporan:', error);
    upload.deleteUploadFile(req.file && req.file.filename);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/api/pengguna/riwayat-laporan', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const riwayat = await Laporan.getRiwayatLaporan(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: 'Riwayat laporan berhasil diambil',
      data: riwayat
    });
  } catch (error) {
    console.log('Error riwayatLaporan:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/riwayat-laporan/:id', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const laporan = await Laporan.getDetailLaporan(req.params.id, req.user.id_user);

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Detail laporan tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail laporan berhasil diambil',
      data: laporan
    });
  } catch (error) {
    console.log('Error detailLaporan:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/update-status', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const data = await Laporan.getUpdateStatusKaleb();

    return res.status(200).json({
      success: true,
      message: 'Update berhasil diambil',
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/update-status-kaleb', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const data = await Laporan.getUpdateStatusKaleb();

    return res.status(200).json({
      success: true,
      message: 'Update berhasil diambil',
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/update-laporan-kaleb', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const data = await Laporan.getUpdateStatusKaleb();

    return res.status(200).json({
      success: true,
      message: 'Update berhasil diambil',
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/kaleb/update-status', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const data = await Laporan.getUpdateStatusKaleb();

    return res.status(200).json({
      success: true,
      message: 'Update berhasil diambil',
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/api/pengguna/kaleb/update-status', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const data = await Laporan.getUpdateStatusKaleb();

    return res.status(200).json({
      success: true,
      message: 'Update berhasil diambil',
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.patch('/api/pengguna/kaleb/update-laporan', authUser, async (req, res) => {
  try {
    if (req.user.kaleb != '1') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya untuk kaleb'
      });
    }

    const { id_laporan, status, keterangan_admin } = req.body;

    if (!id_laporan || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID laporan dan status wajib diisi'
      });
    }

    const allowedStatus = ['menunggu', 'diproses', 'selesai', 'ditolak'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const laporan = await Laporan.getLaporanKalebById(id_laporan);

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }

    if (laporan.status === 'selesai') {
      return res.status(400).json({
        success: false,
        message: 'Laporan yang sudah selesai tidak bisa diubah lagi'
      });
    }

    const affectedRows = await Laporan.updateStatusDanKeteranganKaleb(
      id_laporan,
      status,
      keterangan_admin || null
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: 'Laporan gagal diperbarui'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status dan keterangan berhasil diperbarui'
    });
  } catch (error) {
    console.log('Error updateLaporanKaleb:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.patch('/api/pengguna/change-password', authUser, async (req, res) => {
  try {
    if (!checkRole(req)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const { password_lama, password_baru, konfirmasi_password } = req.body;

    if (!password_lama || !password_baru || !konfirmasi_password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field password wajib diisi'
      });
    }

    if (password_baru !== konfirmasi_password) {
      return res.status(400).json({
        success: false,
        message: 'Konfirmasi password baru tidak sama'
      });
    }

    const user = await User.findUserById(req.user.id_user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const checkPassword = await bcrypt.compare(password_lama, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);
    await User.updatePassword(req.user.id_user, hashedPassword);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.log('Error changePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

module.exports = router;
