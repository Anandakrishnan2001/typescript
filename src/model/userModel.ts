import mongoose, { Document, Schema } from 'mongoose';


interface IUser extends Document {
    name: string;
    email: string;
    mobile: string;
    image: string;
    password: string;
    is_admin: number;
    is_verified: number;
}

// Create the schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Number,
        required: true,
    },
    is_verified: {
        type: Number,
        default: 0,
    },
});


const User = mongoose.model<IUser>('User', userSchema);
export default User;
