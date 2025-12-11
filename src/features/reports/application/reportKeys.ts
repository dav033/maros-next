export const reportsKeys = {
  all: ["reports"] as const,
  restorationVisit: (leadNumber: string | null) =>
    [...reportsKeys.all, "restoration-visit", leadNumber ?? ""] as const,
  restorationFinal: (leadNumber: string | null) =>
    [...reportsKeys.all, "restoration-final", leadNumber ?? ""] as const,
};







