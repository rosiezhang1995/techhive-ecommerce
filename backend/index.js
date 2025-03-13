// packages
import path from 'path';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// utiles
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/config/paypal', (req, res) => {
	res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Serve uploaded images
const __dirname = path.resolve();
// Set up static file serving for the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

app.listen(port, () => console.log(`server running on port ${port}`));
