import { Router, Request, Response } from 'express';
import { sql } from '../db/database'; 

const router = Router();

// 1. REGISTRAR UN NUEVO TRATAMIENTO (POST /api/tomas)
// Calcula y genera ráfagas de tomas automáticas proyectadas a futuro en la BDD
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, medicamento_id, horario_inicio, frecuencia_horas, duracion_dias } = req.body; 
        
        const tomasPorDia = 24 / frecuencia_horas;
        const tomasTotales = tomasPorDia * duracion_dias;

        const [hora, minutos] = horario_inicio.split(':');
        let fechaActual = new Date();
        fechaActual.setHours(parseInt(hora, 10), parseInt(minutos, 10), 0, 0);

        const queries = [];

        for (let i = 0; i < tomasTotales; i++) {
            const fechaToma = new Date(fechaActual);
            const fechaCompleta = fechaToma.toISOString();

            // Insertamos forzando a timestamptz para evitar errores de longitud o tipo de dato texto
            const query = sql`
                INSERT INTO tomas_medicamentos (user_id, medicamento_id, horario) 
                VALUES (${user_id}, ${medicamento_id}, ${fechaCompleta}::timestamptz)
            `;
            queries.push(query);

            fechaActual.setHours(fechaActual.getHours() + frecuencia_horas);
        }
        
        await Promise.all(queries);
        res.status(201).json({ message: "Calendario de tratamiento programado con éxito" });
    } catch (error) {
        console.error("Error crítico en POST /api/tomas:", error);
        res.status(500).json({ error: "Error interno al programar el tratamiento" });
    }
});

// 2. MARCAR MEDICAMENTO COMO CONSUMIDO (PUT /api/tomas/verificar/:id)
router.put('/verificar/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const result = await sql`
            UPDATE tomas_medicamentos 
            SET 
                verificado = true, 
                fecha_real_toma = now()
            WHERE id = ${id}
            RETURNING *;
        `;

        if (result.length === 0) {
            res.status(404).json({ error: "Registro de toma no encontrado" });
            return;
        }

        res.status(200).json({ message: "¡Toma verificada con éxito!", toma: result[0] });
    } catch (error) {
        console.error("Error crítico en PUT /verificar/:id:", error);
        res.status(500).json({ error: "Error al registrar la toma real" });
    }
});

router.get('/usuario/:user_id/historial', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params;
        
        const result = await sql`
            SELECT 
                tm.id AS toma_id,
                m.nombre_comercial,
                m.principio_activo,
                m.concentracion,
                TO_CHAR(tm.horario::timestamptz AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS fecha_exacta,
                TO_CHAR(tm.horario::timestamptz AT TIME ZONE 'America/Santiago', 'HH24:MI') AS horario_programado,
                tm.verificado,
                tm.fecha_real_toma
            FROM tomas_medicamentos tm
            JOIN medicamentos m ON tm.medicamento_id = m.id
            WHERE tm.user_id = ${user_id}
              -- 👇 FILTRO DE RANGO SEMANAL 👇
              -- Trae desde las 00:00:00 de hoy en Chile hasta 7 días más adelante
              AND tm.horario::timestamptz AT TIME ZONE 'America/Santiago' >= (CURRENT_DATE AT TIME ZONE 'America/Santiago')
              AND tm.horario::timestamptz AT TIME ZONE 'America/Santiago' < (CURRENT_DATE + INTERVAL '7 days')
            ORDER BY tm.horario ASC;
        `;
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Error crítico en GET /usuario/:user_id/historial:", error);
        res.status(500).json({ error: "Error al mapear e indexar el historial" });
    }
});

export default router;