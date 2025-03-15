import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'ecommerce_uploads',
		allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
	},
});

const upload = multer({ storage });

// POST route for handling image uploads
router.post('/', upload.single('image'), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image file provided' });
		}
		res.status(200).json({
			message: 'Image uploaded successfully',
			imageUrl: req.file.path,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Image upload failed', error: error.message });
	}
});

export default router;
