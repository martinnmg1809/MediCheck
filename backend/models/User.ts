import { Schema, model } from 'mongoose';
import { User } from './interfaces'; 

const userSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['paciente', 'medico'], default: 'paciente' }
});

export const UserModel = model<User>('User', userSchema);