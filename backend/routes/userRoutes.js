import express from "express";
import {createUser, loginUser, logoutCurrentUser} from '../controllers/userController.js';
import {authenticate, authorizeAdmin} from '../middlewares/authMiddleware.js';


const router = express.Router()
router.route('/').post(createUser).get(authenticate, authorizeAdmin);
router.post('/auth',loginUser);
router.post('/logout', logoutCurrentUser)

export default router;
