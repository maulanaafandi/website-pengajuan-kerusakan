const upload = require('./upload')

function uploadLaporan(req, res, next) {
  upload.single('bukti_foto')(req, res, (err) => {
    if (err) {
      console.log('UPLOAD ERROR:', err)
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }

    return next()
  })
}

module.exports = uploadLaporan
