// Lista de medicamentos de alto riesgo (basada en categorías "high-alert" tipo ISMP:
// insulina, opioides, anticoagulantes, antiarrítmicos/digitálicos de margen estrecho,
// litio, antipsicóticos con riesgo hematológico). Para estos medicamentos no se permite
// que el usuario defina libremente cada cuántas horas se toman: el intervalo viene fijo
// acá y solo se puede elegir la hora de la primera toma.
//
// La coincidencia es por `principio_activo` (normalizado: minúsculas, sin acentos),
// usando substring para cubrir variantes como "insulina glargina" o "warfarina sódica".
// Ajustar/agregar entradas acá según corresponda.

export interface MedicamentoRiesgo {
    principioActivo: string;
    frecuenciaHorasFija: number;
    motivo: string;
}

export const MEDICAMENTOS_RIESGO: MedicamentoRiesgo[] = [
    { principioActivo: 'insulina', frecuenciaHorasFija: 12, motivo: 'Insulina: una dosificación irregular puede causar hipo o hiperglucemia severa' },
    { principioActivo: 'warfarina', frecuenciaHorasFija: 24, motivo: 'Anticoagulante de margen terapéutico estrecho' },
    { principioActivo: 'heparina', frecuenciaHorasFija: 12, motivo: 'Anticoagulante de alto riesgo de sangrado' },
    { principioActivo: 'morfina', frecuenciaHorasFija: 4, motivo: 'Opioide: riesgo de depresión respiratoria' },
    { principioActivo: 'oxicodona', frecuenciaHorasFija: 6, motivo: 'Opioide: riesgo de depresión respiratoria' },
    { principioActivo: 'fentanilo', frecuenciaHorasFija: 72, motivo: 'Opioide de alta potencia' },
    { principioActivo: 'tramadol', frecuenciaHorasFija: 6, motivo: 'Opioide: riesgo de convulsiones y depresión respiratoria' },
    { principioActivo: 'digoxina', frecuenciaHorasFija: 24, motivo: 'Margen terapéutico estrecho, riesgo de toxicidad cardíaca' },
    { principioActivo: 'litio', frecuenciaHorasFija: 12, motivo: 'Margen terapéutico estrecho, riesgo de toxicidad neurológica' },
    { principioActivo: 'clozapina', frecuenciaHorasFija: 12, motivo: 'Riesgo de agranulocitosis y sedación severa' },
];

const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

function normalizar(texto: string): string {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(DIACRITICOS, '');
}

export function buscarRiesgoPorPrincipioActivo(principioActivo: string | null | undefined): MedicamentoRiesgo | null {
    if (!principioActivo) return null;
    const normalizado = normalizar(principioActivo);
    return MEDICAMENTOS_RIESGO.find(m => normalizado.includes(m.principioActivo)) ?? null;
}
