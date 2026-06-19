export type FieldErrors = Record<string, string[]>;

export const GENERIC_ERROR_MESSAGE =
  "Algo salió mal. Intenta de nuevo en unos segundos.";

const STATUS_MESSAGES: Record<number, string> = {
  0: "Sin conexión. Revisa tu internet e intenta de nuevo.",
  400: "Los datos enviados no son válidos. Revisa el formulario.",
  401: "Tu sesión expiró. Inicia sesión nuevamente.",
  402: "Esta acción requiere un plan superior o pago pendiente.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  408: "La operación tardó demasiado. Intenta de nuevo.",
  409: "Ya existe un registro con esos datos.",
  410: "Este recurso ya no está disponible.",
  413: "El archivo es demasiado grande.",
  415: "El formato de archivo no es compatible.",
  422: "Algunos campos no son válidos. Revisa el formulario.",
  423: "El recurso está bloqueado por otra operación.",
  425: "Esta acción se realizó demasiado pronto. Intenta de nuevo.",
  429: "Demasiados intentos. Espera un momento e intenta de nuevo.",
  500: "Algo salió mal de nuestro lado. Estamos trabajando para resolverlo.",
  501: "Esta función aún no está disponible.",
  502: "El servicio no responde. Intenta en unos minutos.",
  503: "El servicio no está disponible en este momento.",
  504: "El servicio tardó demasiado en responder. Intenta de nuevo.",
};

const CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Algunos campos no son válidos. Revisa el formulario.",
  DATABASE_ERROR: "Hubo un problema guardando los datos. Intenta de nuevo.",
  qbo_connection_required:
    "QuickBooks no está conectado o necesita autorización. Vuelve a conectar QuickBooks.",
  QBO_REAUTHORIZATION_REQUIRED:
    "QuickBooks necesita autorización. Vuelve a conectar QuickBooks.",
  NETWORK_ERROR: "Sin conexión. Revisa tu internet e intenta de nuevo.",
  TIMEOUT: "La operación tardó demasiado. Intenta de nuevo.",
  CANCELED: "La operación fue cancelada.",
  tool_execution_failed:
    "No se pudo completar la acción. Intenta de nuevo más tarde.",
};

export function messageForStatus(status: number | undefined): string | undefined {
  if (status === undefined) return undefined;
  return STATUS_MESSAGES[status];
}

export function messageForCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return CODE_MESSAGES[code];
}

// Códigos cuyo mensaje del servidor es una razón de negocio legible para el
// usuario (p. ej. "Contact name already exists"). Para estos preferimos mostrar
// el mensaje específico del backend antes que la copia genérica, que oculta el
// motivo real y confunde (parece un error de formato cuando es un duplicado).
const PREFER_SERVER_MESSAGE_CODES = new Set(["VALIDATION_ERROR"]);

export function resolveUserMessage(input: {
  status?: number;
  code?: string;
  serverMessage?: string;
}): string {
  if (
    input.code &&
    PREFER_SERVER_MESSAGE_CODES.has(input.code) &&
    input.serverMessage &&
    input.serverMessage.trim() !== ""
  ) {
    return input.serverMessage;
  }
  return (
    messageForCode(input.code) ??
    messageForStatus(input.status) ??
    GENERIC_ERROR_MESSAGE
  );
}
