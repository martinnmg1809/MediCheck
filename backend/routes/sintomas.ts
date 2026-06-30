import { Router, Request, Response } from 'express';
import { sql } from '../db/database';

const router = Router();

// ─────────────────────────────────────────────────────────────
// CATÁLOGO DE SÍNTOMAS DISPONIBLES
// GET /api/sintomas/catalogo
// ─────────────────────────────────────────────────────────────
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
        res.status(500).json({ error: 'Error al obtener el catálogo de síntomas.' });
    }
});

// ─────────────────────────────────────────────────────────────
// REGISTRAR UN SÍNTOMA
// POST /api/sintomas
// Body: { user_id, sintoma_id, intensidad }
// ─────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, sintoma_id, intensidad } = req.body;

        if (!user_id || !sintoma_id || intensidad === undefined) {
            res.status(400).json({ error: 'Faltan campos requeridos: user_id, sintoma_id, intensidad.' });
            return;
        }

        if (intensidad < 1 || intensidad > 10) {
            res.status(400).json({ error: 'La intensidad debe estar entre 1 y 10.' });
            return;
        }

        // La fecha/hora se registra automáticamente con now() en la zona horaria de Chile
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

// ─────────────────────────────────────────────────────────────
// OBTENER HISTORIAL DE SÍNTOMAS DE UN USUARIO
// GET /api/sintomas/usuario/:user_id
// Query params: orden = 'asc' | 'desc'  (default: desc)
// ─────────────────────────────────────────────────────────────
router.get('/usuario/:user_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params;
        // El frontend puede pasar ?orden=asc o ?orden=desc
        const orden = req.query['orden'] === 'asc' ? 'ASC' : 'DESC';

        // Usamos dos queries separadas por limitación del template-literal de neon
        // para inyectar la dirección dinámica de ORDER BY de forma segura.
        const result = orden === 'ASC'
            ? await sql`
                SELECT
                    rs.id,
                    cs.nombre        AS sintoma_nombre,
                    cs.categoria     AS sintoma_categoria,
                    cs.icono         AS sintoma_icono,
                    rs.intensidad,
                    TO_CHAR(
                        rs.fecha_registro AT TIME ZONE 'America/Santiago',
                        'YYYY-MM-DD'
                    ) AS fecha,
                    TO_CHAR(
                        rs.fecha_registro AT TIME ZONE 'America/Santiago',
                        'HH24:MI'
                    ) AS hora
                FROM registro_sintomas rs
                JOIN catalogo_sintomas cs ON rs.sintoma_id = cs.id
                WHERE rs.user_id = ${user_id}
                ORDER BY rs.fecha_registro ASC;
              `
            : await sql`
                SELECT
                    rs.id,
                    cs.nombre        AS sintoma_nombre,
                    cs.categoria     AS sintoma_categoria,
                    cs.icono         AS sintoma_icono,
                    rs.intensidad,
                    TO_CHAR(
                        rs.fecha_registro AT TIME ZONE 'America/Santiago',
                        'YYYY-MM-DD'
                    ) AS fecha,
                    TO_CHAR(
                        rs.fecha_registro AT TIME ZONE 'America/Santiago',
                        'HH24:MI'
                    ) AS hora
                FROM registro_sintomas rs
                JOIN catalogo_sintomas cs ON rs.sintoma_id = cs.id
                WHERE rs.user_id = ${user_id}
                ORDER BY rs.fecha_registro DESC;
              `;

        res.status(200).json(result);

    } catch (error) {
        console.error('Error en GET /sintomas/usuario/:user_id:', error);
        res.status(500).json({ error: 'Error al obtener el historial de síntomas.' });
    }
});

// ─────────────────────────────────────────────────────────────
// ELIMINAR UN SÍNTOMA REGISTRADO
// DELETE /api/sintomas/:id
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
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
        console.error('Error en DELETE /sintomas/:id:', error);
        res.status(500).json({ error: 'Error interno al eliminar el síntoma.' });
    }
});

// ─────────────────────────────────────────────────────────────
// ACTUALIZAR INTENSIDAD DE UN SÍNTOMA REGISTRADO
// PUT /api/sintomas/:id
// Body: { intensidad }
// ─────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { intensidad } = req.body;

        if (intensidad === undefined || intensidad < 1 || intensidad > 10) {
            res.status(400).json({ error: 'La intensidad debe estar entre 1 y 10.' });
            return;
        }

        const result = await sql`
            UPDATE registro_sintomas
            SET intensidad = ${intensidad}
            WHERE id = ${id}
            RETURNING id, intensidad;
        `;

        if (result.length === 0) {
            res.status(404).json({ error: 'Registro no encontrado.' });
            return;
        }

        res.status(200).json({ message: 'Síntoma actualizado correctamente.', ...result[0] });

    } catch (error) {
        console.error('Error en PUT /sintomas/:id:', error);
        res.status(500).json({ error: 'Error interno al actualizar el síntoma.' });
    }
});

export default router;