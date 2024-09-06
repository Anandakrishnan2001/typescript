import express from 'express';
import userController from '../controllers/usercontroller'; 
const router = express.Router();

// Define routes for user operations
router.get('/', userController.getLoginPage);
router.post('/', userController.verifyLogin);
router.get('/home', userController.getHomePage);
router.get('/registration', userController.getRegistrationPage);
router.post('/registration', userController.insertUser);
 router.get('/logout', userController.logout);

export default router;