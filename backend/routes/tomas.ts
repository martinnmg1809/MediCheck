import { Router, Request, Response } from 'express';
import { sql } from '../db/database'; 

const router = Router();

router.post('/crear', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, horario, medicamento_id = 1 } = req.body; 
        
        const result = await sql`
            INSERT INTO tomas_medicamentos (user_id, medicamento_id, horario) 
            VALUES (${user_id}, ${medicamento_id}, ${horario}) 
            RETURNING *;
        `;
        
        res.status(201).json({ message: "Horario programado con éxito", toma: result[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar el horario" });
    }
});

router.patch('/:id/verificar', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const result = await sql`
            UPDATE tomas_medicamentos 
            SET 
                verificado = true, 
                fecha_real_toma = timezone('America/Santiago', now())
            WHERE id = ${id}
            RETURNING *;
        `;

        if (result.length === 0) {
            res.status(404).json({ error: "Registro no encontrado" });
            return;
        }

        res.status(200).json({ message: "¡Medicamento tomado!", toma: result[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar la toma" });
    }
});

router.get('/usuario/:user_id/hoy', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params;
        
        const result = await sql`
            SELECT 
                tm.id AS toma_id,
                m.nombre_comercial,
                m.principio_activo,
                m.concentracion,
                tm.horario AS horario_programado,
                tm.verificado,
                tm.fecha_real_toma
            FROM tomas_medicamentos tm
            JOIN medicamentos m ON tm.medicamento_id = m.id
            WHERE tm.user_id = ${user_id}
            ORDER BY tm.horario ASC;
        `;
        
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar la lista diaria" });
    }
});

export default router;