const validateEmail = (req, res, next) => {
  const { email } = req.body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid.' })
  }

  next()
}

module.exports = validateEmail
