import { Link } from 'react-router-dom';
import HeartIcon from './HeartIcon';

const SmallProduct = ({ product }) => {
	const truncateText = (text, length) => {
		return text.length > length ? text.substring(0, length) + '...' : text;
	};

	return (
		<div className="w-[20rem] ml-[2rem] p-3">
			<div className="relative h-[180px]">
				<Link to={`/product/${product._id}`}>
					<img
						src={product.image}
						alt={product.name}
						className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
					/>
				</Link>
				<HeartIcon product={product} />
			</div>

			<div className="p-4">
				<Link to={`/product/${product._id}`}>
					<h2 className="flex justify-between items-center">
						<div>{truncateText(product.name, 20)}</div>
						<span className="bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
							${product.price}
						</span>
					</h2>
				</Link>
			</div>
		</div>
	);
};

export default SmallProduct;
