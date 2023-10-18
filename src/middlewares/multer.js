import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename, '..'));

const imagefilter = (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    cb(null, true)
  } else {
    cb(new Error('Please upload a valid image file'))
  }
}

const ProductImageUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      return cb(null, join(__dirname, "..", `/public/img`))
    },
    filename: (req, file, cb) => {
      const arr = file.originalname.split(".")
      return cb(null, req.user.id + "-" + file.fieldname + "." + arr[1])
    }
  }),
  fileFilter: imagefilter
})

const UserDocumentUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      return cb(null, join(__dirname, `/documents/`))
    },
    filename: (req, file, cb) => {
      const arr = file.originalname.split(".")
      return cb(null, req.user.id + "-" + file.fieldname + "." + arr[1])
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error('Please upload a valid image file'))
    }
  }
})

const uploadDirectory = join(__dirname, "..", 'public', 'img');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage, fileFilter: imagefilter});

export { __filename, __dirname, upload, UserDocumentUploader, ProductImageUploader };

