import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useCreateProductMutation,
	useUploadProductImageMutation,
} from '../../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import { UPLOAD_URL } from '../../redux/constants';
import { toast } from 'react-toastify';
import AdminMenu from './AdminMenu';

const ProductList = () => {
	const [image, setImage] = useState('');
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [category, setCategory] = useState('');
	const [quantity, setQuantity] = useState('');
	const [brand, setBrand] = useState('');
	const [stock, setStock] = useState(0);
	const [imageUrl, setImageUrl] = useState(null);
	const navigate = useNavigate();

	const [uploadProductImage] = useUploadProductImageMutation();
	const [createProduct] = useCreateProductMutation();
	const { data: categories } = useFetchCategoriesQuery();

	const uploadFileHandler = async (e) => {
		const file = e.target.files[0];

		if (!file) {
			toast.error('Please select a file.');
			return;
		}

		const formData = new FormData();
		formData.append('image', file);

		try {
			const res = await fetch(UPLOAD_URL, {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Upload failed.');
			}

			toast.success(data.message);
			setImage(data.imageUrl);
			setImageUrl(data.imageUrl);
		} catch (error) {
			toast.error(error.message || 'Upload failed.');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validation checks
		if (!category) {
			toast.error('Please select a category');
			return;
		}

		if (!imageUrl) {
			toast.error('Please upload an image first');
			return;
		}

		try {
			const productData = {
				name,
				description,
				price: parseFloat(price),
				category,
				quantity: parseInt(quantity, 10),
				brand,
				countInStock: parseInt(stock, 10),
				image: imageUrl,
			};

			const response = await createProduct(productData).unwrap();
			toast.success(`${response.name} is created`);
			navigate('/admin/productlist');
		} catch (error) {
			toast.error(
				error?.data?.message || 'Product creation failed. Please try again.'
			);
		}
	};
	return (
		<div className="container xl:mx-[9rem] sm:mx-[0]">
			<div className="flex flex-col md:flex-row">
				<AdminMenu />
				<div className="p-3">
					<div className="h-12">Create Product</div>

					{/* Image Preview */}
					{imageUrl && (
						<div className="text-center mb-8">
							<img
								src={imageUrl}
								alt="product"
								className="block mx-auto max-h-[200px]"
							/>
						</div>
					)}

					{/* Upload Input */}
					<div className="mb-8">
						<label className="border text-white px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11">
							{image ? image.name : 'Upload Image'}
							<input
								type="file"
								name="image"
								accept="image/*"
								onChange={uploadFileHandler}
								className={!image ? 'hidden' : 'text-white'}
							/>
						</label>
					</div>

					<div className="p-3">
						{/* Form container */}
						<div className="flex justify-between mb-8">
							<div className="one">
								<label htmlFor="name">Name</label> <br />
								<input
									type="text"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div className="two ml-10">
								<label htmlFor="name block">Price</label> <br />
								<input
									type="number"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex justify-between mb-8">
							<div className="one">
								<label htmlFor="name block">Quantity</label> <br />
								<input
									type="number"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={quantity}
									onChange={(e) => setQuantity(e.target.value)}
								/>
							</div>
							<div className="two ml-10">
								<label htmlFor="name block">Brand</label> <br />
								<input
									type="text"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={brand}
									onChange={(e) => setBrand(e.target.value)}
								/>
							</div>
						</div>

						<div className="mb-8">
							<label htmlFor="description">Description</label>
							<textarea
								className="p-2 mb-3 bg-[#101011] border rounded-lg w-[100%] text-white"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							></textarea>
						</div>

						<div className="flex justify-between mb-8">
							<div>
								<label htmlFor="name block">Count In Stock</label> <br />
								<input
									type="number"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={stock}
									onChange={(e) => setStock(e.target.value)}
								/>
							</div>

							<div className="ml-10">
								<label htmlFor="">Category</label> <br />
								<select
									placeholder="Choose Category"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									onChange={(e) => setCategory(e.target.value)}
									value={category}
								>
									<option value="">Choose Category</option>
									{categories?.map((c) => (
										<option key={c._id} value={c._id}>
											{c.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Submit button */}
						<div className="flex justify-end mt-5">
							<button
								type="submit"
								onClick={handleSubmit}
								className="py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-pink-600 hover:bg-pink-700 transition-colors w-full md:w-auto"
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductList;
