import multer from 'multer'
import { __dirname } from '../utils/utils.js'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+'/tmp/my-uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage })

export default upload