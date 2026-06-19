# Plan de Tests — Frontend (maros-next)

> Objetivo: **que un deploy en Netlify nunca rompa** ni en build ni en runtime.
> El orden de prioridad es: que compile (`next build`), que las páginas rendericen,
> que la lógica de dominio no regrese, y que los flujos críticos (login, crear
> lead+contacto, manejo de errores de API) funcionen.

---

## 1. Estado actual

| Aspecto | Estado |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TS |
| Tooling de test | **Ninguno** (ni Jest, ni Vitest, ni Playwright) |
| Tests existentes | **0** |
| CI | **No existe** |
| Deploy | Netlify: `npm run build` → publica `.next`; `NEXT_PUBLIC_API_BASE_URL` por contexto (prod/preview) |
| Scripts útiles ya presentes | `typecheck` (`tsc --noEmit`), `lint` (`eslint .`) |
| Aliases TS | `@/*` → `src/*` y barrels por feature (`@/contact`, `@/leads`, …) — **el runner debe resolverlos** |

---

## 2. Estrategia (pirámide)

```
        ╱╲   Tier 4: E2E (Playwright)        — login + crear lead, pocos
       ╱──╲  Tier 3: Render de páginas/rutas (smoke)
      ╱────╲ Tier 2: Componentes + hooks (Testing Library)
     ╱──────╲Tier 1: Unit de dominio puro (sin React)  ← máximo ROI
    ╱────────╲Tier 0: Estático (typecheck + lint + build) ← bloquea el 70% de deploys rotos
```

**Deploy-safety:** Tier 0 es obligatorio y casi gratis (los scripts ya existen).
Tier 1 da el mayor retorno: la lógica de negocio del frontend está en módulos
**puros** (`features/*/domain/services`, `shared/errors`, `shared/validation`),
testeables sin DOM ni red.

---

## 3. Herramientas a añadir

Recomendado **Vitest** (rápido, soporta TS/ESM y aliases nativamente, mejor encaje
con Next 16/React 19 que Jest):

```bash
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths \
  @testing-library/react @testing-library/dom @testing-library/user-event \
  @testing-library/jest-dom jsdom
# E2E:
npm i -D @playwright/test && npx playwright install --with-deps chromium
```

### Config `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()], // resuelve @/* y barrels de tsconfig
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'], // importa @testing-library/jest-dom
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### Scripts en `package.json`
```jsonc
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"verify": "npm run lint && npm run typecheck && npm run test && npm run build"
```
`verify` = **el gate de deploy**.

---

## 4. Tier 0 — Gates estáticos (implementar PRIMERO)

Ya existen `typecheck` y `lint`. Falta **encadenarlos al deploy**:

1. `npm run typecheck` — `tsc --noEmit` sin errores.
2. `npm run lint` — ESLint sin errores (ojo: hay reglas de `boundaries` que pueden romper build).
3. `npm run build` — `next build` debe completar. **Este es el gate #1**: la mayoría de roturas de deploy se cazan aquí (imports rotos, módulos faltantes como el incidente de `react-hook-form`, server/client component mal marcado).

> Netlify ya corre `npm run build`; el objetivo es **fallar antes** (en CI/local)
> con typecheck+lint+test para no gastar un deploy roto.

---

## 5. Tier 1 — Unit de dominio puro (MÁXIMO ROI, sin React)

Módulos puros, fáciles y de alto valor. Incluye **regresiones que ya arreglamos**.

| Archivo de test | Qué cubre | Regresión que protege |
|---|---|---|
| `src/shared/errors/errorMessages.test.ts` | `resolveUserMessage`: para `code:VALIDATION_ERROR` con `serverMessage` → devuelve el **mensaje del servidor** (no el genérico); sin serverMessage → genérico; prioridad code > status > genérico. | Bug del mensaje "Algunos campos no son válidos" que ocultaba el motivo real |
| `src/shared/errors/AppError.test.ts` | `AppError.from`: axios 400 con `code` → `kind:'validation'`, `code`, `serverMessage`; 401 → `unauthorized`; sin response → `network`; cancel → `canceled`; extrae `fieldErrors`. | Contrato de errores de toda la app |
| `src/features/leads/domain/services/buildLeadDraft.test.ts` | `buildLeadDraftForNewContact`/`ExistingContact`: arma draft con startDate, normaliza contacto, valida nombre ≤140. | Construcción de lead |
| `src/features/leads/domain/services/leadNumberPolicy.test.ts` | `makeLeadNumber(null)→null`; normaliza/valida; `ensureLeadNumberAvailable` lanza CONFLICT si existe. | Política de número de lead |
| `src/features/leads/domain/services/ensureLeadDraftIntegrity.test.ts` | startDate requerido/ISO; nombre largo → FORMAT_ERROR; contact xor contactId. | Integridad del draft |
| `src/features/leads/domain/services/leadContactLinkPolicy.test.ts` | `normalizeNewContact` deja solo name/phone/email/companyId; `ensureExclusiveContactLink`. | Que no se envíen campos extra al backend (evita 400 por whitelist) |
| `src/features/leads/infra/http/mappers.test.ts` | `mapLeadDraftToCreatePayload`: estructura del payload (contacto anidado, companyId solo si entero>0). | Forma del body que espera el backend |

> Estos ~7 archivos solos ya blindan la lógica más frágil del frontend.

---

## 6. Tier 2 — Componentes y hooks (Testing Library)

`jsdom`. Mockear la capa HTTP (`optimizedApiClient`) — **nunca** pegar a la API real.

| Test | Qué cubre |
|---|---|
| `useFormController.test.tsx` | submit OK invalida queries y llama `onSuccess`; error → `error` = `e.message`; `canSubmit`/`isLoading`. |
| `useCreateLeadController.test.tsx` | modo NEW_CONTACT vs EXISTING_CONTACT arma el `input` correcto; cambiar de modo limpia campos. |
| `login/page.test.tsx` | render del form; al enviar password llama `loginAction`; muestra `state.error`. *(Quitar antes el label de debug `_debug-env` si sigue en el código.)* |
| `EntityFormModal.test.tsx` | valida con zod (`zodResolver`), muestra errores de campo, submit deshabilitado si inválido. |

> Para hooks con React Query, envolver en `QueryClientProvider` y los providers DI
> (`DiProvider`) con repos mockeados.

---

## 7. Tier 3 — Smoke de render de rutas

Objetivo deploy-safety: que las páginas **no exploten al renderizar** (errores de
SSR/Client boundary, hooks mal usados). Para App Router conviene testear los
componentes de página de forma aislada con sus providers mockeados, o vía Playwright
(Tier 4). Mínimo:
- Render de `app/login/page.tsx`, y de las vistas de lista (leads, contactos,
  empresas, proyectos) con datos mock → sin throw, contenido base visible.

---

## 8. Tier 4 — E2E (Playwright contra build real)

`playwright.config.ts` con `webServer` que levante `next build && next start` y un
backend mockeado (o `NEXT_PUBLIC_API_BASE_URL` apuntando a un mock server / MSW).

Flujos mínimos:
1. **Login**: password correcta → redirige a `/dashboard`; incorrecta → muestra error.
2. **Crear lead + contacto nuevo**: rellenar form, enviar, ver toast de éxito.
3. **Error de duplicado**: backend mock devuelve `code:VALIDATION_ERROR` con
   `message:"Ya existe un contacto con ese teléfono"` → la UI muestra **ese** texto
   (no el genérico). Regresión directa del fix de mensajes.

> Usar **MSW** (`msw`) para simular el backend de forma determinista es lo más
> robusto para E2E de frontend sin depender del backend real.

---

## 9. CI / Gate de deploy (GitHub Actions + Netlify)

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test            # Vitest (Tier 0–2)
      - run: npm run build           # next build
      # E2E en job aparte (instala Playwright + MSW)
```
- En Netlify: marcar **"Stop builds"** si el CI falla, o usar Netlify build plugin
  para correr `npm run test` antes de `build`.
- Configurar **deploy previews** para validar cada rama antes de producción.

---

## 10. Plan de implementación por fases

| Fase | Entregable | Esfuerzo | Prioridad |
|---|---|---|---|
| **F0** | Vitest + config + aliases + script `verify` + CI con typecheck/lint/build | 0.5 día | 🔴 Crítica |
| **F1** | Unit de dominio puro (tabla §5, incluye regresiones de errores) | 1.5 días | 🟠 Alta |
| **F2** | Hooks y componentes clave (§6) con HTTP mockeado | 1.5 días | 🟡 Media |
| **F3** | Playwright + MSW: login, crear lead, error de duplicado | 1.5 días | 🟡 Media |
| **F4** | Smoke de render de vistas de lista + subir cobertura | 1 día | 🟢 Baja |

---

## 11. Criterios de aceptación

- [ ] `npm run verify` pasa local y en CI.
- [ ] `next build` corre en CI **antes** de gastar un deploy de Netlify.
- [ ] Tests de regresión para: `resolveUserMessage` (mensaje real vs genérico), `AppError.from`, payload de lead, política de número de lead.
- [ ] E2E cubre login + crear lead + error de duplicado mostrando el mensaje correcto.
- [ ] CI bloquea merge/deploy si algo falla.
- [ ] Cobertura objetivo: ≥70% en `shared/errors`, `features/leads/domain`, `features/contact/domain`.

---

## 12. Notas / riesgos a cubrir

- **Incidente `react-hook-form`** (módulo a medio instalar): el gate `next build`
  en CI lo habría cazado antes del deploy. Es el mejor argumento para el Tier 0.
- **`NEXT_PUBLIC_API_BASE_URL`**: añadir un test que verifique el fallback
  (`http://localhost:4000/api`) y que en prod/preview se usa el de `netlify.toml`.
- **Server vs Client components**: el build falla si un `'use client'` usa APIs de
  server o viceversa; `next build` en CI lo detecta.
- **Limpieza pendiente**: el label de debug `AUTH_PASSWORD` y el endpoint
  `_debug-env` deben eliminarse antes de producción; añadir un test/lint que
  falle si `_debug-env` o el texto `AUTH_PASSWORD:` siguen en el código.
