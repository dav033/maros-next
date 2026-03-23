
import { createPatch } from "@/lib/patch";
import type { Lead, LeadPatch } from "../models";
import type { ISODate } from "@/shared/domain";
import { normalizeEmptyToUndefined } from "@/shared/mappers";
import { isIsoLocalDate, coerceIsoLocalDate } from "@/shared/validation";


export function diffToPatch(current: Lead, updated: Lead): LeadPatch {
  
  // Normalizar startDate para comparación - siempre devolver un formato consistente
  const normalizeStartDate = (date: string | null | undefined): string | null => {
    if (!date) return null;
    try {
      const normalized = coerceIsoLocalDate(date);
      return isIsoLocalDate(normalized) ? normalized : null;
    } catch {
      return null;
    }
  };

  const normalizedCurrentStartDate = normalizeStartDate(current.startDate);
  const normalizedUpdatedStartDate = normalizeStartDate(updated.startDate);

  // Comparar startDate directamente antes de crear el patch
  const startDateChanged = normalizedCurrentStartDate !== normalizedUpdatedStartDate;
  const startDateIsValid = normalizedUpdatedStartDate !== null && isIsoLocalDate(normalizedUpdatedStartDate);

  const flattenedUpdated = {
    name: updated.name,
    location: updated.location ?? "",
    addressLink: updated.addressLink ?? null,
    status: updated.status,
    // No incluir startDate en los objetos flattened para evitar que createPatch lo procese
    projectTypeId: updated.projectType.id,
    contactId: updated.contact.id,
    leadNumber: updated.leadNumber ?? "",
    notes: updated.notes,
  };
  
  
  const flattenedCurrent = {
    name: current.name,
    location: current.location ?? "",
    addressLink: current.addressLink ?? null,
    status: current.status,
    // No incluir startDate en los objetos flattened para evitar que createPatch lo procese
    projectTypeId: current.projectType.id,
    contactId: current.contact.id,
    leadNumber: current.leadNumber ?? "",
    notes: current.notes,
  };

  
  const basePatch = createPatch(flattenedCurrent, flattenedUpdated, {
    location: normalizeEmptyToUndefined,
    leadNumber: (v: string) => {
      const normalized = normalizeEmptyToUndefined(v);
      return normalized ?? null;
    },
  }) as Record<string, any>;

  // Construir el patch final con startDate si es necesario
  const patch: Record<string, any> = { ...basePatch };

  // Normalizar cambios de contactId:
  // - Si contactId pasa a 0, interpretamos que el lead queda sin contacto asociado
  //   y enviamos null al backend para que elimine la relación.
  if ("contactId" in patch) {
    if (patch.contactId === 0) {
      patch.contactId = null;
    }
  }

  // Manejar startDate por separado, solo si cambió y es válido
  // IMPORTANTE: Solo incluir startDate si realmente cambió y ambos valores están normalizados correctamente
  if (startDateChanged && normalizedCurrentStartDate !== null && normalizedUpdatedStartDate !== null) {
    // Solo incluir si el valor actualizado es válido
    if (startDateIsValid) {
      patch.startDate = normalizedUpdatedStartDate as ISODate;
    }
    // Si no es válido, no incluir en el patch (mantener el valor actual)
  } else if (startDateChanged && normalizedCurrentStartDate !== null && normalizedUpdatedStartDate === null) {
    // Si cambió de un valor a null, permitir establecer a null
    patch.startDate = null;
  } else if (startDateChanged && normalizedCurrentStartDate === null && normalizedUpdatedStartDate !== null && startDateIsValid) {
    // Si cambió de null a un valor válido, incluir en el patch
    patch.startDate = normalizedUpdatedStartDate as ISODate;
  }
  // En cualquier otro caso (incluyendo cuando ambos son null o iguales), no incluir startDate en el patch

  
  if (JSON.stringify(updated.notes) !== JSON.stringify(current.notes)) {
    patch.notes = updated.notes;
  } else {
    delete patch.notes;
  }

  return patch as LeadPatch;
}
