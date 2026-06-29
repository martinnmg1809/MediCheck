import { Router, Request, Response } from 'express';
import { sql } from '../db/database';

const router = Router();

// ─────────────────────────────────────────────────────────────
// IMPORTANTE: el orden de las rutas en Express importa.
// Las rutas con prefijos fijos (/catalogo, /usuario, /registro)
// deben ir ANTES que las rutas con parámetros dinámicos (/:id)
// para que Express no las confunda.
// ─────────────────────────────────────────────────────────────

// GET /api/sintomas/catalogo
router.get('/catalogo', async (_req: Request, res: Response): Promise<void> => {
    try {
        const result = await sql`
            SELECT id, nombre, categoria, icono
            FROM catalogo_sintomas
            ORDER BY categoria ASC, nombre ASC;
        `;
        res.status(200).json(result);
    } catch (error) {
        console.error('Error en GET /catalogo:', error);
        res.status(500).json({ error: 'Error al obtener el catálogo.' });
    }
});

// GET /api/sintomas/usuario/:user_id — historial del usuario
router.get('/usuario/:user_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params;
        const orden = req.query['orden'] === 'asc' ? 'ASC' : 'DESC';

        const result = orden === 'ASC'
            ? await sql`
                SELECT
                    rs.id,
                    cs.nombre    AS sintoma_nombre,
                    cs.categoria AS sintoma_categoria,
                    cs.icono     AS sintoma_icono,
                    rs.intensidad,
                    TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS fecha,
                    TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'HH24:MI')    AS hora
                FROM registro_sintomas rs
                JOIN catalogo_sintomas cs ON rs.sintoma_id = cs.id
                WHERE rs.user_id = ${user_id}
                ORDER BY rs.fecha_registro ASC;
              `
            : await sql`
                SELECT
                    rs.id,
                    cs.nombre    AS sintoma_nombre,
                    cs.categoria AS sintoma_categoria,
                    cs.icono     AS sintoma_icono,
                    rs.intensidad,
                    TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS fecha,
                    TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'HH24:MI')    AS hora
                FROM registro_sintomas rs
                JOIN catalogo_sintomas cs ON rs.sintoma_id = cs.id
                WHERE rs.user_id = ${user_id}
                ORDER BY rs.fecha_registro DESC;
              `;

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en GET /usuario:', error);
        res.status(500).json({ error: 'Error al obtener el historial.' });
    }
});

// GET /api/sintomas/registro/:id — un registro individual
router.get('/registro/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await sql`
            SELECT
                rs.id,
                cs.nombre    AS sintoma_nombre,
                cs.categoria AS sintoma_categoria,
                cs.icono     AS sintoma_icono,
                rs.intensidad,
                TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS fecha,
                TO_CHAR(rs.fecha_registro AT TIME ZONE 'America/Santiago', 'HH24:MI')    AS hora
            FROM registro_sintomas rs
            JOIN catalogo_sintomas cs ON rs.sintoma_id = cs.id
            WHERE rs.id = ${id};
        `;

        if (result.length === 0) {
            res.status(404).json({ error: 'Registro no encontrado.' });
            return;
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error en GET /registro/:id:', error);
        res.status(500).json({ error: 'Error al obtener el registro.' });
    }
});

// POST /api/sintomas — registrar síntoma nuevo
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, sintoma_id, intensidad } = req.body;

        if (!user_id || !sintoma_id || intensidad === undefined) {
            res.status(400).json({ error: 'Faltan campos requeridos.' });
            return;
        }
        if (intensidad < 1 || intensidad > 10) {
            res.status(400).json({ error: 'La intensidad debe estar entre 1 y 10.' });
            return;
        }

        const result = await sql`
            INSERT INTO registro_sintomas (user_id, sintoma_id, intensidad, fecha_registro)
            VALUES (
                ${user_id},
                ${sintoma_id},
                ${intensidad},
                NOW() AT TIME ZONE 'America/Santiago'
            )
            RETURNING id, fecha_registro;
        `;

        res.status(201).json({
            message: 'Síntoma registrado correctamente.',
            id: result[0].id,
            fecha_registro: result[0].fecha_registro
        });
    } catch (error) {
        console.error('Error en POST /sintomas:', error);
        res.status(500).json({ error: 'Error interno al registrar el síntoma.' });
    }
});

// PUT /api/sintomas/registro/:id — editar intensidad
router.put('/registro/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id }         = req.params;
        const { intensidad } = req.body;

        if (intensidad === undefined || intensidad < 1 || intensidad > 10) {
            res.status(400).json({ error: 'La intensidad debe estar entre 1 y 10.' });
            return;
        }

        const result = await sql`
            UPDATE registro_sintomas
            SET intensidad = ${intensidad}
            WHERE id = ${id}
            RETURNING id;
        `;

        if (result.length === 0) {
            res.status(404).json({ error: 'Registro no encontrado.' });
            return;
        }

        res.status(200).json({ message: 'Intensidad actualizada correctamente.' });
    } catch (error) {
        console.error('Error en PUT /registro/:id:', error);
        res.status(500).json({ error: 'Error al actualizar el síntoma.' });
    }
});

// DELETE /api/sintomas/registro/:id — eliminar registro
router.delete('/registro/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await sql`
            DELETE FROM registro_sintomas
            WHERE id = ${id}
            RETURNING id;
        `;

        if (result.length === 0) {
            res.status(404).json({ error: 'Registro no encontrado.' });
            return;
        }

        res.status(200).json({ message: 'Síntoma eliminado correctamente.' });
    } catch (error) {
        console.error('Error en DELETE /registro/:id:', error);
        res.status(500).json({ error: 'Error al eliminar el síntoma.' });
    }
});

export default router;