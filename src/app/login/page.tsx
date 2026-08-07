import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ERROR_MESSAGES: Record<string, string> = {
  domain: 'Solo cuentas @marosconstruction.com pueden acceder.',
  oauth: 'No se pudo completar el inicio de sesión. Intenta de nuevo.',
};

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.oauth : null;

  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Maros Construction</CardTitle>
          <CardDescription>Sign in with your Google Workspace account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          )}
          <a
            href="/api/auth/google"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.9l6.5 5.5C41.9 36.1 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Iniciar sesión con Google
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
