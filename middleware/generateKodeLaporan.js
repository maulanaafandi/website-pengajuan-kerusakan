function generateKodeLaporan(req, res, next) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  req.kode_laporan = `${date}-${time}-${random}`
  next()
}

module.exports = generateKodeLaporan
