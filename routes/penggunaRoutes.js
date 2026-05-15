const express = require('express');
const router = express.Router();

const PenggunaController = require('../controllers/penggunaControllers');
const authUser = require('../middleware/jwt');
const upload = require('../middleware/upload');

// =======================
// PROFILE
// =======================
router.get('/api/pengguna/profile', authUser, PenggunaController.profile);

// =======================
// MASTER DATA
// =======================
router.get('/api/pengguna/master-data', authUser, PenggunaController.masterData);

// =======================
// BUAT LAPORAN
// =======================
router.post('/api/pengguna/laporan', authUser, (req, res, next) => {
  upload.single('bukti_foto')(req, res, function (err) {
    if (err) {
      console.log('UPLOAD ERROR:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    next();
  });
}, PenggunaController.createLaporan);

// =======================
// RIWAYAT LAPORAN USER
// =======================
router.get(
  '/api/pengguna/riwayat-laporan',
  authUser,
  PenggunaController.riwayatLaporan
);

router.get(
  '/api/pengguna/riwayat-laporan/:id',
  authUser,
  PenggunaController.detailLaporan
);

// =======================
// UPDATE STATUS KALEB
// beberapa alias biar cocok dengan Flutter
// =======================
router.get(
  '/api/pengguna/update-status',
  authUser,
  PenggunaController.updateStatusKaleb
);

router.get(
  '/api/pengguna/update-status-kaleb',
  authUser,
  PenggunaController.updateStatusKaleb
);

router.get(
  '/api/pengguna/update-laporan-kaleb',
  authUser,
  PenggunaController.updateStatusKaleb
);

router.get(
  '/api/kaleb/update-status',
  authUser,
  PenggunaController.updateStatusKaleb
);

router.get(
  '/api/pengguna/kaleb/update-status',
  authUser,
  PenggunaController.updateStatusKaleb
);
router.put(
  '/api/pengguna/kaleb/update-laporan',
  authUser,
  PenggunaController.updateLaporanKaleb
);

// =======================
// GANTI PASSWORD
// =======================
router.put(
  '/api/pengguna/change-password',
  authUser,
  PenggunaController.changePassword
);

module.exports = router;