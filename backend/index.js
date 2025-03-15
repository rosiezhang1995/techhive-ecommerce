// Packages
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Utilities & Routes
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // Cloudinary Uploads
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
const port = process.env.PORT || 5001;
connectDB();

const app = express();

const allowedOrigins = [
	'https://techhive-ecommerce-platform.onrender.com',
	'http://localhost:5173',
];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	})
);

app.use((req, res, next) => {
	if (req.originalUrl === '/api/upload') {
		next(); // Skip express.json() for uploads
	} else {
		express.json({ limit: '10mb' })(req, res, next);
	}
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', (req, res, next) => {
	if (req.body && !req.fields) {
		req.fields = req.body;
	}
	next();
});
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); // Excluded from JSON parsing

// PayPal Config
app.get('/api/config/paypal', (req, res) => {
	res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
