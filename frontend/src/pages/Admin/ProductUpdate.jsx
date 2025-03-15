import { useState, useEffect } from 'react';
import { UPLOAD_URL } from '../../redux/constants';
import AdminMenu from './AdminMenu';
import { useNavigate, useParams } from 'react-router-dom';
import {
	useUpdateProductMutation,
	useDeleteProductMutation,
	useGetProductByIdQuery,
	useUploadProductImageMutation,
} from '../../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import { toast } from 'react-toastify';

const ProductUpdate = () => {
	const params = useParams();

	const { data: productData } = useGetProductByIdQuery(params._id);

	// Initialize state with product data
	const [image, setImage] = useState(productData?.image || '');
	const [name, setName] = useState(productData?.name || '');
	const [description, setDescription] = useState(
		productData?.description || ''
	);
	const [price, setPrice] = useState(productData?.price || '');
	const [category, setCategory] = useState(productData?.category || '');
	const [quantity, setQuantity] = useState(productData?.quantity || '');
	const [brand, setBrand] = useState(productData?.brand || '');
	const [stock, setStock] = useState(productData?.countInStock);

	// Navigate hook
	const navigate = useNavigate();

	// Fetch categories using RTK Query
	const { data: categories = [] } = useFetchCategoriesQuery();

	// Mutations for product managemnet
	const [uploadProductImage] = useUploadProductImageMutation();
	const [updateProduct] = useUpdateProductMutation();
	const [deleteProduct] = useDeleteProductMutation();

	// Update form fields when product data is available
	useEffect(() => {
		if (productData && productData._id) {
			setName(productData.name);
			setDescription(productData.description);
			setPrice(productData.price);
			setCategory(productData.category);
			setQuantity(productData.quantity);
			setBrand(productData.brand);
			setImage(productData.image);
		}
	}, [productData]);

	// Handle image upload
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
		} catch (error) {
			toast.error(error.message || 'Upload failed.');
		}
	};

	// Handle product update submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const productData = {
				name,
				description,
				price: parseFloat(price),
				category,
				quantity: parseInt(quantity, 10),
				brand,
				countInStock: parseInt(stock, 10),
				image,
			};

			const response = await updateProduct({
				productId: params._id,
				productData,
			}).unwrap();

			toast.success(`Product successfully updated`);
			navigate('/admin/allproductslist');
		} catch (error) {
			toast.error(
				error?.data?.message ||
					error?.data?.error ||
					'Product update failed. Try again.'
			);
		}
	};
	const handleDelete = async () => {
		try {
			let answer = window.confirm(
				'Are you sure you want to delete this product?'
			);
			if (!answer) return;

			const response = await deleteProduct(params._id).unwrap();
			toast.success(`"${response.name}" is deleted`);
			navigate('/admin/allproductslist');
		} catch (error) {
			toast.error('Delete failed. Try again.');
		}
	};
	return (
		<div className="container xl:mx-[9rem] sm:mx-[0]">
			<div className="flex flex-col md:flex-row">
				<AdminMenu />
				<div className="md:w-3/4 p-3">
					<div className="h-12"> Update/Delete Product</div>

					{/* Image Preview */}
					{image && (
						<div className="text-center">
							<img
								src={image}
								alt="product"
								className="block mx-auto max-h-[200px]"
							/>
						</div>
					)}

					{/* Upload Input */}
					<div className="mb-3">
						<label className="border text-white px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11">
							{image ? 'Change Image' : 'Upload Image'}
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
						<div className="flex flex-wrap">
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

						<div className="flex flex-wrap">
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

						<div className="mb-3">
							<label htmlFor="description">Description</label>
							<textarea
								className="p-2 mb-3 bg-[#101011] border rounded-lg w-[95%] text-white"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							></textarea>
						</div>

						<div className="flex justify-between">
							<div>
								<label htmlFor="name block">Count In Stock</label> <br />
								<input
									type="number"
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white"
									value={stock}
									onChange={(e) => setStock(e.target.value)}
								/>
							</div>

							{/* Category */}
							<div>
								<label htmlFor="">Category</label> <br />
								<select
									value={category} // Sets the selected option based on the category ID from state
									className="p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white mr-[5rem]"
									onChange={(e) => setCategory(e.target.value)}
								>
									{categories?.map((c) => (
										<option key={c._id} value={c._id}>
											{c.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div>
							{/* Submit button */}
							<button
								onClick={handleSubmit}
								className="py-4 px-10 mt-5 rounded-lg text-lg font-bold  bg-green-600 mr-6"
							>
								Update
							</button>
							{/* Delete Button */}
							<button
								onClick={handleDelete}
								className="py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-pink-600"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductUpdate;
