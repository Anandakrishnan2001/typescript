import User from '../model/userModel';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

interface CustomRequest extends Request {
    session: any; 
}

class UserController {

    public getLoginPage(req: Request, res: Response): void {
        res.render('user/login', { message: req.query.message });
    }

    public getRegistrationPage(req: Request, res: Response): void {
        res.render('user/registration', { message: req.query.message });
    }


    public async getHomePage(req: CustomRequest, res: Response): Promise<void> {
        try {

            if (req.session && req.session.user_id) {

                const user = await User.findById(req.session.user_id);

                if (user) {

                    res.render('user/home', { user, message: req.query.message });
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
        } catch (error) {
            console.error('Error in getHomePage:', (error as Error).message);
            res.redirect('/login');
        }
    }


    public async insertUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            console.log('userInsert', req.body)
            if (!req.body.name || !req.body.email || !req.body.mno || !req.body.password) {
                res.render('user/registration', { message: "All fields are required." });
                return;
            }

            const spassword = await bcrypt.hash(req.body.password, 10);
            const file = req.file;

            if (!file) {
                res.render('user/registration', { message: "Image upload failed." });
                return;
            }

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mno,
                image: file.filename,
                password: spassword,
                is_admin: 0,
                is_verified: 1
            });

            const userData = await user.save();

            if (userData) {
                res.render('user/login', { message: "Your registration has been successful." });
            } else {
                res.render('user/registration', { message: "Your registration has failed." });
            }
        } catch (error) {
            console.error('Error in insertUser:', (error as Error).message);
            res.render('user/registration', { message: "An error occurred during registration." });
        }
    }

    public async verifyLogin(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            console.log(req.body, 'verify login')
            const userData = await User.findOne({ email });

            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password);

                if (passwordMatch) {
                    if (userData.is_verified === 0) {
                        res.render('user/login', { message: "Please verify your email." });
                    } else {
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    }
                } else {
                    res.render('user/login', { message: "Email and password are incorrect." });
                }
            } else {
                res.render('user/login', { message: "Email and password are incorrect." });
            }
        } catch (error) {
            console.error('Error in verifyLogin:', (error as Error).message);
            res.render('user/login', { message: "An error occurred during login." });
        }
    }


    public async editLoad(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.query.id as string;

            const userData = await User.findById(id);

            if (userData) {
                res.render('user/edit', { user: userData });
            } else {
                res.redirect('user/home');
            }
        } catch (error) {
            console.error('Error in editLoad:', (error as Error).message);
            res.redirect('user/home');
        }
    }

    public async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.body.user_id;
            const updateData: { name: string; email: string; mobile: string; image?: string } = {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mno
            };

            if (req.file) {
                updateData.image = req.file.filename;
            }

            await User.findByIdAndUpdate(userId, { $set: updateData });

            res.redirect('/');
        } catch (error) {
            console.error('Error in updateProfile:', (error as Error).message);
            res.redirect('/');
        }
    }

    public logout(req: CustomRequest, res: Response): void {
        req.session.destroy((error: any) => {
            if (error) {
                console.error('Session destruction error:', error);
            }
            res.redirect('/');
        });
    }
}

export default new UserController();
