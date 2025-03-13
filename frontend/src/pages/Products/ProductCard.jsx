import { Link } from 'react-router-dom';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { toast } from 'react-toastify';
import HeartIcon from './HeartIcon';

const ProductCard = ({ p }) => {
	const dispatch = useDispatch();
	const addToCartHandler = (product, qty) => {
		// Dispatch an action to add the product to the cart
		// Spreads the product details and includes the quantity
		dispatch(addToCart({ ...product, qty }));
		toast.success('Item added successfully', {
			position: toast.POSITION.TOP_RIGHT,
			autoClose: 1000,
		});
	};

	return (
		<div className="max-w-sm relative bg-[#1A1A1A] rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
			<section className="relative">
				<Link to={`/product/${p._id}`}>
					<div className="relative h-[300px] overflow-hidden">
						<img
							className="w-full h-full object-cover rounded-t-lg hover:opacity-90 transition-opacity"
							src={`${import.meta.env.VITE_API_URL}${p.image}`}
							alt={p.name}
						/>
						<span
							className="absolute bottom-3 right-3 bg-pink-100 text-pink-800 
          text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full"
						>
							{p?.brand}
						</span>
					</div>
				</Link>
				<HeartIcon product={p} />
			</section>

			<div className="p-5">
				<div className="flex flex-col mb-3">
					<h5 className="text-xl text-white dark:text-white truncate mb-2">
						{p.name}
					</h5>
					<p className="font-semibold text-pink-500">
						{p?.price?.toLocaleString('en-AU', {
							style: 'currency',
							currency: 'AUD',
						})}
					</p>
				</div>
				<p className="mb-3 font-normal text-[#CFCFCF]">
					{p?.description?.substring(0, 60)} ...
				</p>
				<section className="flex justify-between items-center">
					<Link
						to={`/product/${p._id}`}
						className="inline-flex items-center px-3 py-2 text-sm 
            font-medium text-center text-white bg-pink-700 
            rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300
             dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
					>
						Read More
						<svg
							className="w-3.5 h-3.5 ml-2"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 10"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M1 5h12m0 0L9 1m4 4L9 9"
							/>
						</svg>
					</Link>
					<button
						className="p-2 rounded-full"
						onClick={() => addToCartHandler(p, 1)}
					>
						<AiOutlineShoppingCart size={25} />
					</button>
				</section>
			</div>
		</div>
	);
};

export default ProductCard;
