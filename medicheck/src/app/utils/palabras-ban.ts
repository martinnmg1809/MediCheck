const PALABRAS_BANEADAS = [
  'puta', 'concha', 'perra', 'nigga', 'weon',
  'sacowea', 'scw', 'aweonao', 'nigger'
];

export function contienePalabraBaneada(texto: string): boolean {
  if (!texto) return false;
  const lower = texto.toLowerCase();
  return PALABRAS_BANEADAS.some(p => lower.includes(p));
}
