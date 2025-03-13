import { useParams } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
	useDeliverOrderMutation,
	useGetOrderDetailsQuery,
	useGetPaypalClientIdQuery,
	usePayOrderMutation,
} from '../../redux/api/orderApiSlice';

const Order = () => {
	const { id: orderId } = useParams();
	const {
		data: order,
		refetch,
		isLoading,
		error,
	} = useGetOrderDetailsQuery(orderId);

	const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
	const [deliverOrder, { isLoading: loadingDeliver }] =
		useDeliverOrderMutation();
	const { userInfo } = useSelector((state) => state.auth);

	const {
		data: paypal,
		isLoading: loadingPayPal,
		error: errorPayPal,
	} = useGetPaypalClientIdQuery();

	// Handle successful PayPal payment approval
	// Captures the payment and updates order status
	function onApprove(data, actions) {
		return actions.order.capture().then(async function (details) {
			try {
				await payOrder({ orderId, details });
				refetch();
				toast.success('Order is paid');
			} catch (error) {
				toast.error(error?.data?.message || error.message);
			}
		});
	}

	// Create PayPal order with correct currency and amount
	// Returns a promise that resolves to the order ID
	function createOrder(data, actions) {
		return actions.order
			.create({
				purchase_units: [
					{
						amount: {
							currency_code: 'AUD',
							value: order.totalPrice.toString(),
						},
					},
				],
			})
			.then((orderID) => {
				return orderID;
			})
			.catch((err) => {
				toast.error('Could not create PayPal order');
				throw err;
			});
	}
	// Handler paypal errors
	function onError(err) {
		toast.error(err?.message);
	}

	// Mark order as delivered (admin only)
	const deliverHandler = async () => {
		try {
			await deliverOrder(orderId);
			refetch();
			toast.success('Order marked as delivered');
		} catch (err) {
			toast.error(err?.data?.message || err.message);
		}
	};

	return isLoading ? (
		<Loader />
	) : error ? (
		// Show error message if order fetch fails
		<Message variant="danger">{error.data.message}</Message>
	) : (
		<div className="container flex flex-col ml-[10rem] md:flex-row">
			{/* Left column - Order items */}
			<div className="md: w-2/3 pr-4">
				<div className="border gray-300 mt-5 pb-4 mb-5">
					{order.orderItems.length === 0 ? (
						<Message>Order is Empty</Message>
					) : (
						<div className="overflow-x-auto">
							{/* Order items table */}
							<table className="w-[80%]">
								<thead>
									<tr>
										<th className="p-2">Image</th>
										<th className="p-2">Product</th>
										<th className="p-2">Quantity</th>
										<th className="p-2">Unit Price</th>
										<th className="p-2">Total</th>
									</tr>
								</thead>

								<tbody>
									{/* Map through order items */}
									{order.orderItems.map((item, index) => (
										<tr key={index}>
											<td className="p-2">
												<div className="flex justify-center items-center">
													<img
														src={`${import.meta.env.VITE_API_URL}${item.image}`}
														alt={item.name}
														className="w-16 h-16 object-cover rounded"
													/>
												</div>
											</td>
											<td className="p-2 text-center">{item.name}</td>
											<td className="p-2 text-center">{item.qty}</td>
											<td className="p-2 text-center">${item.price}</td>
											<td className="p-2 text-center">
												${(item.qty * item.price).toFixed(2)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Right column - Order summary and payment */}
			<div className="md: w-1/3">
				{/* Shipping info */}
				<div className="mt-5 border-gray-300 pb-4 mb-4">
					{' '}
					<h2 className="text-xl font-bold mb-2">Shipping</h2>
					<p className="mt-4 mb-4">
						<strong className="text-pink-500">Order: </strong> {order._id}
					</p>
					<p className="mb-4">
						<strong className="text-pink-500">Name:</strong>{' '}
						{order.user.username}
					</p>
					<p className="mb-4">
						<strong className="text-pink-500">Email:</strong> {order.user.email}
					</p>
					<p className="mb-4">
						<strong className="text-pink-500">Address:</strong>{' '}
						{order.shippingAddress.address}, {order.shippingAddress.city}{' '}
						{order.shippingAddress.postalCode}, {order.shippingAddress.country}
					</p>
					<p className="mb-4">
						<strong className="text-pink-500">Payment Method:</strong>{' '}
						{order.paymentMethod}
					</p>
					{/* Payment status */}
					{order.isPaid ? (
						<Message variant="success">Paid on {order.paidAt}</Message>
					) : (
						<Message variant="danger">Not paid</Message>
					)}
				</div>

				{/* Order price summary */}
				<h2 className="text-xl font-bold mb-2 mt-[3rem]">Order Summary</h2>
				<div className="flex justify-between mb-2">
					<span>Items</span>
					<span>${order.itemsPrice}</span>
				</div>
				<div className="flex justify-between mb-2">
					<span>Shipping</span>
					<span>
						{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice}`}
					</span>
				</div>
				<div className="flex justify-between mb-2">
					<span>GST(included)</span>
					<span>${order.taxPrice}</span>
				</div>
				<div className="flex justify-between mb-2">
					<span>Total</span>
					<span>${order.totalPrice}</span>
				</div>

				{/* PayPal payment section */}
				{!order.isPaid && (
					<div>
						{loadingPay && <Loader />}
						{loadingPayPal ? (
							<Loader />
						) : errorPayPal ? (
							<Message variant="danger">
								{errorPayPal?.data?.message || 'Error loading payment system'}
							</Message>
						) : paypal?.clientId ? (
							<PayPalScriptProvider
								options={{
									'client-id': paypal.clientId,
									currency: 'AUD',
									intent: 'capture',
									'enable-funding': 'paypal',
								}}
							>
								<PayPalButtons
									forceReRender={[paypal.clientId, order.totalPrice]}
									createOrder={createOrder}
									onApprove={onApprove}
									onError={onError}
								/>
							</PayPalScriptProvider>
						) : (
							<Message>Loading payment options...</Message>
						)}
					</div>
				)}

				{/* Mark as delivered button - admin only, for paid orders */}
				{loadingDeliver && <Loader />}
				{userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
					<div className="mt-6">
						<button
							type="button"
							className="bg-pink-500 text-white w-full py-2 rounded-full hover:bg-pink-600 transition-colors"
							onClick={deliverHandler}
						>
							Mark as delivered
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Order;
