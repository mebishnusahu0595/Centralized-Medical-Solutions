import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'images' || file.fieldname === 'beforeImages' || file.fieldname === 'afterImages') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400));
    }
  } else if (file.fieldname === 'documents' || file.fieldname === 'pdfReport') {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new AppError('Invalid document format! Please upload PDF or Word documents.', 400));
    }
  } else {
    cb(null, true);
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10) * 1024 * 1024;

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxSize }
});
