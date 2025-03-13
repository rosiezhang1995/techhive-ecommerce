import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';

const authenticate = asyncHandler(async (req, res, next) => {
	let token = req.cookies.jwt; // Extract JWT from cookie

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, token missing.' });
	}

	try {
		// Verify JWT
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Ensure the decoded token has a valid ID field
		if (!decoded.userId) {
			return res.status(401).json({ message: 'Invalid token structure.' });
		}

		// Use decoded userId to find user but exclude password
		req.user = await User.findById(decoded.userId).select('-password');

		if (!req.user) {
			return res.status(401).json({ message: 'User not found.' });
		}

		next();
	} catch (error) {
		console.error('JWT Error:', error.message);
		res.status(401).json({ message: 'Not authorized, token failed.' });
	}
});

// Check admin status
const authorizeAdmin = (req, res, next) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(403).json({ message: 'Not authorized as an admin.' });
	}
};

export { authenticate, authorizeAdmin };
