const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/authControllers')

router.get('/login', AuthController.loginPage)
router.post('/login', AuthController.loginWeb)
router.post('/api/auth/login', AuthController.loginApi)


module.exports = router