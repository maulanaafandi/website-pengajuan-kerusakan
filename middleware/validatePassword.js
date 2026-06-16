const validatePassword = (req, res, next) => {
  const kata_sandi = req.body.kata_sandi_baru || req.body.kata_sandi

  if (!kata_sandi) {
    return next()
  }

  if (kata_sandi.length < 6) {
    return res.status(400).json({ message: 'Kata sandi minimal harus 6 karakter.' })
  }

  if (!/[A-Z]/.test(kata_sandi)) {
    return res.status(400).json({ message: 'Kata sandi harus mengandung setidaknya satu huruf kapital.' })
  }

  if (!/[a-z]/.test(kata_sandi)) {
    return res.status(400).json({ message: 'Kata sandi harus mengandung setidaknya satu huruf kecil.' })
  }

  if (!/\d/.test(kata_sandi)) {
    return res.status(400).json({ message: 'Kata sandi harus mengandung setidaknya satu angka.' })
  }

  next()
}

module.exports = validatePassword
