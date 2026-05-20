const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Auth = require('../models/Auth')

router.get('/login', function(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard')
  }

  return res.render('login')
})

router.post('/login', async function(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await Auth.findUserByEmail(email)

    if (!user) {
      req.flash('error', 'Email tidak ditemukan')
      return res.redirect('/login')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      req.flash('error', 'Password salah')
      return res.redirect('/login')
    }

    if (user.role !== 'admin' && String(user.kaleb) !== '1') {
      req.flash('error', 'Akun tidak valid')
      return res.redirect('/login')
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
    return res.redirect('/login')
  }
})

router.post('/api/auth/login', async function(req, res, next) {
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
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id_user: user.id_user,
        email: user.email,
        role: user.role,
        kaleb: user.kaleb
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
