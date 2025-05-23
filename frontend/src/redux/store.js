import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './api/apiSlice';
import authReducer from './features/auth/authSlice.js';
import favouritesReducer from '../redux/features/favourites/favouriteSlice.js';
import cartSliceReducer from './features/cart/cartSlice.js';
import shopReducer from './features/shop/shopSlice.js';
import { getFavouritesFromLocalStorage } from '../Utils/localStorage.js';

const initialFavourites = getFavouritesFromLocalStorage() || [];

const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,
		auth: authReducer,
		favourites: favouritesReducer,
		cart: cartSliceReducer,
		shop: shopReducer,
	},

	preloadedState: {
		favourites: initialFavourites,
	},

	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true,
});

setupListeners(store.dispatch);
export default store;
