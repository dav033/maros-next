# Scripts de Configuración

## prepare-deps.js

Este script configura automáticamente la dependencia `@dav033/dav-components` según el entorno:

- **Desarrollo**: Si existe el directorio local `../davComponents`, usa el paquete local (`file:../davComponents`)
- **Producción**: Usa el paquete publicado en npm (`@dav033/dav-components`)

### Detección de Entorno

El script detecta producción cuando:
- `NODE_ENV === 'production'`
- `CI === 'true'` (entornos CI/CD)
- `VERCEL === '1'` (despliegue en Vercel)
- `NETLIFY === 'true'` (despliegue en Netlify)

### Uso

El script se ejecuta automáticamente antes de `npm run dev` y `npm run build`.

También puedes ejecutarlo manualmente:
```bash
npm run prepare-deps
```

Si el script detecta que necesita actualizar las dependencias, te pedirá que ejecutes `npm install`.

