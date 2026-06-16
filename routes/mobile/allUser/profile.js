const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../../../models/User')
const { verifyToken, authorize } = require('../../../middleware/jwt')
const validatePassword = require('../../../middleware/validatePassword')

const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']

router.get('/API/profile', verifyToken, authorize(allowedRoles), async (req, res) => {
  try {
    const id = req.user.id
    const data = await User.getProfile(id)

    if (!data) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' })
    }

    res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.patch('/API/ubah-sandi', verifyToken, authorize(allowedRoles), validatePassword, async (req, res) => {
  try {
    const id = req.user.id
    const { kata_sandi_lama, kata_sandi_baru, konfirmasi_kata_sandi_baru } = req.body

    if (!kata_sandi_lama) {
      return res.status(400).json({ message: 'Kata sandi lama diperlukan.' })
    }

    if (!kata_sandi_baru) {
      return res.status(400).json({ message: 'Kata sandi baru diperlukan.' })
    }

    if (!konfirmasi_kata_sandi_baru) {
      return res.status(400).json({ message: 'Konfirmasi kata sandi baru diperlukan.' })
    }

    const checkKatasandi = await User.findUserById(id)

    if (!(await bcrypt.compare(kata_sandi_lama, checkKatasandi.kata_sandi))) {
      return res.status(400).json({ message: 'Kata Sandi Lama tidak sesuai.' })
    }

    if (checkKatasandi.status != 'aktif') {
      return res.status(400).json({ message: 'Akun tidak boleh diupdate jika status tidak aktif.' })
    }

    if (kata_sandi_baru != konfirmasi_kata_sandi_baru) {
      return res.status(400).json({ message: 'Kata sandi baru dan konfirmasi kata sandi baru tidak cocok.' })
    }

    const data = { kata_sandi_baru }

    await User.updatePasswordMobile(id, data)
    res.status(200).json({ message: 'Kata Sandi berhasil diupdate' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
