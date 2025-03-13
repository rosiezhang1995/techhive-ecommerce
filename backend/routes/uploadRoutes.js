import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'backend/uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage settings for uploaded files
const storage = multer.diskStorage({
	// Define files store destination
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	// Define how files should be named
	filename: (req, file, cb) => {
		const extname = path.extname(file.originalname); // Get file extension
		// Create unique filename: fieldname + timestamp + original extension
		cb(null, `${file.fieldname}-${Date.now()}${extname}`);
	},
});

// File filter for accepting certain image types
const fileFilter = (req, file, cb) => {
	// Allow jpg, jpeg, png, webp
	const filetypes = /jpe?g|png|webp/;
	const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

	const extname = path.extname(file.originalname).toLowerCase();
	const mimetype = file.mimetype;

	// Check if the file matches allowed types
	if (filetypes.test(extname) && mimetypes.test(mimetype)) {
		cb(null, true); // Accept the file
	} else {
		cb(new Error('Images only'), false); // Reject the file
	}
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

// POST route for handling image uploads
router.post('/', (req, res) => {
	uploadSingleImage(req, res, (err) => {
		if (err) {
			res.status(400).send({ message: err.message });
		} else if (req.file) {
			res.status(200).send({
				message: 'Image uploaded successfully',
				image: `/uploads/${req.file.filename}`,
			});
		} else {
			res.status(400).send({ message: 'No image file provided' });
		}
	});
});

export default router;
