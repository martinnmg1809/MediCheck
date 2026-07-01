import { Router, Request, Response } from 'express';
import { sql } from '../db/database';
import fs from 'fs';
import path from 'path';
import { error } from 'console';
import { buscarRiesgoPorPrincipioActivo } from '../config/medicamentosRiesgo';


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

// Determina la frecuencia (horas) real a usar para un medicamento dado.
// Si el medicamento es de alto riesgo, IGNORA lo que haya mandado el cliente
// y fuerza el intervalo predefinido (nunca confiar en ese dato desde el front).
// También valida que la frecuencia sea un número positivo, evitando que
// `24 / frecuencia_horas` produzca Infinity/NaN.
async function resolverFrecuenciaHoras(
    medicamento_id: number,
    frecuenciaSolicitada: number
): Promise<{ frecuencia: number } | { error: string }> {
    const medResult = await sql`
        SELECT principio_activo FROM medicamentos WHERE id = ${medicamento_id}
    `;

    if (medResult.length === 0) {
        return { error: "Medicamento no encontrado en el catálogo." };
    }

    const riesgo = buscarRiesgoPorPrincipioActivo(medResult[0].principio_activo);
    if (riesgo) {
        return { frecuencia: riesgo.frecuenciaHorasFija };
    }

    const frecuenciaNum = Number(frecuenciaSolicitada);
    if (!Number.isFinite(frecuenciaNum) || frecuenciaNum <= 0) {
        return { error: "La frecuencia (cada cuántas horas) debe ser un número mayor a 0." };
    }

    return { frecuencia: frecuenciaNum };
}

// 1. REGISTRAR UN NUEVO TRATAMIENTO Y SUS TOMAS (POST /api/tomas)
router.post('/', async (req: Request, res: Response): Promise<void> => {
    let idTratamientoCreado: number | null = null;
    try {
        const { user_id, medicamento_id, tratamiento, horario_inicio_iso, frecuencia_horas, duracion_dias } = req.body;

        if(baneoPalabras(tratamiento)){
            res.status(400).json({error: "Nombre de tratamiento inapropiado"});
            return;
        }

        if (!tratamiento) {
            res.status(400).json({ error: "El nombre del tratamiento es requerido." });
            return;
        }

        const duracionNum = Number(duracion_dias);
        if (!Number.isFinite(duracionNum) || duracionNum <= 0) {
            res.status(400).json({ error: "La duración debe ser un número de días mayor a 0." });
            return;
        }

        const resultadoFrecuencia = await resolverFrecuenciaHoras(medicamento_id, frecuencia_horas);
        if ('error' in resultadoFrecuencia) {
            res.status(400).json({ error: resultadoFrecuencia.error });
            return;
        }
        const frecuenciaHorasFinal = resultadoFrecuencia.frecuencia;

        const tratamientoResult = await sql`
            INSERT INTO tratamientos (user_id, nombre, activo)
            VALUES (${user_id}, ${tratamiento}, true)
            RETURNING id
        `;

        idTratamientoCreado = tratamientoResult[0].id;

        const tomasPorDia = 24 / frecuenciaHorasFinal;
        const tomasTotales = Math.round(tomasPorDia * duracionNum);

        let fechaActual = new Date(horario_inicio_iso);

        for (let i = 0; i < tomasTotales; i++) {
            const fechaCompleta = fechaActual.toISOString();
            await sql`
                INSERT INTO tomas_medicamentos (user_id, medicamento_id, tratamiento_id, horario)
                VALUES (${user_id}, ${medicamento_id}, ${idTratamientoCreado}, ${fechaCompleta}::timestamptz)
            `;
            fechaActual = new Date(fechaActual.getTime() + frecuenciaHorasFinal * 3_600_000);
        }

        res.status(201).json({ message: "Tratamiento y tomas programadas con éxito" });

    } catch (error: any) {
        console.error("Error crítico en POST /api/tomas:", error);
        // Si el tratamiento ya fue creado pero los inserts de tomas fallaron,
        // eliminarlo para evitar registros huérfanos que bloqueen reintentos.
        if (idTratamientoCreado !== null) {
            try {
                await sql`DELETE FROM tomas_medicamentos WHERE tratamiento_id = ${idTratamientoCreado}`;
                await sql`DELETE FROM tratamientos WHERE id = ${idTratamientoCreado}`;
            } catch (cleanupErr) {
                console.error("Error limpiando tratamiento huérfano:", cleanupErr);
            }
        }
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
        
        const user_id = result[0].user_id;
        const med_id = result[0].medicamento_id;
        const tratamiento_id = result[0].tratamiento_id;

        const pendientes = await sql `
            SELECT COUNT(*) as pendientes
            FROM tomas_medicamentos
            WHERE user_id = ${user_id} and medicamento_id=${med_id} and verificado = FALSE
        `
        const total_pendientes = parseInt(pendientes[0].pendientes, 10)

        if (total_pendientes === 0) {
            await sql `
                UPDATE tratamientos
                SET activo = FALSE
                WHERE user_id = ${user_id} and id=${tratamiento_id}
            `
            res.status(200).json({message: "Tratamiento completado"});
            console
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
                tm.horario AS horario_iso,
                tm.verificado,
                tm.fecha_real_toma
            FROM tomas_medicamentos tm
            JOIN medicamentos m ON tm.medicamento_id = m.id
            WHERE tm.user_id = ${user_id}
              AND (
                -- Tomas pendientes de cualquier fecha (para que el usuario pueda recuperarlas)
                tm.verificado = FALSE
                OR
                -- Tomas verificadas dentro de la ventana de 7 días
                (
                  tm.horario::timestamptz AT TIME ZONE 'America/Santiago' >= (CURRENT_DATE AT TIME ZONE 'America/Santiago')
                  AND tm.horario::timestamptz AT TIME ZONE 'America/Santiago' < (CURRENT_DATE + INTERVAL '7 days')
                )
              )
            ORDER BY tm.horario ASC;
        `;
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Error crítico en GET /usuario/:user_id/historial:", error);
        res.status(500).json({ error: "Error al mapear e indexar el historial" });
    }
});
// 3. EDITAR TRATAMIENTO (PUT /api/tomas/tratamiento/:tratamiento_id)
// Borra tomas futuras no verificadas y regenera con nuevos datos
router.put('/tratamiento/:tratamiento_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { tratamiento_id } = req.params;
        const { medicamento_id, tratamiento, horario_inicio_iso, frecuencia_horas, duracion_dias } = req.body;

        if (baneoPalabras(tratamiento)) {
            res.status(400).json({ error: "Nombre de tratamiento inapropiado" });
            return;
        }

        const resultadoFrecuencia = await resolverFrecuenciaHoras(medicamento_id, frecuencia_horas);
        if ('error' in resultadoFrecuencia) {
            res.status(400).json({ error: resultadoFrecuencia.error });
            return;
        }
        const frecuenciaHorasFinal = resultadoFrecuencia.frecuencia;

        // Actualizar nombre del tratamiento
        await sql`
            UPDATE tratamientos
            SET nombre = ${tratamiento}
            WHERE id = ${tratamiento_id}
        `;

        // Borrar solo las tomas futuras NO verificadas
        await sql`
            DELETE FROM tomas_medicamentos
            WHERE tratamiento_id = ${tratamiento_id}
              AND verificado = FALSE
              AND horario > NOW()
        `;

        // Regenerar tomas con los nuevos datos
        const duracionNum = Number(duracion_dias);
        const tomasPorDia = 24 / frecuenciaHorasFinal;
        const tomasTotales = Math.round(tomasPorDia * duracionNum);

        let fechaActual = new Date(horario_inicio_iso);

        for (let i = 0; i < tomasTotales; i++) {
            const fechaCompleta = fechaActual.toISOString();
            await sql`
                INSERT INTO tomas_medicamentos (user_id, medicamento_id, tratamiento_id, horario)
                SELECT user_id, ${medicamento_id}, ${tratamiento_id}, ${fechaCompleta}::timestamptz
                FROM tratamientos WHERE id = ${tratamiento_id}
            `;
            fechaActual = new Date(fechaActual.getTime() + frecuenciaHorasFinal * 3_600_000);
        }
        res.status(200).json({ message: "Tratamiento actualizado con éxito" });

    } catch (error) {
        console.error("Error en PUT /tratamiento/:id:", error);
        res.status(500).json({ error: "Error al editar el tratamiento" });
    }
});


// 4. ELIMINAR TRATAMIENTO (DELETE /api/tomas/tratamiento/:tratamiento_id)
router.delete('/tratamiento/:tratamiento_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { tratamiento_id } = req.params;

        // Primero borra las tomas asociadas (por integridad referencial)
        await sql`
            DELETE FROM tomas_medicamentos
            WHERE tratamiento_id = ${tratamiento_id}
        `;

        // Luego borra el tratamiento
        const result = await sql`
            DELETE FROM tratamientos
            WHERE id = ${tratamiento_id}
            RETURNING *
        `;

        if (result.length === 0) {
            res.status(404).json({ error: "Tratamiento no encontrado" });
            return;
        }

        res.status(200).json({ message: "Tratamiento eliminado correctamente" });

    } catch (error) {
        console.error("Error en DELETE /tratamiento/:id:", error);
        res.status(500).json({ error: "Error al eliminar el tratamiento" });
    }
});


// 5. HISTORIAL CON CUMPLIMIENTO (GET /api/tomas/usuario/:user_id/cumplimiento)
router.get('/usuario/:user_id/cumplimiento', async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params;

        const result = await sql`
            SELECT 
                t.id AS tratamiento_id,
                t.nombre AS tratamiento_nombre,
                t.activo,
                m.nombre_comercial,
                m.principio_activo,
                m.concentracion,
                COUNT(tm.id) AS total_tomas,
                COUNT(CASE WHEN tm.verificado = TRUE THEN 1 END) AS tomas_verificadas,
                ROUND(
                    COUNT(CASE WHEN tm.verificado = TRUE THEN 1 END)::numeric 
                    / NULLIF(COUNT(tm.id), 0) * 100, 1
                ) AS porcentaje_cumplimiento,
                MAX(tm.fecha_real_toma) AS ultima_toma_real
            FROM tratamientos t
            JOIN tomas_medicamentos tm ON t.id = tm.tratamiento_id
            JOIN medicamentos m ON tm.medicamento_id = m.id
            WHERE t.user_id = ${user_id}
            GROUP BY t.id, t.nombre, t.activo, m.nombre_comercial, m.principio_activo, m.concentracion
            ORDER BY t.activo DESC, ultima_toma_real DESC NULLS LAST
        `;

        res.status(200).json(result);

    } catch (error) {
        console.error("Error en GET /cumplimiento:", error);
        res.status(500).json({ error: "Error al obtener el historial de cumplimiento" });
    }
});
// GET /api/tomas/tratamiento/:tratamiento_id — obtener datos de un tratamiento para editar
router.get('/tratamiento/:tratamiento_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { tratamiento_id } = req.params;

        const result = await sql`
            SELECT 
                t.id,
                t.nombre,
                tm.medicamento_id,
                TO_CHAR(MIN(tm.horario)::timestamptz AT TIME ZONE 'America/Santiago', 'HH24:MI') AS horario_inicio,
                COUNT(DISTINCT DATE_TRUNC('day', tm.horario)) AS duracion_dias
            FROM tratamientos t
            JOIN tomas_medicamentos tm ON t.id = tm.tratamiento_id
            WHERE t.id = ${tratamiento_id}
            GROUP BY t.id, t.nombre, tm.medicamento_id
        `;

        if (result.length === 0) {
            res.status(404).json({ error: "Tratamiento no encontrado" });
            return;
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error("Error en GET /tratamiento/:id:", error);
        res.status(500).json({ error: "Error al obtener el tratamiento" });
    }
});
// 6. DETALLE DE TOMAS DE UN TRATAMIENTO (GET /api/tomas/tratamiento/:tratamiento_id/tomas)
router.get('/tratamiento/:tratamiento_id/tomas', async (req: Request, res: Response): Promise<void> => {
    try {
        const { tratamiento_id } = req.params;

        const result = await sql`
            SELECT
                tm.id,
                m.nombre_comercial,
                m.principio_activo,
                m.concentracion,
                TO_CHAR(tm.horario::timestamptz AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD') AS fecha,
                TO_CHAR(tm.horario::timestamptz AT TIME ZONE 'America/Santiago', 'HH24:MI')    AS horario_programado,
                tm.verificado,
                TO_CHAR(tm.fecha_real_toma AT TIME ZONE 'America/Santiago', 'YYYY-MM-DD')      AS fecha_real,
                TO_CHAR(tm.fecha_real_toma AT TIME ZONE 'America/Santiago', 'HH24:MI')         AS hora_real
            FROM tomas_medicamentos tm
            JOIN medicamentos m ON tm.medicamento_id = m.id
            WHERE tm.tratamiento_id = ${tratamiento_id}
            ORDER BY tm.horario ASC;
        `;

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en GET /tratamiento/:id/tomas:', error);
        res.status(500).json({ error: 'Error al obtener el detalle del tratamiento.' });
    }
});

export default router;