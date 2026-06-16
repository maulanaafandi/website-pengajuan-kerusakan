const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Auth = require('../models/Auth')
const validateEmail = require('../middleware/validateEmail')
const validatePassword = require('../middleware/validatePassword')

router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard')
  }

  return res.render('login')
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    return res.redirect('/')
  })
})

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await Auth.findUserByEmail(email)

    if (!user) {
      req.flash('error', 'Email tidak ditemukan')
      return res.redirect('/')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      req.flash('error', 'Password salah')
      return res.redirect('/')
    }

    if (user.role !== 'admin' && String(user.kaleb) !== '1') {
      req.flash('error', 'Akun tidak valid')
      return res.redirect('/')
    }

    if (user.status !== 'aktif') {
      req.flash('error', 'Akun belum aktif')
      return res.redirect('/')
    }

    req.session.user = {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
      kaleb: user.kaleb
    }

    return res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
    req.flash('error', 'Terjadi kesalahan saat login')
    return res.redirect('/')
  }
})

router.post('/API/login-mobile', async (req, res) => {
  try {
    const { email, kata_sandi } = req.body
    const data = { email, kata_sandi }

    if (!data.email) {
      return res.status(400).json({ message: 'Email diperlukan.' })
    }

    if (!data.kata_sandi) {
      return res.status(400).json({ message: 'Kata sandi diperlukan.' })
    }

    const user = await Auth.loginMobile(data)

    if (!user) {
      return res.status(401).json({ message: 'Email yang anda masukkan salah.' })
    }

    const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Role ini tidak diizinkan login sebagai pengguna' })
    }

    if (user.status !== 'aktif') {
      return res.status(401).json({ message: 'Silahkan hubungi Admin untuk aktifasi akun anda.' })
    }

    if (!(await bcrypt.compare(data.kata_sandi, user.kata_sandi))) {
      return res.status(401).json({ message: 'Password yang anda masukkan salah.' })
    }

    const payload = {
      id: user.id,
      role: user.role,
      kaleb: user.kaleb
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

    return res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/register-mobile', validateEmail, validatePassword, async (req, res) => {
  try {
    const { nama, email, kata_sandi, konfirmasi_kata_sandi, role } = req.body

    if (!nama) {
      return res.status(400).json({ message: 'Nama diperlukan.' })
    }

    if (!kata_sandi) {
      return res.status(400).json({ message: 'Kata sandi diperlukan.' })
    }

    if (!role) {
      return res.status(400).json({ message: 'Role diperlukan.' })
    }

    const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid.' })
    }

    if (await Auth.checkEmail(email)) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' })
    }

    if (kata_sandi != konfirmasi_kata_sandi) {
      return res.status(400).json({ message: 'Kata sandi dan konfirmasi kata sandi tidak cocok.' })
    }

    await Auth.register({ nama, email, kata_sandi, role })

    res.status(201).json({ message: 'Registrasi berhasil. Tunggu akun aktif dari admin.' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.post('/API/logout-mobile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
      return res.status(401).json({ message: 'Tidak ada token yang diberikan.' })
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
      return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' })
      }
      res.status(200).json({ message: 'Logout berhasil.' })
  })
})

module.exports = router
