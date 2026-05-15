const connection = require('../config/db');

class Pengguna {

  // ================= PROFILE =================
  static async getProfile(idUser) {
    const [rows] = await connection.query(
      `SELECT id_user, email, role, kaleb
       FROM user
       WHERE id_user = ?`,
      [idUser]
    );

    return rows[0] || null;
  }

  // ================= UPDATE STATUS KALEB =================
  static async getUpdateStatusKaleb() {
    const [rows] = await connection.query(
      `SELECT
          l.id_laporan,
          l.id_user,
          u.email,
          l.id_inventaris,
          l.id_ruangan,

          DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,

          l.keterangan,
          l.keterangan_admin,
          l.status,
          l.bukti_foto,
          l.kondisi,

          i.nama_barang,
          i.kode_barang,
          i.merk,
          r.nama_ruangan,
          r.kode_ruangan,
          r.lokasi

       FROM laporan l
       LEFT JOIN user u ON l.id_user = u.id_user
       LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
       LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan

       ORDER BY l.id_laporan DESC`
    );

    return rows;
  }

  // ================= INVENTARIS =================
  static async getInventaris() {
    const [rows] = await connection.query(
      `SELECT id_inventaris, kode_barang, nup, nama_barang, merk, kategori
       FROM inventaris
       ORDER BY id_inventaris DESC`
    );

    return rows;
  }

  // ================= RUANGAN =================
  static async getRuangan() {
    const [rows] = await connection.query(
      `SELECT id_ruangan, nama_ruangan, kode_ruangan, lokasi
       FROM ruangan
       ORDER BY id_ruangan DESC`
    );

    return rows;
  }

  // ================= CREATE LAPORAN =================
  static async createLaporan(data) {
    const [result] = await connection.query(
      `INSERT INTO laporan
      (id_user, id_inventaris, id_ruangan, tanggal, keterangan, status, bukti_foto, kondisi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_user,
        data.id_inventaris,
        data.id_ruangan,
        data.tanggal || null,
        data.keterangan,
        data.status || 'diproses',
        data.bukti_foto || null,
        data.kondisi
      ]
    );

    return result.insertId;
  }

  // ================= RIWAYAT LAPORAN =================
  static async getRiwayatLaporan(idUser) {
    const [rows] = await connection.query(
      `SELECT
          l.id_laporan,
          l.id_user,
          l.id_inventaris,
          l.id_ruangan,

          DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,

          l.keterangan,
          l.keterangan_admin,
          l.status,
          l.bukti_foto,
          l.kondisi,

          i.nama_barang,
          i.kode_barang,
          i.merk,
          r.nama_ruangan,
          r.kode_ruangan,
          r.lokasi

       FROM laporan l
       LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
       LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan

       WHERE l.id_user = ?
       ORDER BY l.id_laporan DESC`,
      [idUser]
    );

    return rows;
  }

  // ================= DETAIL LAPORAN =================
  static async getDetailLaporan(idLaporan, idUser) {
    const [rows] = await connection.query(
      `SELECT
          l.id_laporan,
          l.id_user,
          l.id_inventaris,
          l.id_ruangan,

          DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,

          l.keterangan,
          l.keterangan_admin,
          l.status,
          l.bukti_foto,
          l.kondisi,

          i.nama_barang,
          i.kode_barang,
          i.merk,
          i.kategori,
          r.nama_ruangan,
          r.kode_ruangan,
          r.lokasi

       FROM laporan l
       LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
       LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan

       WHERE l.id_laporan = ? AND l.id_user = ?
       LIMIT 1`,
      [idLaporan, idUser]
    );

    return rows[0] || null;
  }

  // ================= FIND USER =================
  static async findUserById(idUser) {
    const [rows] = await connection.query(
      `SELECT id_user, email, password, role, kaleb
       FROM user
       WHERE id_user = ?`,
      [idUser]
    );

    return rows[0] || null;
  }

  // ================= UPDATE STATUS DAN KETERANGAN KALEB =================
static async updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin) {
  await connection.query(
    `UPDATE laporan
     SET status = ?,
         keterangan_admin = ?
     WHERE id_laporan = ?`,
    [status, keteranganAdmin, idLaporan]
  );
}
static async getUpdateStatusKaleb() {
  const [rows] = await connection.query(
    `SELECT
        l.id_laporan,
        l.id_user,
        u.email,
        l.id_inventaris,
        l.id_ruangan,

        DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,

        l.keterangan,
        l.keterangan_admin,
        l.status,
        l.bukti_foto,
        l.kondisi,

        i.nama_barang,
        i.kode_barang,
        i.merk,
        r.nama_ruangan,
        r.kode_ruangan,
        r.lokasi

     FROM laporan l
     LEFT JOIN user u ON l.id_user = u.id_user
     LEFT JOIN inventaris i ON l.id_inventaris = i.id_inventaris
     LEFT JOIN ruangan r ON l.id_ruangan = r.id_ruangan

     ORDER BY l.id_laporan DESC`
  );

  return rows;
}

static async updateStatusDanKeteranganKaleb(idLaporan, status, keteranganAdmin) {
  await connection.query(
    `UPDATE laporan
     SET status = ?,
         keterangan_admin = ?
     WHERE id_laporan = ?`,
    [status, keteranganAdmin, idLaporan]
  );
}

  // ================= UPDATE PASSWORD =================
  static async updatePassword(idUser, hashedPassword) {
    await connection.query(
      `UPDATE user
       SET password = ?
       WHERE id_user = ?`,
      [hashedPassword, idUser]
    );
  }
}

module.exports = Pengguna;