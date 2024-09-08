import User from '../model/userModel';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

interface CustomRequest extends Request {
    session: any;
}

class AdminController {
    public loadLogin(req: Request, res: Response): void {
        try {
            res.render('admin/adminlogin');
        } catch (error) {
            console.log((error as Error).message);
            res.status(500).send('Internal Server Error');
        }
    }

    public async verifyLogin(req: CustomRequest, res: Response): Promise<void> {
        try {
            const email: string = req.body.email;
            const password: string = req.body.password;
            console.log(email, password, 'from the verify login of the admin')

            const userData = await User.findOne({ email: email, is_admin: 1 });

            if (userData) {
                const passwordMatch: boolean = await bcrypt.compare(password, userData.password);
                
                if (passwordMatch) {
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/admindashboard');
                } else {
                    res.render('admin/adminlogin', { message: "Email or password is incorrect" });
                }
            } else {
                res.render('admin/adminlogin', { message: "Email or password is incorrect" });
            }
        } catch (error) {
            console.log((error as Error).message);
            res.render('admin/adminlogin', { message: "An error occurred. Please try again." });
        }
    }

    public async loadDashboard(req: CustomRequest, res: Response): Promise<void> {
        try {
            if (req.session.admin_id) {
                const users = await User.find({ is_admin: 0 }).exec();
                res.render('admin/admindashboard', { users: users });
            } else {
                res.redirect('/admin/adminlogin');
            }
        } catch (error) {
            console.log((error as Error).message);
            res.status(500).send('Internal Server Error');
        }
    }

    public logout(req: CustomRequest, res: Response): void {
        req.session.destroy((error: any) => {
            if (error) {
                console.error('Session destruction error:', error);
            }
            res.redirect('/admin');
        });
    }

    public async toggleVerification(req: Request, res: Response): Promise<void> {
        try {
            const userId: string = req.params.userId;
            const user = await User.findById(userId);
    
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            user.is_verified = user.is_verified === 0 ? 1 : 0;
            await user.save();
    
            res.json({ success: true, is_verified: user.is_verified === 1 });
        } catch (error) {
            console.error('Error toggling verification:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    
    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const userId: string = req.params.userId;
            const result = await User.findByIdAndDelete(userId);

            if (!result) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export default new AdminController();