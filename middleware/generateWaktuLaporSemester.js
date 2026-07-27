const getSemesterInfo = (inputDate = new Date()) => {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate)
  const bulan = date.getMonth() + 1
  const tahun = date.getFullYear()

  if (bulan >= 8 && bulan <= 12) {
    return { semester: 'Ganjil', tahunAkademik: tahun }
  }

  if (bulan === 1) {
    return { semester: 'Ganjil', tahunAkademik: tahun - 1 }
  }

  return { semester: 'Genap', tahunAkademik: tahun - 1 }
}

const getWaktuLaporSemester = (inputDate = new Date()) => {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate)
  const { semester, tahunAkademik } = getSemesterInfo(date)
  return `${semester.toLowerCase()}_${tahunAkademik}/${tahunAkademik + 1}`
}

const generateWaktuLaporSemester = (req, res, next) => {
  req.waktu_lapor_semester = getWaktuLaporSemester(new Date())
  next()
}

module.exports = generateWaktuLaporSemester
module.exports.getSemesterInfo = getSemesterInfo
module.exports.getWaktuLaporSemester = getWaktuLaporSemester
