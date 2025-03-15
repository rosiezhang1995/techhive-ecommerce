import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAllProductsQuery } from '../../redux/api/productApiSlice';
import AdminMenu from './AdminMenu';

const AllProducts = () => {
	const { data: products, isLoading, isError } = useAllProductsQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error loading products</div>;
	}

	return (
		<>
			{/* Main container */}
			<div className="container mx-[9rem]">
				<div className="flex flex-col md:flex-row">
					<div className="p-3">
						{/* Header displaying total number of products */}
						<div className="ml-[2rem] text-xl font-bold h-12">
							All Products ({products?.length || 0})
						</div>
						{/* Product Grid - Wraps and centers products */}
						<div className="flex flex-wrap justify-around items-center">
							{products?.map((product) => (
								<Link
									key={product._id}
									to={`/admin/product/update/${product._id}`}
									className="block mb-4 overflow-hidden"
								>
									{/* Product Card - Image & Details */}
									<div className="flex">
										{/* Image */}
										<img
											src={product.image}
											alt={product.name}
											className="w-[10rem] object-cover"
										/>
										{/* Details */}
										<div className="p-4 flex flex-col justify-around w-[30rem]">
											<div className="flex justify-between">
												{/* Name */}
												<h5 className="text-xl font-semibold mb-2 truncate max-w-[70%]">
													{product?.name}
												</h5>
												{/* Created Date */}
												<p className="text-gray-400 text-xs ml-2 whitespace-nowrap">
													{moment(product.createdAt).format('DD/MM/YYYY')}
												</p>
											</div>
											{/* Description */}
											<p className="text-gray-400 text-sm mb-4 line-clamp-2">
												{product?.description?.substring(0, 160)}...
											</p>

											{/* Button & Price */}
											<div className="flex justify-between">
												{/* Update Product Button */}
												<Link
													to={`/admin/product/update/${product._id}`}
													className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
												>
													Update
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
												{/* Display price with two decimal places */}
												<p className="text-pink-500 font-bold">
													${product?.price?.toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
					<div className="md:w-1/4 p-3 mt-2">
						<AdminMenu />
					</div>
				</div>
			</div>
		</>
	);
};

export default AllProducts;
