import express from 'express';
import formidable from 'express-formidable';
const router = express.Router();

// Controllers
import {
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
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';
import checkId from '../middlewares/checkId.js';

router
	.route('/')
	.get(fetchProducts)
	.post(authenticate, authorizeAdmin, addProduct);

router.route('/allproducts').get(fetchAllProducts);
router.route('/:id/reviews').post(authenticate, checkId, addProductReview);

router.get('/top', fetchTopProducts);
router.get('/new', fetchNewProducts);
router
	.route('/:id')
	.get(fetchProductById)
	.put(authenticate, authorizeAdmin, updateProductDetails)
	.delete(authenticate, authorizeAdmin, removeProduct);
router.route('/filtered-products').post(filterProducts);
router.route('/category/:category').get(fetchProductsByCategory);

export default router;
