import express from 'express';
import AdminController from '../controllers/admincontroller';

const adminRouter = express.Router();

// Admin login route
adminRouter.get('/', AdminController.loadLogin);
adminRouter.post('/', AdminController.verifyLogin);

// Admin logout route
adminRouter.get('/logout', AdminController.logout);

// Admin dashboard route (protected route)
adminRouter.get('/admindashboard', AdminController.loadDashboard);
adminRouter.post('/:userId/toggle-verification', AdminController.toggleVerification); 
adminRouter.delete('/:userId', AdminController.deleteUser);

export default adminRouter;
