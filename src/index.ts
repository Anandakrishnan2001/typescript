import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import nocache from 'nocache';
import mongoose from 'mongoose';
import userRoute from './routes/userroute';
import multer from 'multer';

dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/user_management_type', {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Initialize Express app
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

if (!process.env.SECRETKEY) {
    throw new Error('SECRETKEY is not defined in the environment variables');
}
const sessionSecret: string = process.env.SECRETKEY;

// Set up session
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(nocache());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Use routes with multer middleware for handling file uploads
app.use('/', upload.single('image'), userRoute);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Views directory: ${app.get('views')}`);
});