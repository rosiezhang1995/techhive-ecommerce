import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// Utility Function
function calcPrices(orderItems) {
	const itemsPrice = orderItems.reduce(
		(acc, item) => acc + item.price * item.qty,
		0
	);

	const shippingPrice = itemsPrice > 100 ? 0 : 10;
	const taxRate = 0.1; // 10% for Australian GST
	const taxPrice = ((itemsPrice / (1 + taxRate)) * taxRate).toFixed(2); // Calculate GST component

	const totalPrice = (itemsPrice + shippingPrice).toFixed(2); // Total price already includes GST

	return {
		itemsPrice: itemsPrice.toFixed(2),
		shippingPrice: shippingPrice.toFixed(2),
		taxPrice,
		totalPrice,
	};
}

const createOrder = async (req, res) => {
	try {
		const { orderItems, shippingAddress, paymentMethod } = req.body;

		if (orderItems && orderItems.length === 0) {
			res.status(400);
			throw new Error('No order items');
		}

		// Fetch products from the database using the product IDs from the orderItems
		const itemsFromDB = await Product.find({
			_id: { $in: orderItems.map((x) => x._id) },
		});

		// Map over the orderItems and match them with product from database
		const dbOrderItems = orderItems.map((itemFromClient) => {
			// Find the matching product from the database for each order item
			const matchingItemFromDB = itemsFromDB.find(
				(itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
			);

			if (!matchingItemFromDB) {
				res.status(404);
				throw new Error(`Product not found: ${itemFromClient._id}`);
			}

			return {
				...itemFromClient,
				product: itemFromClient._id, // Assign the product ID
				price: matchingItemFromDB.price, // Set the price from the database product
				_id: undefined, // Remove the _id field from the order item to avoid redundancy
			};
		});

		const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
			calcPrices(dbOrderItems);

		// Create a new order instance with the calculated prices
		const order = new Order({
			orderItems: dbOrderItems,
			user: req.user._id,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			taxPrice,
			shippingPrice,
			totalPrice,
		});

		// Save the created order to the database
		const createdOrder = await order.save();
		// Successful creation
		res.status(201).json(createdOrder);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getAllOrders = async (req, res) => {
	try {
		// Fetch all orders and populate the 'user' field with only 'id' and 'username'
		const orders = await Order.find({}).populate('user', 'id username');
		res.json(orders);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getUserOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id });
		res.json(orders);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const countTotalOrders = async (req, res) => {
	try {
		const totalOrders = await Order.countDocuments();
		res.json({ totalOrders });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const calculateTotalSales = async (req, res) => {
	try {
		const orders = await Order.find();
		const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
		res.json({ totalSales });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const calculateTotalSalesByDate = async (req, res) => {
	try {
		const salesByDate = await Order.aggregate([
			{
				$match: {
					isPaid: true,
				},
			},
			{
				$group: {
					_id: {
						$dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
					},
					totalSales: { $sum: '$totalPrice' },
				},
			},
		]);

		res.json(salesByDate);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const findOrderById = async (req, res) => {
	try {
		// Fetch a specific order and populate the 'user' field with only 'username' and 'email'
		const order = await Order.findById(req.params.id).populate(
			'user',
			'username email'
		);

		if (order) {
			res.json(order);
		} else {
			res.status(404);
			throw new Error('Order not found');
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const markOrderAsPaid = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);

		if (order) {
			order.isPaid = true;
			order.paidAt = Date.now();
			order.paymentResult = {
				id: req.body.id,
				status: req.body.status,
				update_time: req.body.update_time,
				email_address: req.body.payer.email_address,
			};

			const updateOrder = await order.save();
			res.status(200).json(updateOrder);
		} else {
			res.status(404);
			throw new Error('Order not found');
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const markOrderAsDelivered = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);

		if (order) {
			order.isDelivered = true;
			order.deliveredAt = Date.now();

			const updatedOrder = await order.save();
			res.json(updatedOrder);
		} else {
			res.status(404);
			throw new Error('Order not found');
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {
	createOrder,
	getAllOrders,
	getUserOrders,
	countTotalOrders,
	calculateTotalSales,
	calculateTotalSalesByDate,
	findOrderById,
	markOrderAsPaid,
	markOrderAsDelivered,
};
