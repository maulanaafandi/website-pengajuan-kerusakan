const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connection = require('../config/db')

class AuthController {
  static loginPage(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard')
    }
    return res.render('login')
  }

  static async loginWeb(req, res) {
    try {
      const { email, password } = req.body

      const [rows] = await connection.query(
        `SELECT * FROM user WHERE email = ? LIMIT 1`,
        [email]
      )

      const user = rows[0]

      if (!user) {
        req.flash('error', 'Email tidak ditemukan')
        return res.redirect('/login')
      }

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        req.flash('error', 'Password salah')
        return res.redirect('/login')
      }

      req.session.user = {
        id_user: user.id_user,
        email: user.email,
        role: user.role,
        kaleb: user.kaleb
      }

      return res.redirect('/dashboard')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Terjadi kesalahan saat login')
      return res.redirect('/login')
    }
  }

  static async loginApi(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi'
        })
      }

      const [rows] = await connection.query(
        `SELECT * FROM user WHERE email = ? LIMIT 1`,
        [email]
      )

      const user = rows[0]

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
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      })
    }
  }
}

module.exports = AuthController