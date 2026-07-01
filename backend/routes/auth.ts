import { Router } from 'express';
import bcrypt from 'bcrypt'; // Importamos la librería de encriptación
import { sql } from '../db/database'; 
// Use require to avoid missing types error for 'nodemailer' when @types/nodemailer is not installed
const nodemailer = require('nodemailer');
import crypto from 'crypto'; 
import fs from 'fs';
import path from 'path';


const router = Router();


let palabrasBaneadas: string[] = [];

try{
    const ruta = path.join(__dirname, 'palabrasBAN.txt')
    const contenido = fs.readFileSync(ruta, "utf-8") 

    palabrasBaneadas = contenido
    .split(/\r?\n/)
    .map(palabra => palabra.trim().toLowerCase())
    .filter(palabra=>palabra.length>0)

}
catch (error){
    console.error("Aviso: No se pudo cargar el archivo de palabras baneadas.", error);
}

function baneoPalabras (texto: string): Boolean{
    if(!texto){
        return false;
    }
    const textoMinusculas = texto.toLowerCase()
    return palabrasBaneadas.some(palabra=>textoMinusculas.includes(palabra));
}

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedName = String(name ?? '').trim();
        const normalizedEmail = String(email ?? '').trim().toLowerCase();
        const normalizedPassword = String(password ?? '').trim();

        if (!normalizedName || !normalizedEmail || !normalizedPassword) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
        }

        if (normalizedName.length < 3) {
            return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ error: 'El correo electrónico no es válido.' });
        }

        if (normalizedPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        if (baneoPalabras(normalizedName)) {
            return res.status(400).json({ 
                error: "El nombre de usuario contiene términos no permitidos o reservados por el sistema." 
            });
        }

        // Encriptar la contraseña (hashing)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(normalizedPassword, saltRounds);

        const result = await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${normalizedName}, ${normalizedEmail}, ${hashedPassword}, ${role || 'paciente'})
            RETURNING id, name, email, role;
        `;

        const newUser = result[0];

        const token = crypto.randomBytes(32).toString('hex');

        res.status(201).json({ 
            message: "Usuario creado con éxito",
            token,
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
        const normalizedEmail = String(email ?? '').trim().toLowerCase();
        const normalizedPassword = String(password ?? '').trim();

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ error: 'El correo electrónico no es válido.' });
        }

        const result = await sql`
            SELECT * FROM users WHERE email = ${normalizedEmail}
        `;

        const user = result[0];

        if (!user) {
            return res.status(400).json({ error: "Inicio de sesión fallido" });
        }

        const passwordMatch = await bcrypt.compare(normalizedPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "Inicio de sesión fallido" });
        }
        
        const token = crypto.randomBytes(32).toString('hex');

        res.json({ 
            message: "Inicio de sesión exitoso",
            token,
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

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "El correo es obligatorio." });
        }

        // 1. Verificar si el correo está registrado
        const userResult = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (userResult.length === 0) {
            return res.status(404).json({ error: "El correo no está registrado en el sistema." });
        }

        // 2. Generar token de recuperación (1 hora de vigencia)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 3600000;

        await sql`
            UPDATE users
            SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpires}
            WHERE email = ${email}
        `;

        // 3. Enviar el correo con timeout para evitar que la petición quede colgada
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
        });

        const resetLink = `medicheck://form-new-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Medicheck Soporte" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Recuperación de Contraseña - Medicheck",
            text: `Haz clic en el siguiente enlace para cambiar tu contraseña: ${resetLink}`
        });

        res.status(200).json({ message: "Correo de recuperación enviado." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo enviar el correo. Intenta nuevamente más tarde." });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token y nueva contraseña son requeridos." });
        }
        
        const userResult = await sql`
            SELECT id, reset_token_expires FROM users
            WHERE reset_token = ${token}
        `;

        if (userResult.length === 0) {
            return res.status(400).json({ error: "El enlace de recuperación no es válido." });
        }

        const user = userResult[0];

        if (Date.now() > Number(user.reset_token_expires)) {
            return res.status(400).json({ error: "El enlace de recuperación ha expirado. Solicita uno nuevo." });
        }

        const hashed_pass = await bcrypt.hash(newPassword, 10);

        await sql`
            UPDATE users
            SET password = ${hashed_pass}, reset_token = NULL, reset_token_expires = NULL
            WHERE id = ${user.id}
        `;

        res.json({ message: "Contraseña actualizada con éxito." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
});

router.get('/treatments/:userId', async (req, res) => {
    try{
        const { userId } = req.params;

        const tratamientos = await sql`
            SELECT * FROM tratamientos
            WHERE user_id = ${userId}
              AND (
                activo = true
                OR id = (
                  SELECT id FROM tratamientos
                  WHERE user_id = ${userId} AND activo = false
                  ORDER BY id DESC LIMIT 1
                )
              )
            ORDER BY activo DESC, id DESC
        `;

        res.status(200).json({ treatments: tratamientos });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }

});

export default router;

/*
back-logica para verificar si el tiempo faltante para el siguiente es menor a cierta cantidad
front- ciclo repitiendo la peticion http.get de noti*/