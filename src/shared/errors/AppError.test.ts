import { describe, expect, it } from "vitest";

import { AppError } from "./AppError";

/**
 * Construye un objeto que `axios.isAxiosError` reconoce (marca `isAxiosError`).
 */
function axiosError(opts: {
  status?: number;
  data?: unknown;
  message?: string;
  code?: string;
}) {
  return {
    isAxiosError: true,
    message: opts.message ?? "Request failed",
    code: opts.code,
    response:
      opts.status === undefined
        ? undefined
        : { status: opts.status, data: opts.data ?? {} },
  };
}

describe("AppError.from", () => {
  it("devuelve el mismo AppError si ya lo es", () => {
    const original = new AppError({ userMessage: "x", kind: "unknown" });
    expect(AppError.from(original)).toBe(original);
  });

  it("mapea un 400 con code VALIDATION_ERROR mostrando el serverMessage", () => {
    const err = AppError.from(
      axiosError({
        status: 400,
        data: {
          statusCode: 400,
          message: "Ya existe un contacto con ese teléfono: 5550000",
          code: "VALIDATION_ERROR",
        },
      }),
    );
    expect(err.kind).toBe("validation");
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.userMessage).toBe(
      "Ya existe un contacto con ese teléfono: 5550000",
    );
  });

  it("mapea un 401 a kind unauthorized", () => {
    const err = AppError.from(axiosError({ status: 401, data: {} }));
    expect(err.kind).toBe("unauthorized");
    expect(err.status).toBe(401);
    expect(err.userMessage).toBe("Tu sesión expiró. Inicia sesión nuevamente.");
  });

  it("mapea un error sin response a kind network", () => {
    const err = AppError.from(axiosError({ message: "Network Error" }));
    expect(err.kind).toBe("network");
    expect(err.code).toBe("NETWORK_ERROR");
  });

  it("extrae fieldErrors del body", () => {
    const err = AppError.from(
      axiosError({
        status: 422,
        data: { errors: { email: ["no es válido"], phone: ["requerido"] } },
      }),
    );
    expect(err.fieldErrors).toEqual({
      email: ["no es válido"],
      phone: ["requerido"],
    });
  });

  it("une un message array en serverMessage", () => {
    const err = AppError.from(
      axiosError({
        status: 400,
        data: { message: ["campo a inválido", "campo b inválido"] },
      }),
    );
    expect(err.serverMessage).toBe("campo a inválido, campo b inválido");
  });

  it("mapea un Error genérico de red por su mensaje", () => {
    const err = AppError.from(new Error("fetch failed"));
    expect(err.kind).toBe("network");
  });

  it("mapea un Error desconocido a kind unknown", () => {
    const err = AppError.from(new Error("algo raro"));
    expect(err.kind).toBe("unknown");
    expect(err.serverMessage).toBe("algo raro");
  });
});
