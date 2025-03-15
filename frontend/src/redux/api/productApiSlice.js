import { PRODUCT_URL, UPLOAD_URL } from '../constants';
import { apiSlice } from './apiSlice';

// Inject product management endpoints
export const productApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// Fetch a list of products with optioanl keyword search
		getProducts: builder.query({
			query: ({ keyword }) => ({
				url: `${PRODUCT_URL}`,
				params: { keyword }, // optional query parameter for search
			}),
			keepUnusedDataFor: 5,
			providesTags: ['Products'],
		}),

		// Fetch product by its Id
		getProductById: builder.query({
			query: (productId) => `${PRODUCT_URL}/${productId}`,
			providesTags: (result, error, productId) => [
				{
					type: 'Product',
					id: productId,
				},
			],
		}),

		// Fetch product by category
		getProductsByCategory: builder.query({
			query: ({ category, excludeId }) => ({
				url: `${PRODUCT_URL}/category/${category}`,
				params: { excludeId }, // exclude current product
			}),
			keepUnusedDataFor: 5,
			providesTags: ['Products'],
		}),

		//Fetch all products
		allProducts: builder.query({
			query: () => `${PRODUCT_URL}/allproducts`,
			providesTags: ['Products'],
		}),

		// Fetch detailed information of a specific product
		getProductDetails: builder.query({
			query: (productId) => ({
				url: `${PRODUCT_URL}/${productId}`,
			}),
			keepUnusedDataFor: 5,
			providesTags: (result, error, productId) => [
				{ type: 'Product', id: productId },
			],
		}),

		// Create a new product
		createProduct: builder.mutation({
			query: (productData) => ({
				url: `${PRODUCT_URL}`,
				method: 'POST',
				body: productData,
			}),
			invalidatesTags: ['Products'], // Invalidate products list after creation
		}),

		// Update an existing product
		updateProduct: builder.mutation({
			query: ({ productId, productData }) => ({
				url: `${PRODUCT_URL}/${productId}`,
				method: 'PUT',
				body: productData,
			}),
			invalidatesTags: (result, error, { productId }) => [
				{ type: 'Product', id: productId },
				'Products',
			],
		}),

		// Upload an image for a product
		uploadProductImage: builder.mutation({
			query: (data) => ({
				url: `${UPLOAD_URL}`,
				method: 'POST',
				body: data,
			}),
		}),

		// Delete a product
		deleteProduct: builder.mutation({
			query: (productId) => ({
				url: `${PRODUCT_URL}/${productId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Products'], // Invalidate products list after deletion
		}),

		// Create a review for a specific product
		createReview: builder.mutation({
			query: (data) => ({
				url: `${PRODUCT_URL}/${data.productId}/reviews`,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: (result, error, { productId }) => [
				{ type: 'Product', id: productId },
			],
		}),

		// Fetch top-rated products
		getTopProducts: builder.query({
			query: () => `${PRODUCT_URL}/top`,
			keepUnusedDataFor: 5,
			providesTags: ['TopProducts'],
		}),

		// Fetch newly added products
		getNewProducts: builder.query({
			query: () => `${PRODUCT_URL}/new`,
			keepUnusedDataFor: 5,
			providesTags: ['NewProducts'],
		}),

		// Fetch filtered products based on selected categories and price range.
		getFilteredProducts: builder.query({
			query: ({ checked, radio }) => ({
				url: `${PRODUCT_URL}/filtered-products`,
				method: 'POST',
				body: { checked, radio },
			}),
		}),
	}),
});

export const {
	useGetProductsQuery,
	useGetProductByIdQuery,
	useGetProductsByCategoryQuery,
	useAllProductsQuery,
	useGetProductDetailsQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useUploadProductImageMutation,
	useDeleteProductMutation,
	useCreateReviewMutation,
	useGetTopProductsQuery,
	useGetNewProductsQuery,
	useGetFilteredProductsQuery,
} = productApiSlice;
