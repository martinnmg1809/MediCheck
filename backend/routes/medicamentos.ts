import { Router, Request, Response } from 'express';
import { sql } from '../db/database'; 

const router = Router();

// Obtener todo el catálogo de medicamentos
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await sql`
            SELECT * FROM medicamentos 
            ORDER BY nombre_comercial ASC;
        `;
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el catálogo de medicamentos" });
    }
});

export default router;