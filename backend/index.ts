import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/database';
import authRoutes from './routes/auth';

import tomasRoutes from './routes/tomas'; 

import medicamentosRoutes from './routes/medicamentos';

const app = express();

// Middlewares fundamentales
app.use(cors()); // Permite que Angular se conecte sin bloqueos de seguridad
app.use(express.json()); // Permite que Express entienda los JSON que envía Angular

// Iniciamos la conexión a la bdd
connectDB();

// Le decimos a Express que use tus rutas de registro
app.use('/api/auth', authRoutes);

app.use('/api/tomas', tomasRoutes);

app.use('/api/medicamentos', medicamentosRoutes);

// Encendemos el servidor
app.listen(3000, () => {
    console.log("Servidor del Backend escuchando en http://localhost:3000");
});