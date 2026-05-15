const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/adminControllers')
const authAdmin = require('../middleware/auth')

router.get('/dashboard', authAdmin, AdminController.dashboard)

router.get('/admin/buat-akun', authAdmin, AdminController.formBuatAkun)
router.get('/admin/pengaturan', authAdmin, AdminController.pengaturan)
router.post('/admin/buat-akun', authAdmin, AdminController.storeBuatAkun)
router.get('/admin/daftar-akun', authAdmin, AdminController.daftarAkun)

router.get('/admin/inventaris', authAdmin, AdminController.inventaris)

router.get('/admin/inventaris/export/pdf', authAdmin, AdminController.exportInventarisPDF)

router.get('/admin/inventaris/export/excel', authAdmin, AdminController.exportInventarisExcel)

router.get('/admin/inventaris/export/word', authAdmin, AdminController.exportInventarisWord)

router.get('/admin/inventaris/create', authAdmin, AdminController.createInventarisPage)

router.get('/admin/users', authAdmin, AdminController.users)
router.get('/admin/users/create', authAdmin, AdminController.createUserPage)
router.post('/admin/users/create', authAdmin, AdminController.storeUser)
router.get('/admin/users/edit/:id', authAdmin, AdminController.editUserPage)
router.post('/admin/users/edit/:id', authAdmin, AdminController.updateUser)
router.post('/admin/users/delete/:id', authAdmin, AdminController.deleteUser)

router.get('/admin/inventaris', authAdmin, AdminController.inventaris)
router.get('/admin/inventaris/create', authAdmin, AdminController.createInventarisPage)
router.post('/admin/inventaris/create', authAdmin, AdminController.storeInventaris)
router.get('/admin/inventaris/edit/:id', authAdmin, AdminController.editInventarisPage)
router.post('/admin/inventaris/edit/:id', authAdmin, AdminController.updateInventaris)
router.post('/admin/inventaris/delete/:id', authAdmin, AdminController.deleteInventaris)

router.get('/admin/ruangan', authAdmin, AdminController.ruangan)
router.get('/admin/ruangan/create', authAdmin, AdminController.createRuanganPage)
router.post('/admin/ruangan/create', authAdmin, AdminController.storeRuangan)
router.get('/admin/ruangan/edit/:id', authAdmin, AdminController.editRuanganPage)
router.post('/admin/ruangan/edit/:id', authAdmin, AdminController.updateRuangan)
router.post('/admin/ruangan/delete/:id', authAdmin, AdminController.deleteRuangan)

router.get('/admin/laporan', authAdmin, AdminController.laporan)
router.get('/admin/laporan/detail/:id', authAdmin, AdminController.detailLaporan)
router.post('/admin/laporan/keterangan/:id', authAdmin, AdminController.updateKeteranganAdmin)
router.post('/admin/laporan/status/:id', authAdmin, AdminController.updateStatusLaporan)

router.get('/admin/rekomendasi', authAdmin, AdminController.rekomendasi)
router.post('/admin/rekomendasi/generate-ai', authAdmin, AdminController.generateRekomendasiAI)
router.post('/admin/rekomendasi/save-ai', authAdmin, AdminController.saveRekomendasiAI)
router.post('/admin/rekomendasi/clear-ai', authAdmin, AdminController.clearRekomendasiAI)
router.get('/admin/rekomendasi/create', authAdmin, AdminController.createRekomendasiPage)
router.post('/admin/rekomendasi/create', authAdmin, AdminController.storeRekomendasi)
router.get('/admin/rekomendasi/edit/:id', authAdmin, AdminController.editRekomendasiPage)
router.post('/admin/rekomendasi/edit/:id', authAdmin, AdminController.updateRekomendasi)
router.post('/admin/rekomendasi/delete/:id', authAdmin, AdminController.deleteRekomendasi)

router.post('/logout', AdminController.logout)

module.exports = router
