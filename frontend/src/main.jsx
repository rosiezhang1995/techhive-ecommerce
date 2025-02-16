import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import './index.css';
import { Route, RouterProvider, createRoutesFromElements } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import store from './redux/store.js';

// Private Route
import PrivateRoute from './components/PrivateRoute.jsx';

// Auth
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

import UserList from './pages/Admin/UserList.jsx';
import Profile from './pages/User/Profile.jsx';
import AdminRoute from './pages/Admin/AdminRoute.jsx';

import CategoryList from './pages/Admin/CategoryList.jsx';

import ProductList from './pages/Admin/productList.jsx';
import AllProducts from './pages/Admin/AllProducts.jsx';
import ProductUpdate from './pages/Admin/ProductUpdate.jsx';

import Home from './pages/Home.jsx';
import Favourites from './pages/Products/Favourites.jsx';
import ProductDetails from './pages/Products/ProductDetails.jsx';

import Cart from './pages/Cart.jsx';
import Shop from './pages/Shop.jsx';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<App />}>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route index={true} path="/" element={<Home />} />
			<Route path="/favourite" element={<Favourites />} />
			<Route path="/product/:id" element={<ProductDetails />} />
			<Route path="/cart" element={<Cart />} />
			<Route path="/shop" element={<Shop />} />

			{/* Registered users */}
			<Route path="" element={<PrivateRoute />}>
				<Route path="/profile" element={<Profile />} />
			</Route>

			{/* Admin Routes */}
			<Route path="/admin" element={<AdminRoute />}>
				<Route path="userlist" element={<UserList />} />
				<Route path="categorylist" element={<CategoryList />} />
				<Route path="productlist" element={<ProductList />} />
				<Route path="productlist/:pageNumber" element={<ProductList />} />
				<Route path="allproductslist" element={<AllProducts />} />
				<Route path="product/update/:_id" element={<ProductUpdate />} />
			</Route>
		</Route>
	)
);

createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
);
