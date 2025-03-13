import User from '../models/userModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import bcrypt from 'bcryptjs';
import createToken from '../utils/createToken.js';

// Create a new user (Register)
const createUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		res.status(400);
		throw new Error('Please fill all the inputs.');
	}

	// Check if user already exists
	const userExists = await User.findOne({ email });
	if (userExists) {
		res.status(400);
		throw new Error('User already exists');
	}

	// Encrypt password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create  a new user
	const newUser = new User({ username, email, password: hashedPassword });

	await newUser.save();
	createToken(res, newUser._id); // Set JWT token in cookies

	res.status(201).json({
		_id: newUser._id,
		username: newUser.username,
		email: newUser.email,
		isAdmin: newUser.isAdmin,
	});
});

// User Login (Authentication)
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// Find user by email
	const existingUser = await User.findOne({ email });

	if (!existingUser) {
		res.status(401);
		throw new Error('Invalid email or password');
	}

	// Validate password
	const isPasswordValid = await bcrypt.compare(password, existingUser.password);
	if (!isPasswordValid) {
		res.status(401);
		throw new Error('Invalid email or password');
	}

	// Set JWT cookie
	createToken(res, existingUser._id);

	res.status(200).json({
		_id: existingUser._id,
		username: existingUser.username,
		email: existingUser.email,
		isAdmin: existingUser.isAdmin,
	});
});

// Logout user (Clear JWT cookie)
const logoutCurrentUser = asyncHandler(async (req, res) => {
	res.cookie('jwt', '', {
		httpOnly: true,
		expires: new Date(0),
	});

	res.status(200).json({ message: 'Logged out successfully.' });
});

// Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}

	res.json({
		_id: user._id,
		username: user.username,
		email: user.email,
	});
});

// Update user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}

	user.username = req.body.username || user.username;
	user.email = req.body.email || user.email;

	if (req.body.password) {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		user.password = hashedPassword;
	}

	const updatedUser = await user.save();

	res.json({
		_id: updatedUser._id,
		username: updatedUser.username,
		email: updatedUser.email,
		isAdmin: updatedUser.isAdmin,
	});
});

// Delete user (Admin only)
const deleteUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}

	if (user.isAdmin) {
		res.status(400);
		throw new Error('Cannot delete admin user.');
	}

	await User.deleteOne({ _id: user.id });
	res.json({ message: 'User removed.' });
});

// Get user by ID (Admin only)
const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');

	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}

	res.json(user);
});

// Update user by ID (Admin only)
const updateUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}

	user.username = req.body.username || user.username;
	user.email = req.body.email || user.email;
	user.isAdmin = Boolean(req.body.isAdmin);

	const updatedUser = await user.save();

	res.json({
		_id: updatedUser._id,
		username: updatedUser.username,
		email: updatedUser.email,
		isAdmin: updatedUser.isAdmin,
	});
});

export {
	createUser,
	loginUser,
	logoutCurrentUser,
	getAllUsers,
	getCurrentUserProfile,
	updateCurrentUserProfile,
	deleteUserById,
	getUserById,
	updateUserById,
};
