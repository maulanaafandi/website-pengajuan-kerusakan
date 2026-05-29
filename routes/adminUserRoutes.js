const express = require('express')
const router = express.Router()

const authAdmin = require('../middleware/auth')
const User = require('../models/User')

const {
  paginateRows
} = require('../utils/adminHelpers')

router.get('/admin/buat-akun', authAdmin, (req, res) => {
  return res.render('admin/buat-akun')
})

router.post('/admin/buat-akun', authAdmin, async (req, res) => {
    try {
      const { email, role } = req.body
      if (!email || !role) {
        req.flash('error', 'Email dan role wajib diisi')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      const allowedRoles = ['mahasiswa', 'dosen', 'satpam', 'tendik', 'plp']
      if (!allowedRoles.includes(role)) {
        req.flash('error', 'Role tidak valid')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      const existing = await User.findUserByEmail(email)
      if (existing) {
        req.flash('error', 'Email sudah terdaftar')
        req.flash('oldInput', req.body)
        return res.redirect('/admin/buat-akun')
      }

      await User.createUser({ email, role, kaleb: role === 'dosen' ? '1' : '0', password: 'user123' })
      req.flash('success', 'Akun berhasil dibuat')
      return res.redirect('/admin/buat-akun')
    } catch (err) {
      console.log(err)
      req.flash('error', 'Gagal membuat akun')
      req.flash('oldInput', req.body)
      return res.redirect('/admin/buat-akun')
    }
  })

router.get('/admin/users', authAdmin, async (req, res) => {
  try {
    const allUsers = await User.getUsers(req.query.search || '')
    const {
      rows: users,
      pagination
    } = paginateRows(allUsers, req.query)
    return res.render('admin/users/index', {
      users,
      pagination,
      search: req.query.search || ''
    })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat data user')
    return res.redirect('/dashboard')

  }
})

router.get('/admin/users/edit/:id', authAdmin, async (req, res) => {
  try {

    const user = await User.getUserById(req.params.id)
    if (!user) {
      req.flash('error', 'User tidak ditemukan')
      return res.redirect('/admin/users')
    }

    if (user.role === 'admin') {
      req.flash('error', 'Akun admin tidak bisa diedit')
      return res.redirect('/admin/users')
    }

    return res.render('admin/users/edit', { user })
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal memuat edit user')
    return res.redirect('/admin/users')
  }
})

router.patch('/admin/users/edit/:id', authAdmin, async (req, res) => {
  try {

    const user = await User.getUserById(req.params.id)
    if (!user) {
      req.flash('error', 'User tidak ditemukan')
      return res.redirect('/admin/users')
    }

    await User.updateUser(req.params.id, req.body)
    req.flash('success', 'User berhasil diupdate')
    return res.redirect('/admin/users')
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal update user')
    return res.redirect('/admin/users')

  }
})

router.delete('/admin/users/delete/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id)
    if (!user) {
      req.flash('error', 'User tidak ditemukan')
      return res.redirect('/admin/users')
    }
    await User.deleteUser(req.params.id)
    req.flash('success', 'User berhasil dihapus')
    return res.redirect('/admin/users')
  } catch (err) {
    console.log(err)
    req.flash('error', 'Gagal hapus user')
    return res.redirect('/admin/users')
  }
})

module.exports = router
