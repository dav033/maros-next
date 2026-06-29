import { describe, expect, it } from "vitest";

import {
  GENERIC_ERROR_MESSAGE,
  messageForCode,
  messageForStatus,
  resolveUserMessage,
} from "./errorMessages";

describe("messageForStatus", () => {
  it("devuelve el mensaje mapeado para un status conocido", () => {
    expect(messageForStatus(404)).toBe("No encontramos lo que buscabas.");
    expect(messageForStatus(422)).toBe(
      "Algunos campos no son válidos. Revisa el formulario.",
    );
  });

  it("devuelve undefined para status desconocido o ausente", () => {
    expect(messageForStatus(418)).toBeUndefined();
    expect(messageForStatus(undefined)).toBeUndefined();
  });
});

describe("messageForCode", () => {
  it("mapea códigos de negocio conocidos", () => {
    expect(messageForCode("VALIDATION_ERROR")).toBe(
      "Algunos campos no son válidos. Revisa el formulario.",
    );
  });

  it("devuelve undefined para código desconocido o vacío", () => {
    expect(messageForCode("NOPE")).toBeUndefined();
    expect(messageForCode(undefined)).toBeUndefined();
  });
});

describe("resolveUserMessage", () => {
  // Regresión: un VALIDATION_ERROR con mensaje específico del backend debe
  // mostrar ESE mensaje (no el genérico que ocultaba el motivo real, p. ej.
  // "Ya existe un contacto con ese teléfono").
  it("prefiere el serverMessage cuando el code es VALIDATION_ERROR", () => {
    expect(
      resolveUserMessage({
        status: 400,
        code: "VALIDATION_ERROR",
        serverMessage: "Ya existe un contacto con ese teléfono: 5550000",
      }),
    ).toBe("Ya existe un contacto con ese teléfono: 5550000");
  });

  it("usa el mensaje genérico del code si no hay serverMessage", () => {
    expect(resolveUserMessage({ code: "VALIDATION_ERROR" })).toBe(
      "Algunos campos no son válidos. Revisa el formulario.",
    );
  });

  it("ignora un serverMessage vacío y cae al genérico del code", () => {
    expect(
      resolveUserMessage({ code: "VALIDATION_ERROR", serverMessage: "   " }),
    ).toBe("Algunos campos no son válidos. Revisa el formulario.");
  });

  it("prioriza code sobre status", () => {
    expect(resolveUserMessage({ status: 500, code: "TIMEOUT" })).toBe(
      "La operación tardó demasiado. Intenta de nuevo.",
    );
  });

  it("cae al mensaje de status cuando no hay code", () => {
    expect(resolveUserMessage({ status: 404 })).toBe(
      "No encontramos lo que buscabas.",
    );
  });

  it("cae al mensaje genérico cuando no hay code ni status conocidos", () => {
    expect(resolveUserMessage({})).toBe(GENERIC_ERROR_MESSAGE);
    expect(resolveUserMessage({ status: 418 })).toBe(GENERIC_ERROR_MESSAGE);
  });
});
