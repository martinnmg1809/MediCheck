import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/database';
import authRoutes from './routes/auth';
import tomasRoutes from './routes/tomas';
import medicamentosRoutes from './routes/medicamentos';
import sintomasRoutes from './routes/sintomas';   // ← NUEVO

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4000',
    'http://localhost:4200',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

connectDB();

app.use('/api/auth',         authRoutes);
app.use('/api/tomas',        tomasRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/sintomas',     sintomasRoutes);      // ← NUEVO

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del Backend escuchando en el puerto ${PORT}`);
});