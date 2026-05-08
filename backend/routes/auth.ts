//codigo encargado de lalogica de los endpoints (manipulacion de datos, validaciones, etc)


import { Router } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// Endpoint: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Creamos una instancia del modelo con los datos recibidos
        const newUser = new UserModel({ name, email, password, role });

        // 2. Lo guardamos en MongoDB Atlas
        await newUser.save();

        res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
    } catch (error) {
        res.status(400).json({ error: "Error al registrar usuario", details: error });
    }
});

export default router;