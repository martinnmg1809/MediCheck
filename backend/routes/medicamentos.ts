import { Router, Request, Response } from 'express';
import { sql } from '../db/database';
import { buscarRiesgoPorPrincipioActivo } from '../config/medicamentosRiesgo';

const router = Router();

// Obtener todo el catálogo de medicamentos
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await sql`
            SELECT * FROM medicamentos
            ORDER BY nombre_comercial ASC;
        `;

        const conRiesgo = result.map((med: any) => {
            const riesgo = buscarRiesgoPorPrincipioActivo(med.principio_activo);
            return {
                ...med,
                es_riesgo: riesgo !== null,
                frecuencia_horas_fija: riesgo?.frecuenciaHorasFija ?? null,
                motivo_riesgo: riesgo?.motivo ?? null,
            };
        });

        res.status(200).json(conRiesgo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el catálogo de medicamentos" });
    }
});

export default router;