const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('UPLOAD MIME:', file.mimetype);
  console.log('UPLOAD NAME:', file.originalname);

  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const ext = path.extname(file.originalname).toLowerCase();

  const isImageMime =
    file.mimetype && file.mimetype.startsWith('image/');

  const isAllowedExt = allowedExt.includes(ext);

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar (jpg, jpeg, png, webp, heic, heif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;