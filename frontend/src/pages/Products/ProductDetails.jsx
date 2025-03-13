import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
	useGetProductDetailsQuery,
	useCreateReviewMutation,
} from '../../redux/api/productApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { FaBox, FaStore } from 'react-icons/fa';
import HeartIcon from './HeartIcon';
import Ratings from './Ratings';
import ProductTabs from './ProductTabs';
import { addToCart } from '../../redux/features/cart/cartSlice';

const ProductDetails = () => {
	const { id: productId } = useParams();
	const dispatch = useDispatch();

	const [qty, setQty] = useState(1);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');

	const {
		data: product,
		isLoading,
		refetch,
		error,
	} = useGetProductDetailsQuery(productId);

	const { userInfo } = useSelector((state) => state.auth);

	const [createReview, { isLoading: loadingProductReview }] =
		useCreateReviewMutation();

	const submitHandler = async (e) => {
		e.preventDefault();

		try {
			await createReview({
				productId,
				rating,
				comment,
			}).unwrap();
			refetch();
			toast.success('Review created successfully');
		} catch (error) {
			toast.error(error?.data || error.message);
		}
	};

	const addToCartHandler = () => {
		dispatch(addToCart({ ...product, qty }));
	};

	return (
		<>
			<div className="mb-8">
				{' '}
				{/* Add margin bottom */}
				<Link
					to="/"
					className="text-white font-semibold hover:underline ml-[10rem]"
				>
					Back
				</Link>
			</div>

			{isLoading ? (
				<Loader />
			) : error ? (
				<Message variant="danger">
					{error?.data?.message || error.message}
				</Message>
			) : (
				<>
					<div className="flex flex-row relative items-between mt-8 ml-[10rem]">
						<div className="relative">
							<img
								src={`${import.meta.env.VITE_API_URL}${product.image}`}
								alt={product.name}
								className="w-full h-full object-cover xl:w-[50rem] lg:w-[45rem] md:w-[30rem] sm:w-[20rem]"
							/>

							<HeartIcon product={product} />
						</div>

						<div className="ml-[2rem] w-full xl:w-[35rem] lg:w-[35rem] md:w-[30rem]">
							<h2 className="text-2xl flex-wrap font-semibold">
								{product.name}
							</h2>
							<p className="my-4 text-[#B0B0B0]">{product.description}</p>

							<p className="text-5xl my-4 font-extrabold">$ {product.price}</p>

							<div className="w-[20rem]">
								<h1 className="flex items-center mb-6">
									<FaStore className="mr-2 text-white" /> Brand: {product.brand}
								</h1>
								<h1 className="flex items-center mb-6 w-[10rem]">
									<FaBox className="mr-2 text-white" /> In Stock:{' '}
									{product.countInStock}
								</h1>
							</div>

							<div className="mb-6">
								<Ratings
									value={product.rating}
									text={`${product.numReviews} ${
										product.numReviews <= 1 ? 'review' : 'reviews'
									}`}
								/>
							</div>

							<div className="mb-6">
								{product.countInStock > 0 && (
									<div>
										<label className="block mb-2 text-white">
											Select quantity
										</label>
										<select
											value={qty}
											onChange={(e) => setQty(Number(e.target.value))}
											className="p-2 w-[6rem] rounded-lg text-black"
										>
											{[...Array(product.countInStock).keys()].map((x) => (
												<option key={x + 1} value={x + 1}>
													{x + 1}
												</option>
											))}
										</select>
									</div>
								)}
							</div>

							<div className="btn-container">
								<button
									onClick={addToCartHandler}
									disabled={product.countInStock === 0}
									className="bg-pink-600 text-white py-2 px-4 rounded-lg mt-4 md:mt-0"
								>
									Add To Cart
								</button>
							</div>
						</div>
					</div>

					<div className="mt-[5rem] ml-[10rem] container flex flex-wrap items-start justify-between">
						<ProductTabs
							loadingProductReview={loadingProductReview}
							userInfo={userInfo}
							submitHandler={submitHandler}
							rating={rating}
							setRating={setRating}
							comment={comment}
							setComment={setComment}
							product={product}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default ProductDetails;
