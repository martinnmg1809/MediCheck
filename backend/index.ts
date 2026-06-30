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

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth',         authRoutes);
app.use('/api/tomas',        tomasRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/sintomas',     sintomasRoutes);      // ← NUEVO

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Servidor del Backend escuchando en ${PORT}');
});