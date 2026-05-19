const bcrypt = require('bcryptjs');
const Pengguna = require('../models/Pengguna');

class PenggunaController {
  static allowedRoles() {
    return ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp'];
  }

  static checkRole(req) {
    return req.user && PenggunaController.allowedRoles().includes(req.user.role);
  }

  static async profile(req, res) {
    try {
      if (!PenggunaController.checkRole(req)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const profile = await Pengguna.getProfile(req.user.id_user);

      return res.status(200).json({
        success: true,
        message: 'Data profil berhasil diambil',
        data: profile
      });
    } catch (err) {
      console.log('Error profile:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }
  static async updateStatusKaleb(req,res){

try{

 if(req.user.kaleb!="1"){

   return res.status(403).json({
     success:false,
     message:"Akses hanya untuk kaleb"
   })

 }

 const data=
 await Pengguna.getUpdateStatusKaleb()

 return res.status(200).json({

   success:true,
   message:"Update berhasil diambil",
   data

 })

}catch(err){

 console.log(err)

 return res.status(500).json({
   success:false,
   message:"Internal Server Error"
 })

}


}

  static async masterData(req, res) {
    try {
      if (!PenggunaController.checkRole(req)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const inventaris = await Pengguna.getInventaris();
      const ruangan = await Pengguna.getRuangan();

      return res.status(200).json({
        success: true,
        message: 'Data master berhasil diambil',
        data: { inventaris, ruangan }
      });
    } catch (err) {
      console.log('Error masterData:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }
  static async updateLaporanKaleb(req, res) {
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

    const laporan = await Pengguna.getLaporanKalebById(id_laporan);

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

    const affectedRows = await Pengguna.updateStatusDanKeteranganKaleb(
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

  } catch (err) {
    console.log('Error updateLaporanKaleb:', err);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

  static async createLaporan(req, res) {
    try {
      console.log('BODY LAPORAN:', req.body);
      console.log('FILE LAPORAN:', req.file);

      if (!PenggunaController.checkRole(req)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const { id_inventaris, id_ruangan, tanggal, keterangan, kondisi } = req.body;

      if (!id_inventaris || !id_ruangan || !tanggal || !keterangan || !kondisi) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      const bukti_foto = req.file ? req.file.filename : null;

      const idLaporan = await Pengguna.createLaporan({
        id_user: req.user.id_user,
        id_inventaris,
        id_ruangan,
        tanggal,
        keterangan,
        status: 'diproses',
        bukti_foto,
        kondisi
      });

      return res.status(201).json({
        success: true,
        message: 'Laporan berhasil dibuat',
        data: {
          id_laporan: idLaporan
        }
      });
    } catch (err) {
      console.log('ERROR createLaporan:', err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  static async riwayatLaporan(req, res) {
    try {
      if (!PenggunaController.checkRole(req)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const riwayat = await Pengguna.getRiwayatLaporan(req.user.id_user);

      return res.status(200).json({
        success: true,
        message: 'Riwayat laporan berhasil diambil',
        data: riwayat
      });
    } catch (err) {
      console.log('Error riwayatLaporan:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }

  static async detailLaporan(req, res) {
    try {
      if (!PenggunaController.checkRole(req)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses'
        });
      }

      const laporan = await Pengguna.getDetailLaporan(
        req.params.id,
        req.user.id_user
      );

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
    } catch (err) {
      console.log('Error detailLaporan:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }

  static async changePassword(req, res) {
    try {
      if (!PenggunaController.checkRole(req)) {
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

      const user = await Pengguna.findUserById(req.user.id_user);

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
      await Pengguna.updatePassword(req.user.id_user, hashedPassword);

      return res.status(200).json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (err) {
      console.log('Error changePassword:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }
}

module.exports = PenggunaController;
