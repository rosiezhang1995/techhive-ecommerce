import { Link } from 'react-router-dom';
import { useGetTopProductsQuery } from '../../redux/api/productApiSlice';
import Message from '../../components/Message';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ProductCarousel = () => {
	const { data: products, isLoading, error } = useGetTopProductsQuery();

	const settings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 3000,
	};

	return (
		<div className="h-[30rem] flex flex-col justify-between items-start">
			<div className="mt-4">
				{isLoading ? null : error ? (
					<Message variant="danger">
						{error?.data?.message || error.error}
					</Message>
				) : (
					<Slider
						{...settings}
						className="xl:w-[50rem]  lg:w-[50rem] md:w-[56rem] sm:w-[40rem] sm:block"
					>
						{products.map(({ image, _id, name }) => (
							<div key={_id}>
								<img
									src={`${import.meta.env.VITE_API_URL}${image}`}
									alt={name}
									className="w-full rounded-lg object-cover h-[25rem]"
								/>
							</div>
						))}
					</Slider>
				)}
			</div>
			<div className="flex mt-16">
				<Link
					to="/shop"
					className="bg-pink-600 font-bold rounded-lg py-3 px-10"
				>
					Shop Now
				</Link>
			</div>
		</div>
	);
};

export default ProductCarousel;
