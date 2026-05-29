const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Auth = require('../models/Auth')
const User = require('../models/User')

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

router.post('/api/login/mobile', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      })
    }

    const user = await Auth.findUserByEmail(email)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak ditemukan'
      })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Password salah'
      })
    }

    const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Role ini tidak diizinkan login sebagai pengguna'
      })
    }

    if (user.status !== 'aktif') {
      return res.status(403).json({
        success: false,
        message: 'Akun belum aktif'
      })
    }

    const token = jwt.sign(
      {
        id_user: user.id_user,
        email: user.email,
        role: user.role,
        kaleb: user.kaleb
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      // success: true,
      token,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
})

router.post('/api/user/register', async (req, res) => {
  try {
    const { nama, email, password, role } = req.body

    if (!nama || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, password, dan role wajib diisi'
      })
    }

    const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid'
      })
    }

    const existing = await User.findUserByEmail(email)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      })
    }

    const idUser = await User.createUser({
      nama,
      email,
      password,
      role,
      kaleb: '0',
      status: 'proses'
    })

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Akun menunggu aktivasi admin.',
      data: {
        id_user: idUser,
        status: 'proses'
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
})

module.exports = router
