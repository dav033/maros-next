import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-dark">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold text-theme-light">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-theme-light">
          Página no encontrada
        </h2>
        <p className="mb-8 text-theme-light/70">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-theme-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}


