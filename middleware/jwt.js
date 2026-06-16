const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer', '').trim()
    if (!token) {
        return res.status(403).json({ message: 'Token tidak diberikan'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa'})
        }
        req.user = decoded
        next()
    })
}

function authorize(AllowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json ({ message: 'Pengguna tidak diautentikasi'})
        }
        const userRole = req.user.userType || req.user.role
        if (!AllowedRoles.includes(userRole)) {
            return res.status(403).json ({ message: 'Akses ditolak: Anda tidak memiliki izin'}) 
        }
        next()
    }
}

module.exports = {verifyToken, authorize}