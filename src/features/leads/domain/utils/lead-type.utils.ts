import { LeadType } from "../models";

/**
 * Determina el tipo de lead basándose en el formato del leadNumber.
 * 
 * Patrones:
 * - 053-1025 → CONSTRUCTION (formato estándar sin prefijo)
 * - 053R-1025 → ROOFING (prefijo 'R')
 * - 053P-1025 → PLUMBING (prefijo 'P')
 * 
 * @param leadNumber - El número de lead a analizar
 * @returns El tipo de lead o null si no se puede determinar
 */
export function getLeadTypeFromNumber(leadNumber: string | null | undefined): LeadType | null {
  if (!leadNumber || typeof leadNumber !== 'string') {
    return null;
  }

  const trimmed = leadNumber.trim();
  
  // Patrón para ROOFING: número seguido de 'R-' y más números
  // Ejemplo: 053R-1025
  if (/^\d+R-\d+$/.test(trimmed)) {
    return LeadType.ROOFING;
  }

  // Patrón para PLUMBING: número seguido de 'P-' y más números
  // Ejemplo: 053P-1025
  if (/^\d+P-\d+$/.test(trimmed)) {
    return LeadType.PLUMBING;
  }

  // Patrón para CONSTRUCTION: número seguido de '-' y más números (sin prefijo)
  // Ejemplo: 053-1025
  if (/^\d+-\d+$/.test(trimmed)) {
    return LeadType.CONSTRUCTION;
  }

  // Si no coincide con ningún patrón, retornar null
  return null;
}

/**
 * Filtra leads por tipo basándose en su leadNumber
 */
export function filterLeadsByType<T extends { leadNumber?: string | null }>(
  leads: T[],
  type: LeadType
): T[] {
  return leads.filter((lead) => getLeadTypeFromNumber(lead.leadNumber) === type);
}

/**
 * Genera un leadNumber con el formato correcto según el tipo.
 * El formato se determina automáticamente, pero esta función puede usarse
 * para validar que el número proporcionado coincide con el tipo esperado.
 * 
 * Nota: La generación real del número se hace en el backend.
 * Esta función solo valida el formato.
 */
export function validateLeadNumberFormatForType(
  leadNumber: string | null | undefined,
  expectedType: LeadType
): boolean {
  if (!leadNumber) return true; // Si no hay número, el backend lo generará
  const actualType = getLeadTypeFromNumber(leadNumber);
  return actualType === expectedType;
}

