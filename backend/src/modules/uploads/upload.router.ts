import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG, PNG ve WebP formatları desteklenmektedir.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Single image upload
router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Resim yüklenemedi',
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    success: true,
    data: {
      url: imageUrl,
      filename: req.file.filename,
    },
  });
});

// Multiple images upload (max 5)
router.post('/images', authenticate, upload.array('images', 5), (req, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Resim yüklenemedi',
    });
  }

  const images = files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
  }));
  
  res.json({
    success: true,
    data: images,
  });
});

export default router;
