import { useParams } from 'react-router-dom';
import { useGetNewProductsQuery } from '../redux/api/productApiSlice';
import Header from '../components/Header';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from './Products/Product';

const Home = () => {
	const { keyword } = useParams();
	const { data, isLoading, isError, error } = useGetNewProductsQuery();

	return (
		<>
			{!keyword ? <Header /> : null}
			{isLoading ? (
				<Loader />
			) : isError ? (
				<Message variant="danger">
					{error?.data?.message || error?.error || 'An error occurred'}
				</Message>
			) : (
				<>
					<div className="flex justify-center">
						<h1 className="mt-[5rem] text-[2.5rem]">New Arrivals</h1>
					</div>

					<div>
						<div className="flex justify-center flex-wrap mt-[2rem]">
							{data.map((product) => (
								<div key={product._id}>
									<Product product={product} />
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default Home;
