import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../../components/Message';
import ProgressSteps from '../../components/ProgressSteps';
import Loader from '../../components/Loader';
import { useCreateOrderMutation } from '../../redux/api/orderApiSlice';
import { clearCartItems } from '../../redux/features/cart/cartSlice';

const PlaceOrder = () => {
	const navigate = useNavigate();
	const cart = useSelector((state) => state.cart);
	const [createOrder, { isLoading, error }] = useCreateOrderMutation();

	// Redirect to shipping page if shipping address is not available
	useEffect(() => {
		if (!cart.shippingAddress.address) {
			navigate('/shipping');
		}
	}, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

	const dispatch = useDispatch();

	// Handler for placing an order
	// Creates order in the backend, clears cart, and navigates to order details
	const placeOrderHandler = async () => {
		try {
			const res = await createOrder({
				orderItems: cart.cartItems,
				shippingAddress: cart.shippingAddress,
				paymentMethod: cart.paymentMethod,
				itemsPrice: cart.itemsPrice,
				shippingPrice: cart.shippingPrice,
				taxPrice: cart.taxPrice,
				totalPrice: cart.totalPrice,
			}).unwrap();
			dispatch(clearCartItems());
			navigate(`/order/${res._id}`);
		} catch (error) {
			toast.error(error);
		}
	};

	return (
		<>
			{/* Checkout progress indicator */}
			<ProgressSteps step1 step2 step3 />

			<div className="container mx-auto mt-8">
				{/* Show message if cart is empty */}
				{cart.cartItems.length === 0 ? (
					<Message>Your Cart is Empty</Message>
				) : (
					<div className="overflow-x-auto">
						{/* Cart items table */}
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<td className="px-1 py-2 text-left align-top">Image</td>
									<td className="px-1 py-2 text-left ">Product</td>
									<td className="px-1 py-2 text-left ">Quantity</td>
									<td className="px-1 py-2 text-left ">Price</td>
									<td className="px-1 py-2 text-left ">Total</td>
								</tr>
							</thead>
							<tbody>
								{/* Map through cart items and display details for each one */}
								{cart.cartItems.map((item, index) => (
									<tr key={index}>
										{/* Product image */}
										<td className="p-2">
											<img
												src={item.image}
												alt={item.name}
												className="w-16 h-16 object-cover rounded"
											/>
										</td>
										{/* Product Name with link to its details page */}
										<td className="p-2">
											<Link
												to={`/product/${item._id}`}
												className="underline font-semibold"
											>
												{item.name}
											</Link>
										</td>
										{/* Item quantity */}
										<td className="p-2">{item.qty}</td>
										{/* Item price */}
										<td className="p-2">${item.price.toFixed(2)}</td>
										{/* Items total price */}
										<td className="p-2">
											{' '}
											${(item.qty * item.price).toFixed(2)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{/* Order Summary Section*/}
				<div className="mt-8">
					<h2 className="text-2xl font-semibold mb-5">Order Summary</h2>
					<div className="flex justify-between flex-wrap p-8 bg-[#181818]">
						{/* Price details */}
						<ul className="text-lg">
							<li>
								<span className="font-semibold mb-4">Items:</span> $
								{cart.itemsPrice}
							</li>
							<li>
								<span className="font-semibold mb-4">Shipping:</span>{' '}
								{Number(cart.shippingPrice) === 0
									? 'FREE'
									: `$${cart.shippingPrice}`}
							</li>
							<li>
								<span className="font-semibold mb-4">GST(included):</span> $
								{cart.taxPrice}
							</li>
							<li>
								<span className="font-semibold mb-4">Total:</span> $
								{cart.totalPrice}
							</li>
						</ul>
						{error && <Message variant="danger">{error.data.message}</Message>}

						{/* Shipping details */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Shipping</h2>
							<p>
								<strong>Address: </strong>
								{cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
								{cart.shippingAddress.postalCode},{' '}
								{cart.shippingAddress.country}
							</p>
						</div>

						{/* Payment Method */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Payment Method</h2>
							<strong>Method:</strong> {cart.paymentMethod}
						</div>
					</div>

					{/* Place order button */}
					<div className="flex justify-center mt-6">
						<button
							className="bg-pink-500 text-white py-2 px-8 rounded-full text-lg hover:bg-pink-600 transition-colors w-1/3 max-w-xs"
							disabled={cart.cartItems.length === 0}
							onClick={placeOrderHandler}
						>
							Place Order
						</button>
					</div>

					{isLoading && <Loader />}
				</div>
			</div>
		</>
	);
};

export default PlaceOrder;
