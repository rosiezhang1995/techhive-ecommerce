import asyncHandler from '../middlewares/asyncHandler.js';
import Product from '../models/productModel.js';

// Maximum allowed length for product name
const MAX_NAME_LENGTH = 50;

// Create/Add product function
const addProduct = asyncHandler(async (req, res) => {
	try {
		const {
			name,
			description,
			price,
			category,
			brand,
			quantity,
			image,
			countInStock,
		} = req.body;

		// Validation
		switch (true) {
			case !name:
				return res.status(400).json({ error: 'Name is required!' });
			case !description:
				return res.status(400).json({ error: 'Description is required!' });
			case !price:
				return res.status(400).json({ error: 'Price is required!' });
			case !category:
				return res.status(400).json({ error: 'Category is required!' });
			case !brand:
				return res.status(400).json({ error: 'Brand is required!' });
			case !quantity:
				return res.status(400).json({ error: 'Quantity is required!' });
			case !image:
				return res.status(400).json({ error: 'Image is required!' });
		}

		// Create product
		const product = new Product({
			name,
			description,
			price,
			category,
			brand,
			quantity,
			image,
			countInStock: countInStock || 0,
			// Provide defaults for required fields
			rating: 0,
			numReviews: 0,
		});

		const savedProduct = await product.save();

		res.json(savedProduct);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Update product details function
const updateProductDetails = asyncHandler(async (req, res) => {
	try {
		const {
			name,
			description,
			price,
			category,
			brand,
			quantity,
			image,
			countInStock,
		} = req.body;

		// Validation
		switch (true) {
			case !name:
				return res.status(400).json({ error: 'Name is required!' });
			case name.length > MAX_NAME_LENGTH:
				return res.status(400).json({
					error: `Name must be ${MAX_NAME_LENGTH} characters or less!`,
				});
			case !description:
				return res.status(400).json({ error: 'Description is required!' });
			case !price:
				return res.status(400).json({ error: 'Price is required!' });
			case !category:
				return res.status(400).json({ error: 'Category is required!' });
			case !brand:
				return res.status(400).json({ error: 'Brand is required!' });
			case !quantity:
				return res.status(400).json({ error: 'Quantity is required!' });
			case !image:
				return res.status(400).json({ error: 'Image is required!' });
		}

		// Create an update object with all fields
		const updateData = {
			name,
			description,
			price,
			category,
			brand,
			quantity,
			image,
			countInStock,
		};

		const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
		});

		// Check if the product exists
		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}
		res.json(product);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Delete product function
const removeProduct = asyncHandler(async (req, res) => {
	try {
		const product = await Product.findByIdAndDelete(req.params.id);
		res.json(product);
	} catch (error) {
		res.status(500).json({ error: 'Server error!' });
	}
});

// Fetch products as a paginated list matching an optional search keyword
const fetchProducts = asyncHandler(async (req, res) => {
	try {
		const pageSize = 6;

		const keyword = req.query.keyword
			? {
					name: {
						$regex: req.query.keyword,
						$options: 'i',
					},
			  }
			: {};
		const count = await Product.countDocuments({ ...keyword });
		const products = await Product.find({ ...keyword }).limit(pageSize);

		res.json({
			products,
			page: 1,
			pages: Math.ceil(count / pageSize),
			hasMore: false,
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error!' });
	}
});

// Fetch product by its id
const fetchProductById = asyncHandler(async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			return res.json(product);
		} else {
			res.status(404);
			throw new Error('Product not found');
		}
	} catch (error) {
		res.status(404).json({ error: 'Product not found.' });
	}
});

// Fetch product by category
const fetchProductsByCategory = asyncHandler(async (req, res) => {
	try {
		const { category } = req.params;

		const products = await Product.find({
			category,
			_id: { $ne: req.query.excludeId },
		})
			.limit(6)
			.sort({ createdAt: -1 });

		res.json(products);
	} catch (error) {
		res.status(500).json({ error: 'Server Error' });
	}
});

const fetchAllProducts = asyncHandler(async (req, res) => {
	try {
		const products = await Product.find({})
			.populate('category')
			.limit(12)
			.sort({ createdAt: -1 });

		res.json(products);
	} catch (error) {
		res.json({ error: 'Server error' });
	}
});

// Add review to a product
const addProductReview = asyncHandler(async (req, res) => {
	try {
		const { rating, comment } = req.body;
		// Find the product by Id
		const product = await Product.findById(req.params.id);

		// Check if the product exists
		if (product) {
			// Check if the user has already submit the review for the product
			const alreadyReviewed = product.reviews.find(
				(r) => r.user.toString() === req.user._id.toString()
			);

			if (alreadyReviewed) {
				res.status(400);
				throw new Error('Product already reviewed!');
			}

			// Create a new review object
			const review = {
				name: req.user.username,
				rating: Number(rating),
				comment,
				user: req.user._id,
			};

			// Push the new review to reviews array
			product.reviews.push(review);

			// Update the number of the product's total reviews
			product.numReviews = product.reviews.length;

			// Recalculate the average rating for the product
			product.rating =
				product.reviews.reduce((acc, item) => item.rating + acc, 0) /
				product.reviews.length;

			await product.save();
			res.status(201).json({ message: 'Review added!' });
		} else {
			res.status(404);
			throw new Error('Product not found');
		}
	} catch (error) {
		res.status(400).json(error.message);
	}
});

// Fetch top rating products
const fetchTopProducts = asyncHandler(async (req, res) => {
	try {
		// Sort products by rating (descending order) and limit to 4
		const products = await Product.find({}).sort({ rating: -1 }).limit(4);
		res.json(products);
	} catch (error) {
		res.status(400).json(error.message);
	}
});

// Fetch newest added products
const fetchNewProducts = asyncHandler(async (req, res) => {
	try {
		// Sort product by id in descending order (newest first), limit to 6 products
		const products = await Product.find({}).sort({ _id: -1 }).limit(6);
		res.json(products);
	} catch (error) {
		res.status(400).json(error.message);
	}
});

// Filter products based on the selected categories and price range.
const filterProducts = asyncHandler(async (req, res) => {
	try {
		const { checked, radio } = req.body;
		let args = {};
		if (checked.length > 0) args.category = checked;
		if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

		const products = await Product.find(args);

		res.json(products);
	} catch (error) {
		res.status(500).json({ error: 'Server Error' });
	}
});

export {
	addProduct,
	updateProductDetails,
	removeProduct,
	fetchProducts,
	fetchProductById,
	fetchProductsByCategory,
	fetchAllProducts,
	addProductReview,
	fetchTopProducts,
	fetchNewProducts,
	filterProducts,
};
