const express = require('express')
const router = express.Router()
const authAdmin = require('../middleware/auth')
const User = require('../models/User')

const {
  paginateRows
} = require('../utils/adminHelpers')

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

router.patch('/admin/users/status/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id)
    if (!user) {
      req.flash('error', 'User tidak ditemukan')
      return res.redirect('/admin/users')
    }

    if (user.role === 'admin') {
      req.flash('error', 'Status akun admin tidak bisa diubah')
      return res.redirect('/admin/users')
    }

    await User.updateStatus(req.params.id, req.body.status)
    req.flash('success', 'Status akun berhasil diupdate')
    return res.redirect('/admin/users')
  } catch (err) {
    console.log(err)
    req.flash('error', err.message || 'Gagal update status akun')
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

    if (user.status !== 'nonaktif') {
      req.flash('error', 'User hanya bisa dihapus jika status akun nonaktif')
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
