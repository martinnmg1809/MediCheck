import { Router } from 'express';
import bcrypt from 'bcrypt'; // Importamos la librería de encriptación
import { sql } from '../db/database'; 

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Encriptar la contraseña (hashing)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${role || 'paciente'})
            RETURNING id, name, email, role;
        `;

        const newUser = result[0];

        res.status(201).json({ 
            message: "Usuario creado con éxito", 
            user: newUser 
        });

    } catch (error: any) {
        console.error('Error en el registro:', error);
        
        if (error.code === '23505') {
             res.status(400).json({ error: "El correo electrónico ya está registrado." });
        } else {
             res.status(500).json({ error: "Error interno del servidor", details: error.message });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;

        const user = result[0];

        if (!user) {
            return res.status(400).json({ error: "Inicio de sesión fallido" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "Inicio de sesión fallido" });
        }
        
        res.json({ 
            message: "Inicio de sesión exitoso", 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
});

//Agregar recuperar contraseña
router.post('/recover-password', async (req, res) => {
    try {
        //logica manejo de contraseña nueva
    } catch (error: any) {
        res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
});

export default router;